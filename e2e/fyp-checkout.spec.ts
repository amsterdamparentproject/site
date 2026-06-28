/**
 * First Year Program checkout — E2E
 *
 * Tests the checkout flows end-to-end:
 *   expecting_monthly  — €25 deposit, deferred subscription
 *   expecting_bundle   — €305/€383 upfront
 *   baby_deposit       — €25 deposit, subscription deferred to PROGRAM_START (Sep 2026)
 *                        (replaces baby_monthly while current date < 2026-09-01)
 *   baby_bundle        — €305/€383 upfront; billing_start_date = 2026-09-01 before Sep 2026
 *
 * Each test:
 *   1. Fills the on-page join form (name, email, month, year)
 *   2. Selects a plan card if needed, then clicks the submit button → new Stripe tab opens
 *   3. Fills in the Stripe email and test card
 *   4. Completes payment
 *   5. Lands on /programs/first-year/welcome
 *   6. Verifies the account record in firstyear.accounts
 *
 * Prerequisites:
 *   - `stripe listen --forward-to localhost:3001/api/webhooks/stripe/fyp` running
 *   - Stripe test mode prices fyp_monthly_single + fyp_monthly_multi must exist
 *   - Coupon STRIPE_FYP_DEPOSIT_COUPON_ID must exist in test mode
 *   - NEXT_PUBLIC_TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY in .env.test.local
 */

import { test, expect, type Page } from "@playwright/test";
import {
  cleanupAccountByEmail,
  getAccountByEmail,
  getMembersByAccountId,
  type FYPAccount,
} from "./helpers/fyp-db";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Fill the on-page join form: name/email fields + month/year selects.
 * Situation (expecting vs baby_here) is auto-derived from the date.
 */
async function fillJoinForm(
  page: Page,
  details: {
    firstName: string;
    lastName: string;
    email: string;
    monthLabel: string; // e.g. "October"
    year: string; // e.g. "2026"
  },
) {
  const joinSection = page.locator("#join");

  await joinSection.locator("#first-name").fill(details.firstName);
  await joinSection.locator("#last-name").fill(details.lastName);
  await joinSection.locator("#email").fill(details.email);

  const monthSelect = joinSection.locator("#due-month");
  const yearSelect = joinSection.locator("select").nth(1);
  await monthSelect.waitFor({ state: "visible", timeout: 10_000 });
  await monthSelect.selectOption({ label: details.monthLabel });
  await yearSelect.selectOption({ label: details.year });
}

/**
 * Optionally click a plan card by its name, then click the single submit button.
 * Returns the new Stripe checkout tab.
 *
 * @param planCardName - If provided, clicks the plan card with this label first.
 *   Pass undefined to use whichever card is already selected (default = bundle).
 */
async function selectPlanAndCheckout(
  page: Page,
  planCardName?: string | RegExp,
): Promise<Page> {
  const joinSection = page.locator("#join");

  if (planCardName) {
    await joinSection
      .getByRole("button", { name: planCardName })
      .waitFor({ state: "visible", timeout: 10_000 });
    await joinSection.getByRole("button", { name: planCardName }).click();
  }

  // Match the submit button specifically — the arrow (→) distinguishes it from
  // plan card buttons whose accessible names may include "Reserve your spot" in
  // their billing text.
  const submitButton = joinSection.getByRole("button", {
    name: /reserve your spot →|sign up →/i,
  });
  await submitButton.waitFor({ state: "visible", timeout: 10_000 });

  const [checkoutPage] = await Promise.all([
    page.context().waitForEvent("page", { timeout: 45_000 }),
    submitButton.click(),
  ]);
  await checkoutPage.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
  return checkoutPage;
}

/**
 * Fill the Stripe hosted checkout form and submit.
 * Month/year are collected on the APP page (no longer Stripe custom fields).
 *
 * Card inputs live in Shadow DOM on Stripe's hosted checkout — accessible via
 * Playwright's locator engine but not via document.querySelectorAll.
 */
async function completeStripeCheckout(
  checkoutPage: Page,
  opts: { email?: string; name?: string },
) {
  await checkoutPage.waitForLoadState("domcontentloaded", { timeout: 20_000 });

  // ── Email ──────────────────────────────────────────────────────────────
  if (opts.email) {
    const emailInput = checkoutPage.locator("#email");
    await emailInput.waitFor({ timeout: 10_000 });
    await emailInput.fill(opts.email);
  }

  // ── Payment card ───────────────────────────────────────────────────────
  const isCardSelected = await checkoutPage
    .locator("#payment-method-accordion-item-title-card")
    .isChecked()
    .catch(() => false);

  if (!isCardSelected) {
    const cardRowCenter = await checkoutPage.evaluate(() => {
      const radio = document.getElementById(
        "payment-method-accordion-item-title-card",
      );
      if (!radio) return null;
      const rect = radio.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    if (cardRowCenter) {
      await checkoutPage.mouse.click(cardRowCenter.x, cardRowCenter.y);
    }
    await checkoutPage.waitForTimeout(1_000);
  }

  await checkoutPage
    .getByPlaceholder("1234 1234 1234 1234")
    .waitFor({ timeout: 10_000 });
  await checkoutPage
    .getByPlaceholder("1234 1234 1234 1234")
    .pressSequentially("4242424242424242");
  await checkoutPage.getByPlaceholder("MM / YY").pressSequentially("1226");
  await checkoutPage.getByPlaceholder("CVC").pressSequentially("123");

  const nameInput = checkoutPage.getByPlaceholder("Full name on card");
  if (await nameInput.isVisible()) {
    await nameInput.fill(opts.name ?? "Test Parent");
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  const payButton = checkoutPage.locator('button[type="submit"]').first();
  await expect(payButton).toBeEnabled({ timeout: 10_000 });
  await payButton.scrollIntoViewIfNeeded();
  await payButton.click();
}

/**
 * Poll the DB for an account by email until it appears or a timeout is reached.
 * Webhook delivery can take several seconds.
 */
async function waitForAccount(
  email: string,
  timeoutMs = 20_000,
): Promise<FYPAccount | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const account = await getAccountByEmail(email);
    if (account) return account;
    await new Promise((r) => setTimeout(r, 1_000));
  }
  return null;
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

// Expecting flows: use a future month (valid for "Still expecting")
const EXPECTING_MONTH = "October";
const EXPECTING_YEAR = "2026";

// Baby flows: use a past month (valid for "Baby's here")
const BABY_MONTH = "May";
const BABY_YEAR = "2026";

const BASE_EMAIL = `e2e-fyp-${Date.now()}`;

const EMAILS = {
  expecting_monthly: `${BASE_EMAIL}-exp-monthly@example.com`,
  expecting_monthly_single: `${BASE_EMAIL}-exp-monthly-single@example.com`,
  expecting_bundle: `${BASE_EMAIL}-exp-bundle@example.com`,
  baby_deposit: `${BASE_EMAIL}-baby-deposit@example.com`,
  baby_bundle: `${BASE_EMAIL}-baby-bundle@example.com`,
};

const BASE_URL = "http://localhost:3001";
const SKIP_CLEANUP = process.env.E2E_SKIP_CLEANUP === "1";

/**
 * Pre-compile a route in the dev server so the first real request doesn't pay
 * the cold on-demand compile cost.
 */
async function warmRoute(path: string, attempts = 12): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, { method: "GET" });
      if (res.status < 500) return;
    } catch {
      /* connection refused while the route is still compiling */
    }
    await new Promise((r) => setTimeout(r, 1_500));
  }
}

test.beforeAll(async () => {
  test.setTimeout(150_000);

  if (!SKIP_CLEANUP) {
    await Promise.all(Object.values(EMAILS).map(cleanupAccountByEmail));
  }

  await warmRoute("/programs/first-year/welcome");
  await warmRoute("/api/webhooks/stripe/fyp");
});

test.afterAll(async () => {
  if (SKIP_CLEANUP) return;
  await Promise.all(Object.values(EMAILS).map(cleanupAccountByEmail));
});

// ---------------------------------------------------------------------------
// expecting_monthly
// ---------------------------------------------------------------------------

test("expecting_monthly (multi): deposit → deferred subscription created", async ({
  page,
}) => {
  await page.goto("/programs/first-year#join");

  await fillJoinForm(page, {
    firstName: "Test",
    lastName: "Parent",
    email: EMAILS.expecting_monthly,
    monthLabel: EXPECTING_MONTH,
    year: EXPECTING_YEAR,
  });
  // Default selected flow is expecting_bundle; switch to monthly
  const checkoutPage = await selectPlanAndCheckout(page, /monthly plan/i);

  await completeStripeCheckout(checkoutPage, {
    email: EMAILS.expecting_monthly,
  });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");
  await expect(
    checkoutPage.getByRole("heading", { name: /first year program/i }),
  ).toBeVisible({ timeout: 45_000 });

  const account = await waitForAccount(EMAILS.expecting_monthly);
  expect(account).not.toBeNull();
  expect(account?.flow).toBe("expecting_monthly");
  expect(account?.plan_type).toBe("monthly");
  expect(account?.family_type).toBe("multi");
  expect(account?.stripe_subscription_id).toBeTruthy();
  expect(account?.billing_start_date).toBe("2026-11-01");
  expect(account?.status).toBe("active");

  const members = await getMembersByAccountId(account!.id);
  expect(members).toHaveLength(1);
  expect(members[0].first_name).toBe("Test");
  expect(members[0].last_name).toBe("Parent");
  expect(members[0].email).toBe(EMAILS.expecting_monthly);
  expect(members[0].status).toBe("active");
});

// ---------------------------------------------------------------------------
// expecting_monthly (single parent)
// ---------------------------------------------------------------------------

test("expecting_monthly (single): deposit → deferred subscription created", async ({
  page,
}) => {
  await page.goto("/programs/first-year#join");

  await fillJoinForm(page, {
    firstName: "Test",
    lastName: "SingleParent",
    email: EMAILS.expecting_monthly_single,
    monthLabel: EXPECTING_MONTH,
    year: EXPECTING_YEAR,
  });

  // Toggle single parent
  await page
    .locator("#join")
    .getByRole("button", { name: /single parent/i })
    .click();

  const checkoutPage = await selectPlanAndCheckout(page, /monthly plan/i);

  await completeStripeCheckout(checkoutPage, {
    email: EMAILS.expecting_monthly_single,
  });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");

  const account = await waitForAccount(EMAILS.expecting_monthly_single);
  expect(account?.family_type).toBe("single");
  expect(account?.flow).toBe("expecting_monthly");

  const members = await getMembersByAccountId(account!.id);
  expect(members).toHaveLength(1);
  expect(members[0].first_name).toBe("Test");
  expect(members[0].last_name).toBe("SingleParent");
  expect(members[0].email).toBe(EMAILS.expecting_monthly_single);
  expect(members[0].status).toBe("active");
});

// ---------------------------------------------------------------------------
// expecting_bundle
// ---------------------------------------------------------------------------

test("expecting_bundle (multi): upfront payment → account created with bundle_expires_at", async ({
  page,
}) => {
  await page.goto("/programs/first-year#join");

  await fillJoinForm(page, {
    firstName: "Test",
    lastName: "Bundle",
    email: EMAILS.expecting_bundle,
    monthLabel: EXPECTING_MONTH,
    year: EXPECTING_YEAR,
  });
  // expecting_bundle is the default selected flow — click submit directly
  const checkoutPage = await selectPlanAndCheckout(page);

  await completeStripeCheckout(checkoutPage, {
    email: EMAILS.expecting_bundle,
  });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");

  const account = await waitForAccount(EMAILS.expecting_bundle);
  expect(account?.flow).toBe("expecting_bundle");
  expect(account?.plan_type).toBe("bundle");
  expect(account?.billing_start_date).toBe("2026-11-01");
  expect(account?.bundle_expires_at).toBe("2027-05-01");
  expect(account?.stripe_subscription_id).toBeNull();

  const members = await getMembersByAccountId(account!.id);
  expect(members).toHaveLength(1);
  expect(members[0].first_name).toBe("Test");
  expect(members[0].last_name).toBe("Bundle");
  expect(members[0].email).toBe(EMAILS.expecting_bundle);
  expect(members[0].status).toBe("active");
});

// ---------------------------------------------------------------------------
// baby_deposit (replaces baby_monthly before PROGRAM_START = 2026-09-01)
// ---------------------------------------------------------------------------

test("baby_deposit (multi): deposit → subscription deferred to Sep 2026", async ({
  page,
}) => {
  await page.goto("/programs/first-year#join");

  await fillJoinForm(page, {
    firstName: "Test",
    lastName: "BabyDeposit",
    email: EMAILS.baby_deposit,
    monthLabel: BABY_MONTH,
    year: BABY_YEAR,
  });
  // Default for baby_here is baby_bundle; switch to monthly (baby_deposit)
  const checkoutPage = await selectPlanAndCheckout(page, /monthly plan/i);

  await completeStripeCheckout(checkoutPage, {
    email: EMAILS.baby_deposit,
  });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");

  const account = await waitForAccount(EMAILS.baby_deposit);
  expect(account).not.toBeNull();
  expect(account?.flow).toBe("baby_deposit");
  expect(account?.plan_type).toBe("monthly");
  expect(account?.family_type).toBe("multi");
  expect(account?.stripe_subscription_id).toBeTruthy();
  expect(account?.billing_start_date).toBe("2026-09-01");
  expect(account?.status).toBe("active");

  const members = await getMembersByAccountId(account!.id);
  expect(members).toHaveLength(1);
  expect(members[0].first_name).toBe("Test");
  expect(members[0].last_name).toBe("BabyDeposit");
  expect(members[0].email).toBe(EMAILS.baby_deposit);
  expect(members[0].status).toBe("active");
});

// ---------------------------------------------------------------------------
// baby_bundle
// ---------------------------------------------------------------------------

test("baby_bundle (multi): upfront payment → account with billing_start_date Sep 2026", async ({
  page,
}) => {
  await page.goto("/programs/first-year#join");

  await fillJoinForm(page, {
    firstName: "Test",
    lastName: "BabyBundle",
    email: EMAILS.baby_bundle,
    monthLabel: BABY_MONTH,
    year: BABY_YEAR,
  });
  // baby_bundle is the default for baby_here — click submit directly
  const checkoutPage = await selectPlanAndCheckout(page);

  await completeStripeCheckout(checkoutPage, {
    email: EMAILS.baby_bundle,
  });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");

  const account = await waitForAccount(EMAILS.baby_bundle);
  expect(account?.flow).toBe("baby_bundle");
  expect(account?.plan_type).toBe("bundle");
  // Before PROGRAM_START: billing deferred to Sep 2026, bundle runs 6 months from there
  expect(account?.billing_start_date).toBe("2026-09-01");
  expect(account?.bundle_expires_at).toBe("2027-03-01");
  expect(account?.stripe_subscription_id).toBeNull();

  const members = await getMembersByAccountId(account!.id);
  expect(members).toHaveLength(1);
  expect(members[0].first_name).toBe("Test");
  expect(members[0].last_name).toBe("BabyBundle");
  expect(members[0].email).toBe(EMAILS.baby_bundle);
  expect(members[0].status).toBe("active");
});

// ---------------------------------------------------------------------------
// Welcome page
// ---------------------------------------------------------------------------

test("welcome page renders with PDF download", async ({ page }) => {
  await page.goto("/programs/first-year/welcome");
  await expect(
    page.getByRole("heading", { name: /first year program/i }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /download/i })).toHaveAttribute(
    "href",
    /understanding-the-village\.pdf/,
  );
});

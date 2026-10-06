/**
 * First Year Program checkout — E2E
 *
 * Tests the checkout flows end-to-end:
 *   expecting_bundle   — €305/€383 upfront; billing starts the month after the due date
 *   baby_bundle        — €305/€383 upfront; billing_start_date = today
 *
 * Checkout is bundle-only since Oct 2026; the monthly flows return 400 (covered
 * by the unit tests in __tests__/api/checkout/fyp.test.ts).
 *
 * Each test:
 *   1. Fills the on-page join form (name, email, month, year)
 *   2. Selects a plan card if needed, then clicks the submit button → new Stripe tab opens
 *   3. Fills in the Stripe email and test card
 *   4. Completes payment
 *   5. Lands on /programs/first-year/welcome
 *   6. Verifies the account record in firstyear.accounts
 *
 * The expecting_bundle test additionally continues the journey one step
 * further: the welcome page auto-signs in (no click, see AutoHubRedirect) and
 * lands authenticated on /hub/home. This is the one place that proves a
 * `stripe_session_id` written by a *real* checkout webhook — not a
 * directly-seeded one — actually resolves through getWelcomeHubSignInLink
 * (see hub-welcome-signin.spec.ts, which covers the same auto-redirect's
 * fallback paths via seeded accounts instead). Not repeated for baby_bundle —
 * the sign-in step doesn't vary by plan, so one full round trip is enough.
 *
 * Prerequisites:
 *   - `stripe listen --forward-to localhost:3000/api/webhooks/stripe/fyp` running
 *   - NEXT_PUBLIC_TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY in .env.test
 */

import { test, expect, type Page } from "@playwright/test";
import {
  cleanupAccountByEmail,
  getAccountByEmail,
  getMembersByAccountId,
  e2eTestEmail,
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

  // Wait for the form to fully settle — Next.js streaming can transiently
  // duplicate elements before hydration completes.
  await expect(joinSection.locator("form")).toHaveCount(1, { timeout: 10_000 });

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

  const submitButton = joinSection.getByRole("button", {
    name: /sign up →/i,
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
  // Stripe hides #email when customer_email is pre-set on the session.
  if (opts.email) {
    const emailInput = checkoutPage.locator("#email");
    if (await emailInput.isVisible()) {
      await emailInput.fill(opts.email);
    }
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

// Expecting flows: a due date three months out, so it stays a valid "Still
// expecting" date whenever the suite runs.
const dueDate = new Date();
dueDate.setUTCDate(1);
dueDate.setUTCMonth(dueDate.getUTCMonth() + 3);
const EXPECTING_MONTH = dueDate.toLocaleString("en-US", {
  month: "long",
  timeZone: "UTC",
});
const EXPECTING_YEAR = String(dueDate.getUTCFullYear());
// The webhook starts billing on the 1st of the month after the due month.
const EXPECTING_BILLING_START = new Date(
  Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth() + 1, 1),
)
  .toISOString()
  .slice(0, 10);

// Baby flows: use a past month (valid for "Baby's here")
const BABY_MONTH = "May";
const BABY_YEAR = "2026";

/** Today as "YYYY-MM-DD", matching the webhook's own `toISOString().slice(0, 10)`. */
function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Mirrors addSixMonths() in app/api/webhooks/stripe/fyp/route.ts. */
function addSixMonthsIso(date: string): string {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + 6);
  d.setUTCDate(1);
  return d.toISOString().slice(0, 10);
}

const BASE_EMAIL = `e2e-fyp-${Date.now()}`;

const EMAILS = {
  expecting_bundle: e2eTestEmail(`${BASE_EMAIL}-exp-bundle`),
  baby_bundle: e2eTestEmail(`${BASE_EMAIL}-baby-bundle`),
};

const BASE_URL = "http://localhost:3000";
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

  await warmRoute("/programs/first-year");
  await warmRoute("/programs/first-year/welcome");
  await warmRoute("/api/webhooks/stripe/fyp");
});

test.afterAll(async () => {
  if (SKIP_CLEANUP) return;
  await Promise.all(Object.values(EMAILS).map(cleanupAccountByEmail));
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

  // ── Continue the journey: welcome page auto-signs in, no click, no
  // email step — lands on /hub/home, then Account tab proves it's the
  // right member ──
  await checkoutPage.waitForURL(/\/hub\/home/, { timeout: 45_000 });

  const account = await waitForAccount(EMAILS.expecting_bundle);
  expect(account?.flow).toBe("expecting_bundle");
  expect(account?.plan_type).toBe("bundle");
  expect(account?.billing_start_date).toBe(EXPECTING_BILLING_START);
  expect(account?.bundle_expires_at).toBe(
    addSixMonthsIso(EXPECTING_BILLING_START),
  );
  expect(account?.stripe_subscription_id).toBeNull();

  const members = await getMembersByAccountId(account!.id);
  expect(members).toHaveLength(1);
  expect(members[0].first_name).toBe("Test");
  expect(members[0].last_name).toBe("Bundle");
  expect(members[0].email).toBe(EMAILS.expecting_bundle);
  expect(members[0].status).toBe("active");

  // Scoped to the tab nav specifically — the ?welcome=1 banner shown for
  // multi-parent families (see the (account) layout's WelcomeBanner) has
  // its own inline "Account" link nudging the same tab, so a bare
  // getByRole("link", { name: "Account" }) matches two elements here.
  await checkoutPage
    .getByRole("navigation")
    .getByRole("link", { name: "Account" })
    .click();
  await expect(checkoutPage).toHaveURL(/\/hub\/account/, { timeout: 20_000 });
  await expect(checkoutPage.getByText("Test Bundle")).toBeVisible();
  await expect(checkoutPage.getByText(EMAILS.expecting_bundle)).toBeVisible();
});

// ---------------------------------------------------------------------------
// baby_bundle
// ---------------------------------------------------------------------------

test("baby_bundle (multi): upfront payment → account with billing_start_date today", async ({
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
  // Baby's already here: access starts today and the bundle runs 6 months.
  const today = todayIsoDate();
  expect(account?.billing_start_date).toBe(today);
  expect(account?.bundle_expires_at).toBe(addSixMonthsIso(today));
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

test("welcome page with no session_id auto-redirects to the plain sign-in gate", async ({
  page,
}) => {
  // Simplified 2026-07-31 — this page no longer renders any marketing copy
  // or a button to check (see AutoHubRedirect, renamed from GoToHubButton).
  // Full happy-path coverage (real session_id → auto sign-in → /hub/home)
  // is the first test above; the no-session_id fallback is covered more
  // thoroughly in hub-welcome-signin.spec.ts — this is just a smoke check
  // that this route doesn't error for a plain visit.
  await page.goto("/programs/first-year/welcome");
  await expect(page).toHaveURL(/\/hub$/, { timeout: 15_000 });
  await expect(page.getByText(/sign in to the first year hub/i)).toBeVisible();
});

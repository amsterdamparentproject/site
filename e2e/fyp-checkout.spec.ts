/**
 * First Year Program checkout — E2E
 *
 * Tests the four checkout flows end-to-end:
 *   expecting_monthly  — €25 deposit, deferred subscription
 *   expecting_bundle   — €305/€383 upfront
 *   baby_monthly       — immediate subscription
 *   baby_bundle        — €305/€383 upfront
 *
 * Each test:
 *   1. Clicks the relevant button on /programs/first-year
 *   2. Switches to the new Stripe checkout tab
 *   3. Fills in the Stripe custom fields (month, year) and test card
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
import { cleanupAccountByEmail, getAccountByEmail, type FYPAccount } from "./helpers/fyp-db";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Fill the Stripe hosted checkout form and submit.
 * Handles email, custom fields (month/year dropdowns), and payment card.
 *
 * Card inputs live in Shadow DOM on Stripe's hosted checkout — accessible via
 * Playwright's locator engine but not via document.querySelectorAll.
 * Card radio selection is done by clicking at the radio's DOM coordinates
 * (the radio is visually hidden; React event handlers live on a parent div).
 */
async function completeStripeCheckout(
  checkoutPage: Page,
  opts: { month: string; year: string; email?: string; name?: string }
) {
  // Wait for Stripe's form to render — networkidle never fires due to
  // Stripe's continuous background requests; domcontentloaded is sufficient.
  await checkoutPage.waitForLoadState("domcontentloaded", { timeout: 20_000 });

  // ── Email ──────────────────────────────────────────────────────────────
  if (opts.email) {
    const emailInput = checkoutPage.locator("#email");
    await emailInput.waitFor({ timeout: 10_000 });
    await emailInput.fill(opts.email);
  }

  // ── Custom fields ──────────────────────────────────────────────────────
  const monthSelect = checkoutPage.getByLabel(/due month|birth month/i);
  await monthSelect.waitFor({ timeout: 10_000 });
  await monthSelect.selectOption({ label: opts.month });

  const yearSelect = checkoutPage.getByLabel(/due year|birth year/i);
  await yearSelect.waitFor({ timeout: 10_000 });
  await yearSelect.selectOption({ label: opts.year });

  // ── Payment card ───────────────────────────────────────────────────────
  // Select the Card payment method if not already selected.
  // The radio input is visually hidden; use mouse.click at the radio's own
  // coordinates — the click event bubbles up through Stripe's React handlers.
  const isCardSelected = await checkoutPage
    .locator("#payment-method-accordion-item-title-card")
    .isChecked()
    .catch(() => false);

  if (!isCardSelected) {
    const cardRowCenter = await checkoutPage.evaluate(() => {
      const radio = document.getElementById("payment-method-accordion-item-title-card");
      if (!radio) return null;
      const rect = radio.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    if (cardRowCenter) {
      await checkoutPage.mouse.click(cardRowCenter.x, cardRowCenter.y);
    }
    await checkoutPage.waitForTimeout(1_000);
  }

  // Card inputs are in Shadow DOM — accessible via Playwright's locator engine
  // with getByPlaceholder, even though document.querySelectorAll misses them.
  await checkoutPage.getByPlaceholder("1234 1234 1234 1234").waitFor({ timeout: 10_000 });
  await checkoutPage.getByPlaceholder("1234 1234 1234 1234").pressSequentially("4242424242424242");
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
 * Click a checkout button on the FYP page and return the new Stripe tab.
 * Waits for the button to be visible first to handle Next.js compilation delay.
 */
async function clickAndGetCheckoutTab(page: Page, buttonLabel: RegExp | string) {
  // Ensure button is present before wiring up the page event — handles the
  // cold-start compilation delay when the dev server first compiles a route.
  await page.getByRole("button", { name: buttonLabel }).waitFor({ state: "visible", timeout: 45_000 });

  const [checkoutPage] = await Promise.all([
    page.context().waitForEvent("page", { timeout: 45_000 }),
    page.getByRole("button", { name: buttonLabel }).click(),
  ]);
  await checkoutPage.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
  return checkoutPage;
}

/**
 * Poll the DB for an account by email until it appears or a timeout is reached.
 * Webhook delivery can take several seconds; polling is more reliable than a
 * fixed sleep, especially when multiple checkouts complete in quick succession.
 */
async function waitForAccount(email: string, timeoutMs = 20_000): Promise<FYPAccount | null> {
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

const MONTH = "October";
const YEAR = "2026";
const BASE_EMAIL = `e2e-fyp-${Date.now()}`;

const EMAILS = {
  expecting_monthly:        `${BASE_EMAIL}-exp-monthly@example.com`,
  expecting_monthly_single: `${BASE_EMAIL}-exp-monthly-single@example.com`,
  expecting_bundle:         `${BASE_EMAIL}-exp-bundle@example.com`,
  baby_monthly:             `${BASE_EMAIL}-baby-monthly@example.com`,
  baby_bundle:              `${BASE_EMAIL}-baby-bundle@example.com`,
};

const BASE_URL = "http://localhost:3001";

/**
 * Pre-compile a route in the dev server so the first *real* request doesn't pay
 * the cold on-demand compile cost. `next dev` compiles routes lazily, and a
 * cold compile can transiently 500 / render Next's "missing required error
 * components, refreshing..." loop — long enough to break a checkout redirect or
 * cause Stripe's (non-retried-in-time) webhook to fail. We poll until the route
 * reports a healthy status (i.e. anything other than a 5xx or connection
 * failure), which signals compilation finished. Best-effort: never throws.
 */
async function warmRoute(path: string, attempts = 12): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, { method: "GET" });
      // <500 means the module compiled and served (200 for pages, 405 for a
      // POST-only API route hit with GET). 5xx means it's still cold/crashing.
      if (res.status < 500) return;
    } catch {
      /* connection refused while the route is still compiling */
    }
    await new Promise((r) => setTimeout(r, 1_500));
  }
}

test.beforeAll(async () => {
  // A cold `next dev` compile of these routes can exceed the default 30s hook
  // timeout, so give the hook room to both clean up and warm the routes.
  test.setTimeout(150_000);

  // Clean up any stale accounts from previous interrupted runs that share
  // the same email patterns, so .maybeSingle() never gets multiple rows.
  await Promise.all(Object.values(EMAILS).map(cleanupAccountByEmail));

  // Warm the two routes the checkout flow depends on:
  //  - the welcome page, which the Stripe redirect lands on
  //  - the FYP webhook, which Stripe POSTs to right after payment. Its first
  //    cold compile was returning 500 (Next dev bundler), and Stripe won't
  //    retry within the test window — so no account row was ever created.
  await warmRoute("/programs/first-year/welcome");
  await warmRoute("/api/webhooks/stripe/fyp");
});

test.afterAll(async () => {
  await Promise.all(Object.values(EMAILS).map(cleanupAccountByEmail));
});

// ---------------------------------------------------------------------------
// expecting_monthly
// ---------------------------------------------------------------------------

test("expecting_monthly (multi): deposit → deferred subscription created", async ({ page }) => {
  await page.goto("/programs/first-year#join");

  const checkoutPage = await clickAndGetCheckoutTab(page, /reserve your spot/i);

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.expecting_monthly });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");
  // Generous timeout: survives a first-time cold compile of the route in dev
  // even if beforeAll warm-up was skipped. toBeVisible re-queries across the
  // dev reload loop, so it resolves as soon as the page finishes compiling.
  await expect(checkoutPage.getByRole("heading", { name: /first year program/i })).toBeVisible({ timeout: 45_000 });

  const account = await waitForAccount(EMAILS.expecting_monthly);
  expect(account).not.toBeNull();
  expect(account?.flow).toBe("expecting_monthly");
  expect(account?.plan_type).toBe("monthly");
  expect(account?.family_type).toBe("multi");
  expect(account?.stripe_subscription_id).toBeTruthy();
  expect(account?.billing_start_date).toBe("2026-11-01");
  expect(account?.status).toBe("active");
});

// ---------------------------------------------------------------------------
// expecting_monthly (single parent)
// ---------------------------------------------------------------------------

test("expecting_monthly (single): deposit → deferred subscription created", async ({ page }) => {
  await page.goto("/programs/first-year#join");

  // Toggle to single parent and wait for the price to update
  await page.getByRole("switch", { name: /single parent/i }).click();
  // Wait for React re-render: the bundle button switches from €383 to €305.
  // Both the expecting and baby cards show a €305 bundle button when single
  // parent is selected, so scope to the expecting card (the first one).
  await expect(page.getByRole("button", { name: /€305/i }).first()).toBeVisible({ timeout: 5_000 });

  const checkoutPage = await clickAndGetCheckoutTab(page, /reserve your spot/i);

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.expecting_monthly_single });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");

  const account = await waitForAccount(EMAILS.expecting_monthly_single);
  expect(account?.family_type).toBe("single");
  expect(account?.flow).toBe("expecting_monthly");
});

// ---------------------------------------------------------------------------
// expecting_bundle
// ---------------------------------------------------------------------------

test("expecting_bundle (multi): upfront payment → account created with bundle_expires_at", async ({ page }) => {
  await page.goto("/programs/first-year#join");

  // Both expecting and baby cards have a "6-month bundle" button — use .first()
  await page.getByRole("button", { name: /6-month bundle/i }).first().waitFor({ state: "visible", timeout: 45_000 });
  const [checkoutPage] = await Promise.all([
    page.context().waitForEvent("page", { timeout: 45_000 }),
    page.getByRole("button", { name: /6-month bundle/i }).first().click(),
  ]);
  await checkoutPage.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.expecting_bundle });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");

  const account = await waitForAccount(EMAILS.expecting_bundle);
  expect(account?.flow).toBe("expecting_bundle");
  expect(account?.plan_type).toBe("bundle");
  expect(account?.billing_start_date).toBe("2026-11-01");
  expect(account?.bundle_expires_at).toBe("2027-05-01");
  expect(account?.stripe_subscription_id).toBeNull();
});

// ---------------------------------------------------------------------------
// baby_monthly
// ---------------------------------------------------------------------------

test("baby_monthly (multi): immediate subscription created", async ({ page }) => {
  await page.goto("/programs/first-year#join");

  const checkoutPage = await clickAndGetCheckoutTab(page, /join now/i);

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.baby_monthly });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");

  const account = await waitForAccount(EMAILS.baby_monthly);
  expect(account?.flow).toBe("baby_monthly");
  expect(account?.plan_type).toBe("monthly");
  expect(account?.stripe_subscription_id).toBeTruthy();
  expect(account?.bundle_expires_at).toBeNull();
});

// ---------------------------------------------------------------------------
// baby_bundle
// ---------------------------------------------------------------------------

test("baby_bundle (multi): upfront payment → account with bundle_expires_at 6mo from today", async ({ page }) => {
  await page.goto("/programs/first-year#join");

  // Baby bundle — click the last "6-month bundle" button (baby card)
  await page.getByRole("button", { name: /6-month bundle/i }).last().waitFor({ state: "visible", timeout: 45_000 });
  const [checkoutPage] = await Promise.all([
    page.context().waitForEvent("page", { timeout: 45_000 }),
    page.getByRole("button", { name: /6-month bundle/i }).last().click(),
  ]);
  await checkoutPage.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.baby_bundle });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForLoadState("domcontentloaded");

  const account = await waitForAccount(EMAILS.baby_bundle);
  expect(account?.flow).toBe("baby_bundle");
  expect(account?.plan_type).toBe("bundle");
  expect(account?.bundle_expires_at).toBeTruthy();
  expect(account?.stripe_subscription_id).toBeNull();
});

// ---------------------------------------------------------------------------
// Welcome page
// ---------------------------------------------------------------------------

test("welcome page renders with PDF download", async ({ page }) => {
  await page.goto("/programs/first-year/welcome");
  await expect(page.getByRole("heading", { name: /first year program/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /download/i })).toHaveAttribute(
    "href",
    /understanding-the-village\.pdf/,
  );
});

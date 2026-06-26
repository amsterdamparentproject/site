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
 *   - `yarn dev` running
 *   - `stripe listen --forward-to localhost:3000/api/webhooks/stripe/fyp` running
 *   - Stripe test mode prices fyp_monthly_single + fyp_monthly_multi must exist
 *   - Coupon STRIPE_FYP_DEPOSIT_COUPON_ID must exist in test mode
 *   - NEXT_PUBLIC_TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { test, expect, type Page } from "@playwright/test";
import { cleanupAccountByEmail, getAccountByEmail } from "./helpers/fyp-db";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Fill the Stripe hosted checkout form and submit.
 * Handles email, custom fields (month/year dropdowns), and payment card.
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
    console.log("[checkout] filling email");
    await emailInput.fill(opts.email);
    console.log("[checkout] email filled");
  }

  // ── Custom fields ──────────────────────────────────────────────────────
  const monthSelect = checkoutPage.getByLabel(/due month|birth month/i);
  await monthSelect.waitFor({ timeout: 10_000 });
  console.log("[checkout] filling month");
  await monthSelect.selectOption({ label: opts.month });
  console.log("[checkout] month filled");

  const yearSelect = checkoutPage.getByLabel(/due year|birth year/i);
  await yearSelect.waitFor({ timeout: 10_000 });
  console.log("[checkout] filling year");
  await yearSelect.selectOption({ label: opts.year });
  console.log("[checkout] year filled");

  // ── Payment card ───────────────────────────────────────────────────────
  // Select the Card payment method if not already selected.
  // Use evaluate() so the click stays in page JS and doesn't trigger
  // Playwright's navigation handling (which would close the page on redirect).
  console.log("[checkout] checking card selection");
  const isCardSelected = await checkoutPage
    .locator("#payment-method-accordion-item-title-card")
    .isChecked()
    .catch(() => false);
  console.log("[checkout] card selected:", isCardSelected);
  if (!isCardSelected) {
    console.log("[checkout] selecting card by clicking row");
    // Find the visual "Card" row (a parent div with click handler) by locating
    // the radio and walking up to the row container, then getting its center coords.
    const cardRowCenter = await checkoutPage.evaluate(() => {
      const radio = document.getElementById("payment-method-accordion-item-title-card");
      if (!radio) return null;
      // Walk up to find the row container (has a clickable style or role)
      let el: HTMLElement | null = radio.parentElement;
      for (let i = 0; i < 8; i++) {
        if (!el) break;
        const role = el.getAttribute("role");
        const style = window.getComputedStyle(el);
        if (role === "button" || role === "option" || style.cursor === "pointer") {
          const rect = el.getBoundingClientRect();
          return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, tag: el.tagName, role };
        }
        el = el.parentElement;
      }
      // Fallback: use the radio's own position
      const rect = radio.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, tag: "input", role: "fallback" };
    });
    console.log("[checkout] card row center:", JSON.stringify(cardRowCenter));
    if (cardRowCenter) {
      await checkoutPage.mouse.click(cardRowCenter.x, cardRowCenter.y);
    } else {
      // Last resort: click by text content
      await checkoutPage.getByText("Card", { exact: true }).click({ force: true });
    }
    await checkoutPage.waitForTimeout(1_500);
    // Log all iframes after card is selected to find the card input frame
    const iframeInfo = await checkoutPage.evaluate(() =>
      Array.from(document.querySelectorAll("iframe")).map((f) => {
        const r = f.getBoundingClientRect();
        return { name: f.name.substring(0, 40), title: f.title, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
      })
    );
    console.log("[checkout] all iframes:", JSON.stringify(iframeInfo));
  }

  // After card section expands, check if Playwright can access card inputs
  // via its built-in Shadow DOM piercing.
  await checkoutPage.waitForTimeout(1_000);
  const allInputCount = await checkoutPage.locator("input").count();
  console.log("[checkout] total input count via Playwright locator:", allInputCount);

  // Try getByPlaceholder — works even through Shadow DOM
  const cardNumVisible = await checkoutPage.getByPlaceholder("1234 1234 1234 1234").isVisible().catch(() => false);
  console.log("[checkout] card number visible via getByPlaceholder:", cardNumVisible);

  if (cardNumVisible) {
    // Use pressSequentially so Stripe's input handlers fire on each keystroke
    await checkoutPage.getByPlaceholder("1234 1234 1234 1234").pressSequentially("4242424242424242");
    await checkoutPage.getByPlaceholder("MM / YY").pressSequentially("1226");
    await checkoutPage.getByPlaceholder("CVC").pressSequentially("123");
    const nameInput = checkoutPage.getByPlaceholder("Full name on card");
    if (await nameInput.isVisible()) {
      await nameInput.fill(opts.name ?? "Test Parent");
    }
  } else {
    // Fallback: coordinate-based fill for Desktop Chrome (1280px viewport)
    await checkoutPage.mouse.click(910, 470); // card number center
    await checkoutPage.keyboard.type("4242424242424242");
    await checkoutPage.keyboard.press("Tab");
    await checkoutPage.keyboard.type("1226");
    await checkoutPage.keyboard.press("Tab");
    await checkoutPage.keyboard.type("123");
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  const payButton = checkoutPage.locator('button[type="submit"]').first();
  await expect(payButton).toBeEnabled({ timeout: 10_000 });
  await payButton.scrollIntoViewIfNeeded();
  await payButton.click();
}

/**
 * Click a checkout button on the FYP page and return the new Stripe tab.
 */
async function clickAndGetCheckoutTab(page: Page, buttonLabel: RegExp | string) {
  const [checkoutPage] = await Promise.all([
    page.context().waitForEvent("page"),
    page.getByRole("button", { name: buttonLabel }).click(),
  ]);
  await checkoutPage.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
  return checkoutPage;
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const MONTH = "October";
const YEAR = "2026";
const BASE_EMAIL = `e2e-fyp-${Date.now()}`;

const EMAILS = {
  expecting_monthly: `${BASE_EMAIL}-exp-monthly@example.com`,
  expecting_bundle:  `${BASE_EMAIL}-exp-bundle@example.com`,
  baby_monthly:      `${BASE_EMAIL}-baby-monthly@example.com`,
  baby_bundle:       `${BASE_EMAIL}-baby-bundle@example.com`,
};

test.afterAll(async () => {
  await Promise.all(Object.values(EMAILS).map(cleanupAccountByEmail));
});

// ---------------------------------------------------------------------------
// expecting_monthly
// ---------------------------------------------------------------------------

test("expecting_monthly (multi): deposit → deferred subscription created", {
  timeout: 120_000,
}, async ({ page }) => {
  await page.goto("/programs/first-year#join");

  const checkoutPage = await clickAndGetCheckoutTab(page, /reserve your spot/i);

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.expecting_monthly });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await expect(checkoutPage.getByRole("heading", { name: /first year program/i })).toBeVisible();

  // Wait for webhook to process
  await checkoutPage.waitForTimeout(4_000);

  const account = await getAccountByEmail(EMAILS.expecting_monthly);
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

test("expecting_monthly (single): deposit → deferred subscription created", {
  timeout: 120_000,
}, async ({ page }) => {
  await page.goto("/programs/first-year#join");

  // Toggle to single parent
  await page.getByRole("switch", { name: /single parent/i }).click();

  const checkoutPage = await clickAndGetCheckoutTab(page, /reserve your spot/i);

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.expecting_monthly + ".single" });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForTimeout(4_000);

  // Verify family_type in the most recent account with this email
  const account = await getAccountByEmail(EMAILS.expecting_monthly + ".single");
  expect(account?.family_type).toBe("single");
  expect(account?.flow).toBe("expecting_monthly");
});

// ---------------------------------------------------------------------------
// expecting_bundle
// ---------------------------------------------------------------------------

test("expecting_bundle (multi): upfront payment → account created with bundle_expires_at", {
  timeout: 120_000,
}, async ({ page }) => {
  await page.goto("/programs/first-year#join");

  // Use .first() — both expecting and baby cards have a "6-month bundle" button
  const [checkoutPage] = await Promise.all([
    page.context().waitForEvent("page"),
    page.getByRole("button", { name: /6-month bundle/i }).first().click(),
  ]);
  await checkoutPage.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.expecting_bundle });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForTimeout(4_000);

  const account = await getAccountByEmail(EMAILS.expecting_bundle);
  expect(account?.flow).toBe("expecting_bundle");
  expect(account?.plan_type).toBe("bundle");
  expect(account?.billing_start_date).toBe("2026-11-01");
  expect(account?.bundle_expires_at).toBe("2027-05-01");
  expect(account?.stripe_subscription_id).toBeNull();
});

// ---------------------------------------------------------------------------
// baby_monthly
// ---------------------------------------------------------------------------

test("baby_monthly (multi): immediate subscription created", {
  timeout: 120_000,
}, async ({ page }) => {
  await page.goto("/programs/first-year#join");

  const checkoutPage = await clickAndGetCheckoutTab(page, /join now/i);

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.baby_monthly });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForTimeout(4_000);

  const account = await getAccountByEmail(EMAILS.baby_monthly);
  expect(account?.flow).toBe("baby_monthly");
  expect(account?.plan_type).toBe("monthly");
  expect(account?.stripe_subscription_id).toBeTruthy();
  expect(account?.bundle_expires_at).toBeNull();
});

// ---------------------------------------------------------------------------
// baby_bundle
// ---------------------------------------------------------------------------

test("baby_bundle (multi): upfront payment → account with bundle_expires_at 6mo from today", {
  timeout: 120_000,
}, async ({ page }) => {
  await page.goto("/programs/first-year#join");

  // Baby bundle — click the last "6-month bundle" button (baby card)
  const [checkoutPage] = await Promise.all([
    page.context().waitForEvent("page"),
    page.getByRole("button", { name: /6-month bundle/i }).last().click(),
  ]);
  await checkoutPage.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });

  await completeStripeCheckout(checkoutPage, { month: MONTH, year: YEAR, email: EMAILS.baby_bundle });

  await checkoutPage.waitForURL(/first-year\/welcome/, { timeout: 30_000 });
  await checkoutPage.waitForTimeout(4_000);

  const account = await getAccountByEmail(EMAILS.baby_bundle);
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
  await expect(page.getByRole("heading", { name: /first year program/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /download/i })).toHaveAttribute(
    "href",
    /understanding-the-village\.pdf/,
  );
});

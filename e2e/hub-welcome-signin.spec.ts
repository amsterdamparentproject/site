/**
 * FYP welcome page → direct Hub sign-in — E2E
 *
 * Covers AutoHubRedirect / getWelcomeHubSignInLink
 * (app/programs/first-year/welcome/{AutoHubRedirect.tsx,actions.ts}):
 * landing on the welcome page with a real ?session_id= that matches a
 * seeded account should sign the browser straight into an authenticated
 * /hub/home session, with no button click and no email/magic-link step in
 * between (renamed from GoToHubButton 2026-07-31 — this used to be a
 * button the family had to click; now it fires automatically on mount).
 * Falls back to the plain /hub sign-in gate when there's no session_id at
 * all.
 *
 * Not executed in the build sandbox (no root to install Playwright's OS
 * deps) — unverified by a real run as of this writing. Also worth flagging:
 * this is exactly the scenario the "type=signup instead of magiclink for
 * brand-new emails" issue (see hub-auth memory / e2e/helpers/hub-auth.ts's
 * docs) was diagnosed against — seedActiveAccountWithMember() always
 * creates a brand-new address, same as every real welcome-page visitor. If
 * that issue is still live, this test's happy-path assertion may hang the
 * same way hub-auth.spec.ts's original test did, rather than fail cleanly.
 */

import { test, expect } from "@playwright/test";
import {
  seedActiveAccountWithMember,
  cleanupAccountByEmail,
} from "./helpers/fyp-db";

test("welcome page auto-signs a matching account straight into the Hub", async ({
  page,
}) => {
  const member = await seedActiveAccountWithMember({
    firstName: "Welcome",
    lastName: "Family",
  });

  try {
    await page.goto(
      `/programs/first-year/welcome?session_id=${member.stripeSessionId}`,
    );

    // No click required — AutoHubRedirect fires on mount. Lands on
    // /hub/home?welcome=1 (see that page's WelcomeBanner), which then
    // strips the query param itself.
    await expect(page).toHaveURL(/\/hub\/home/, { timeout: 15_000 });
    await expect(
      page.getByText(/welcome to the first year program/i),
    ).toBeVisible();

    // Confirm this is a genuine per-member sign-in, not just a generic
    // landing on the Home tab — /hub/home shows no member-specific info
    // itself, so check the Account tab.
    await page.getByRole("link", { name: "Account" }).click();
    await expect(page).toHaveURL(/\/hub\/account/);
    await expect(page.getByText("Welcome Family")).toBeVisible();
    await expect(page.getByText(member.email)).toBeVisible();
  } finally {
    await cleanupAccountByEmail(member.email);
  }
});

test("welcome page falls back to the plain sign-in gate with no session_id", async ({
  page,
}) => {
  await page.goto("/programs/first-year/welcome");

  await expect(page).toHaveURL(/\/hub$/, { timeout: 15_000 });
  await expect(page.getByText(/sign in to the first year hub/i)).toBeVisible();
});

test("welcome page falls back to the plain sign-in gate for an unmatched session_id", async ({
  page,
}) => {
  await page.goto(
    "/programs/first-year/welcome?session_id=cs_test_does_not_exist",
  );

  await expect(page).toHaveURL(/\/hub$/, { timeout: 15_000 });
  await expect(page.getByText(/sign in to the first year hub/i)).toBeVisible();
});

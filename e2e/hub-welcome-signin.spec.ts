/**
 * FYP welcome page → direct Hub sign-in — E2E
 *
 * Covers GoToHubButton / getWelcomeHubSignInLink
 * (app/programs/first-year/welcome/{GoToHubButton.tsx,actions.ts}): landing
 * on the welcome page with a real ?session_id= that matches a seeded
 * account should sign the browser straight into an authenticated
 * /hub/account session, with no email/magic-link step in between. Falls
 * back to the plain /hub sign-in gate when there's no session_id at all.
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

test("welcome page's Go to Hub button signs a matching account straight in", async ({
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
    await page
      .getByRole("button", { name: /go to your first year hub/i })
      .click();

    // Same landing spot + assertions as the regular sign-in flow (see
    // hub-auth.spec.ts) — this is just a different path into the same
    // session.
    await expect(page).toHaveURL(/\/hub\/account/, { timeout: 15_000 });
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
  await page
    .getByRole("button", { name: /go to your first year hub/i })
    .click();

  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByText(/sign in to the first year hub/i)).toBeVisible();
});

test("welcome page falls back to the plain sign-in gate for an unmatched session_id", async ({
  page,
}) => {
  await page.goto(
    "/programs/first-year/welcome?session_id=cs_test_does_not_exist",
  );
  await page
    .getByRole("button", { name: /go to your first year hub/i })
    .click();

  await expect(page).toHaveURL(/\/hub$/);
  await expect(page.getByText(/sign in to the first year hub/i)).toBeVisible();
});

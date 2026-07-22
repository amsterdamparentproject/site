/**
 * FYP Hub sign-in flow — E2E
 *
 * 1. Unauthenticated user navigates to /hub
 * 2. Sees HubLoginForm
 * 3. Enters their email and requests a magic link
 * 4. App shows "check your inbox"
 * 5. User follows the magic link
 *    (generated directly via Supabase admin — no inbox required)
 * 6. Lands on /hub as an authenticated member
 *
 * Also covers: unauthenticated visit, unknown email, and an
 * inactive-account session (still signs in, but shows the "membership
 * isn't active" state instead of the welcome state).
 *
 * Prerequisite: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in
 * .env.test must point at the same Supabase project as
 * NEXT_PUBLIC_TEST_SUPABASE_URL / TEST_SUPABASE_SERVICE_ROLE_KEY — see
 * e2e/helpers/hub-auth.ts's docblock for why.
 */

import { test, expect } from "@playwright/test";
import {
  seedActiveAccountWithMember,
  cleanupAccountByEmail,
} from "./helpers/fyp-db";
import { signInToHubAs } from "./helpers/hub-auth";

test("hub sign-in: request magic link → follow link → land on /hub", async ({
  page,
}) => {
  const member = await seedActiveAccountWithMember({
    firstName: "Jane",
    lastName: "Doe",
  });

  try {
    await page.goto("/hub");

    // Sign-in form is shown, not any authenticated content
    await expect(
      page.getByText(/sign in to the first year hub/i),
    ).toBeVisible();

    // Request the link
    await page.getByPlaceholder("your@email.com").fill(member.email);
    await page.getByRole("button", { name: /send me a sign-in link/i }).click();
    await expect(page.getByText(/check your inbox/i)).toBeVisible();

    // Follow it (bypassing the inbox)
    await signInToHubAs(page, member.email);

    // Lands on /hub, authenticated
    await expect(page).toHaveURL(/\/hub/);
    await expect(page.getByText(/welcome, jane/i)).toBeVisible();
    await expect(page.getByText(member.email)).toBeVisible();
  } finally {
    await cleanupAccountByEmail(member.email);
  }
});

test("unauthenticated visit to /hub shows sign-in form, not welcome content", async ({
  page,
}) => {
  await page.goto("/hub");
  await expect(page.getByText(/sign in to the first year hub/i)).toBeVisible();
  await expect(page.getByText(/welcome,/i)).not.toBeVisible();
});

test("unknown email shows 'no hub account found', without sending a link", async ({
  page,
}) => {
  await page.goto("/hub");
  await page
    .getByPlaceholder("your@email.com")
    .fill("definitely-not-a-hub-member@example.com");
  await page.getByRole("button", { name: /send me a sign-in link/i }).click();

  await expect(page.getByText(/no hub account found/i)).toBeVisible();
  await expect(page.getByText(/check your inbox/i)).not.toBeVisible();
});

test("signing in with a lapsed account shows the inactive-membership state", async ({
  page,
}) => {
  const member = await seedActiveAccountWithMember({
    firstName: "Sam",
    status: "canceled",
  });

  try {
    await signInToHubAs(page, member.email);
    await expect(page.getByText(/your membership isn't active/i)).toBeVisible();
    await expect(page.getByText(/welcome, sam/i)).not.toBeVisible();
  } finally {
    await cleanupAccountByEmail(member.email);
  }
});

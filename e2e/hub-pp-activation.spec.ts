/**
 * FYP Hub — Postpartum Post activation — E2E
 *
 * Covers MemberCard's "Activate Postpartum Post" / "Go to Postpartum Post"
 * banner button (app/hub/account/MemberCard.tsx) end to end: click →
 * server action → postpartum-post's own POST /api/fyp/activate (stubbed,
 * see e2e/helpers/pp-activate-stub.ts) → postpartumpost_member_id persisted
 * → button flips state. The underlying branching logic (new vs. existing
 * PP member, bundle vs. monthly comp sizing) already has its own dedicated
 * coverage in postpartum-post's own test suite and this repo's
 * __tests__/integration/fyp-activate-pp.test.ts — this file's job is just
 * proving the real button correctly wires to that logic in a real browser.
 *
 * Each of the three activation/sign-in scenarios needs its own account +
 * sign-in (can't be consolidated onto one session/account, unlike
 * hub-members.spec.ts's roster tests): they're mutually exclusive states of
 * one member (new vs. already-linked-elsewhere vs. already-active), and only
 * the *signed-in* member's own card is ever clickable, so there's no "test
 * scenario B on a sibling while staying signed in as the scenario-A member"
 * shortcut available here the way there was for the roster tests.
 *
 * Diagnosed 2026-07-24, while first drafting a (since-reverted) version of
 * this file that tried exactly that consolidation: MemberCard's PP banner
 * didn't check `isSelf` at all, so the signed-in member could activate or
 * sign into a *sibling's* personal Postpartum Post account just by clicking
 * their card's banner — a real privacy gap (PP holds individual
 * postpartum/health data, not shared family info), not a testing
 * convenience worth preserving. Fixed in MemberCard.tsx: the banner still
 * renders on every card (so a partner can see at a glance whether the other
 * has activated yet — see getPostpartumPostBannerState()'s own docs) but is
 * only ever clickable on the signed-in member's own; the last test below is
 * the regression test for that
 * fix.
 */

import { test, expect } from "@playwright/test";
import {
  seedActiveAccountWithMember,
  cleanupAccountByEmail,
  addSeededMember,
  getMemberPostpartumPostId,
  linkMemberToPostpartumPost,
} from "./helpers/fyp-db";
import { signInToHubAs } from "./helpers/hub-auth";
import {
  startPpActivateStub,
  type PpActivateStub,
} from "./helpers/pp-activate-stub";

// Must match POSTPARTUM_POST_BASE_URL in .env.test — the "Go to Postpartum
// Post" test's popup ends up here after Supabase's real magic-link
// verify/redirect chain completes (there's no real postpartum-post server
// behind it, just the pp-activate-stub — but pp-activate-stub only handles
// POST /api/fyp/activate, so the popup 404s there. That's fine: this test
// is verifying site's own link-generation + redirect wiring, not PP's page).
const POSTPARTUM_POST_BASE_URL = "http://localhost:3900";

test.describe.configure({ mode: "serial" });

let stub: PpActivateStub;

test.beforeAll(async () => {
  stub = await startPpActivateStub();
});

test.afterAll(async () => {
  await stub.close();
});

test("activates a brand-new Postpartum Post member", async ({ page }) => {
  const member = await seedActiveAccountWithMember({
    firstName: "New",
    lastName: "Parent",
  });

  try {
    await signInToHubAs(page, member.email);
    await expect(page).toHaveURL(/\/hub\/account/);

    const activateButton = page.getByRole("button", {
      name: "Activate Postpartum Post",
    });
    await expect(activateButton).toBeVisible();
    await activateButton.click();

    // Flips to the "already linked" banner once the server action resolves.
    await expect(
      page.getByRole("button", { name: "Go to Postpartum Post" }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(activateButton).not.toBeVisible();

    // The stub minted a fresh id and reported this as a new PP signup.
    const request = stub.requests.find(
      (r) => r.email.toLowerCase() === member.email.toLowerCase(),
    );
    expect(request).toBeTruthy();
    expect(request?.planType).toBe("monthly");

    const persistedId = await getMemberPostpartumPostId(member.memberId);
    expect(persistedId).toBeTruthy();
  } finally {
    await cleanupAccountByEmail(member.email);
  }
});

test("links to an existing Postpartum Post member by email", async ({
  page,
}) => {
  const member = await seedActiveAccountWithMember({
    firstName: "Existing",
    lastName: "Parent",
  });
  const existingPpMemberId = crypto.randomUUID();
  stub.registerExistingMember(member.email, existingPpMemberId);

  try {
    await signInToHubAs(page, member.email);
    await expect(page).toHaveURL(/\/hub\/account/);

    await page
      .getByRole("button", { name: "Activate Postpartum Post" })
      .click();
    await expect(
      page.getByRole("button", { name: "Go to Postpartum Post" }),
    ).toBeVisible({ timeout: 10_000 });

    // Linked to the pre-existing PP member id, not a freshly minted one.
    const persistedId = await getMemberPostpartumPostId(member.memberId);
    expect(persistedId).toBe(existingPpMemberId);
  } finally {
    await cleanupAccountByEmail(member.email);
  }
});

test("'Go to Postpartum Post' opens a real, working sign-in link for an already-active member", async ({
  page,
}) => {
  const member = await seedActiveAccountWithMember({
    firstName: "Already",
    lastName: "Active",
  });
  // Seeded as already-linked — skips the activate step entirely, since this
  // test is only about the sign-in-link button, not activation itself.
  await linkMemberToPostpartumPost(member.memberId, crypto.randomUUID());

  try {
    await signInToHubAs(page, member.email);
    await expect(page).toHaveURL(/\/hub\/account/);

    // isPpActive is true from the start (already linked), so "Go to
    // Postpartum Post" shows immediately — no "Activate" button at all.
    await expect(
      page.getByRole("button", { name: "Activate Postpartum Post" }),
    ).not.toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Go to Postpartum Post" }).click(),
    ]);

    // getPostpartumPostSignInLink() generates a real Supabase magic link;
    // the popup follows Supabase's own verify → redirect chain all the way
    // to POSTPARTUM_POST_BASE_URL/auth/confirm (with real auth data in the
    // URL) before landing on pp-activate-stub's 404 (it only implements
    // POST /api/fyp/activate) — proving the link Hub generated was genuine
    // and valid, not that PP's own page works (that's PP's own concern).
    await popup.waitForURL(
      new RegExp(`^${POSTPARTUM_POST_BASE_URL}/auth/confirm`),
      { timeout: 15_000 },
    );
    expect(popup.url()).toMatch(/access_token=|token_hash=/);
  } finally {
    await cleanupAccountByEmail(member.email);
  }
});

test("shows another family member's Postpartum Post banner as informational only, never clickable", async ({
  page,
}) => {
  // Text/disabled/title permutations (active vs. not, self vs. not,
  // pending vs. not) are unit-tested directly against the pure decision
  // function — see __tests__/utils/postpartumPostBanner.test.ts. This test
  // just confirms MemberCard actually wires that decision into real,
  // non-interactive DOM for a real sibling's card, not every permutation.
  const self = await seedActiveAccountWithMember({
    firstName: "Self",
    lastName: "Parent",
    familyType: "multi",
  });
  const activeSibling = await addSeededMember(self.accountId, {
    firstName: "Active",
    lastName: "Sibling",
  });
  await linkMemberToPostpartumPost(activeSibling.memberId, crypto.randomUUID());
  const inactiveSibling = await addSeededMember(self.accountId, {
    firstName: "Inactive",
    lastName: "Sibling",
  });

  try {
    await signInToHubAs(page, self.email);
    await expect(page).toHaveURL(/\/hub\/account/);

    const activeCard = page
      .locator("div.rounded-2xl")
      .filter({ hasText: "Active Sibling" })
      .first();
    const activeBanner = activeCard.getByRole("button", {
      name: "Go to Postpartum Post",
    });
    await expect(activeBanner).toBeVisible();
    await expect(activeBanner).toBeDisabled();
    await expect(activeBanner).toHaveAttribute(
      "title",
      "Active has activated Postpartum Post",
    );

    const inactiveCard = page
      .locator("div.rounded-2xl")
      .filter({ hasText: "Inactive Sibling" })
      .first();
    const inactiveBanner = inactiveCard.getByRole("button", {
      name: "Activate Postpartum Post",
    });
    await expect(inactiveBanner).toBeVisible();
    await expect(inactiveBanner).toBeDisabled();
    await expect(inactiveBanner).toHaveAttribute(
      "title",
      "Inactive hasn't activated Postpartum Post yet",
    );
  } finally {
    await cleanupAccountByEmail(self.email);
  }
});

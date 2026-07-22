/**
 * FYP Hub — member roster (add / edit / remove) — E2E
 *
 * Covers the "Your family" section on /hub/account for multi-family
 * accounts: MemberRoster's add-member card, editing a sibling via the same
 * MemberCard component used for the signed-in member's own card, and
 * removing a sibling. Only rendered when familyType === "multi" — see
 * app/hub/(account)/account/page.tsx.
 *
 * Not executed in the build sandbox (no root to install Playwright's OS
 * deps, same limitation noted in hub-auth.spec.ts) — unverified by a real
 * run as of this writing. Selectors are scoped defensively (title
 * attributes, locator().filter({hasText}) on the card wrapper) since both
 * the signed-in member's own card and each sibling card render via the
 * same MemberCard component and would otherwise collide on shared text
 * like "Edit member" / "Delete member".
 */

import { test, expect } from "@playwright/test";
import {
  seedActiveAccountWithMember,
  cleanupAccountByEmail,
} from "./helpers/fyp-db";
import { signInToHubAs } from "./helpers/hub-auth";

test("add, edit, and remove a family member from the Account tab", async ({
  page,
}) => {
  const member = await seedActiveAccountWithMember({
    firstName: "Primary",
    lastName: "Parent",
    familyType: "multi",
  });

  try {
    await signInToHubAs(page, member.email);
    await expect(page).toHaveURL(/\/hub\/account/);

    // Single-member account so far: family section shows just the
    // add-member link, no sibling cards, no "Delete member" on the self
    // card (that all requires memberCount > 1).
    await expect(page.getByText("Your family")).toBeVisible();
    await expect(page.getByText("+ Add member")).toBeVisible();

    // ── Validation: Add member with empty fields shows an error, doesn't
    //    call the server action or close the form ──
    await page.getByText("+ Add member").click();
    await page.getByTitle("Add member").click();
    await expect(
      page.getByText(/first name, last name, and email are required/i),
    ).toBeVisible();

    // ── Happy path: fill in and save a new member ──
    const partnerEmail = `${member.email.split("@")[0]}+partner@example.com`;
    await page.getByLabel(/first name/i).fill("Partner");
    await page.getByLabel(/last name/i).fill("Parent");
    await page.getByLabel(/^email/i).fill(partnerEmail);
    await page.getByTitle("Add member").click();

    const siblingCard = page
      .locator("div.rounded-2xl")
      .filter({ hasText: "Partner Parent" })
      .first();
    await expect(siblingCard).toBeVisible();
    await expect(siblingCard.getByText(partnerEmail)).toBeVisible();

    // The signed-in member's own card should now also offer "Delete
    // member" (memberCount > 1) — confirms onRosterChange refreshed their
    // profile, not just the roster list.
    await page.getByTitle("Edit member").first().click();
    await expect(page.getByText("Delete member")).toBeVisible();
    await page.getByTitle("Discard changes").first().click();

    // ── Edit the sibling ──
    await siblingCard.getByTitle("Edit member").click();
    await siblingCard.getByLabel(/first name/i).fill("Updated");
    await siblingCard.getByTitle("Save changes").click();

    const updatedCard = page
      .locator("div.rounded-2xl")
      .filter({ hasText: "Updated Parent" })
      .first();
    await expect(updatedCard).toBeVisible();

    // ── Remove the sibling ──
    await updatedCard.getByTitle("Edit member").click();
    await updatedCard.getByText("Delete member").click();
    await updatedCard.getByText("Yes, remove").click();

    await expect(page.getByText("Updated Parent")).not.toBeVisible();
    // Removing a sibling doesn't sign the viewer out — still on the
    // Account tab, not bounced back to the sign-in gate.
    await expect(page).toHaveURL(/\/hub\/account/);
  } finally {
    await cleanupAccountByEmail(member.email);
  }
});

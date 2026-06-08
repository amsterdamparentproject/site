import { test, expect } from "@playwright/test";
import { seedUid, waitForSuccess } from "./helpers";

test.describe("ChangeGroupForm (directory)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await seedUid(page);
  });

  test("submits successfully with updated invite link", async ({ page }) => {
    await page.goto("/groups-directory");

    const adminButton = page.locator('button:has-text("Admin")').first();
    await adminButton.click();

    // Reveal the link input if hidden
    const changeLinkBtn = page.locator('button:has-text("Change link")');
    if (await changeLinkBtn.isVisible()) {
      await changeLinkBtn.click();
    }

    await page.fill(
      'input[name="inviteLink"]',
      "https://chat.whatsapp.com/updatedlink456",
    );

    await page.click('button:has-text("Request changes")');
    await waitForSuccess(page, "Success!");
  });

});

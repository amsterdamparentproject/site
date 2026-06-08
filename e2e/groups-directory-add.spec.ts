import { test, expect } from "@playwright/test";
import { waitForSuccess } from "./helpers";

test.describe("AddGroupForm (/add)", () => {
  test("submits successfully with all required fields", async ({ page }) => {
    await page.goto("/groups-directory/add");

    await page.fill('input[name="groupName"]', "Test Parent Group");
    await page.fill(
      'input[name="inviteLink"]',
      "https://chat.whatsapp.com/testlink789",
    );
    await page.fill('input[name="adminName"]', "Alex");
    await page.fill('input[name="email"]', "alex@example.com");
    await page.check('input[name="agreedToTerms"]');

    await page.click('button:has-text("Add group")');
    await waitForSuccess(page, "Success!");
  });

  test("submit is disabled with missing required fields", async ({ page }) => {
    await page.goto("/groups-directory/add");

    await page.fill('input[name="groupName"]', "Incomplete Group");
    // leave inviteLink, adminName, email, agreedToTerms empty

    await expect(page.locator('button:has-text("Add group")')).toBeDisabled();
  });

  test("submit is disabled with invalid email", async ({ page }) => {
    await page.goto("/groups-directory/add");

    await page.fill('input[name="groupName"]', "Test Group");
    await page.fill(
      'input[name="inviteLink"]',
      "https://chat.whatsapp.com/test",
    );
    await page.fill('input[name="adminName"]', "Alex");
    await page.fill('input[name="email"]', "notanemail");
    await page.check('input[name="agreedToTerms"]');

    await expect(page.locator('button:has-text("Add group")')).toBeDisabled();
  });
});

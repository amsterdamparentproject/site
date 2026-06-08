import { test, expect } from "@playwright/test";
import { seedUid, waitForSuccess } from "./helpers";

test.describe("ReportIssueForm (directory)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await seedUid(page);
  });

  test("submits broken link report successfully", async ({ page }) => {
    await page.goto("/groups-directory");

    await page.locator('button:has-text("Report issue")').first().click();

    // "Broken link" is selected by default — optionally provide new link
    await page.fill(
      'input[placeholder*="whatsapp"]',
      "https://chat.whatsapp.com/newlink123",
    );

    await page.click('button:has-text("Send report")');
    await waitForSuccess(page);
  });

  test("submits other issue report successfully", async ({ page }) => {
    await page.goto("/groups-directory");

    await page.locator('button:has-text("Report issue")').first().click();
    await page.click('input[value="other"]');
    await page.fill("textarea", "The group is no longer active");

    await page.click('button:has-text("Send report")');
    await waitForSuccess(page);
  });

});

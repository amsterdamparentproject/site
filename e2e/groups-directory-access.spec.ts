import { test, expect } from "@playwright/test";
import { waitForSuccess } from "./helpers";

test.describe("no-UID redirect journey", () => {
  test("redirects to /access and submits the request form", async ({
    page,
  }) => {
    // Navigate to the directory with no app_uid cookie — server redirects to /access
    await page.goto("/groups-directory");
    await expect(page).toHaveURL(/\/groups-directory\/access/);

    await page.fill('input[name="name"]', "Alex");
    await page.fill('input[name="email"]', "alex@example.com");
    await page.check('input[name="agreedToTerms"]');

    await page.click('button:has-text("Request access")');
    await waitForSuccess(page, "Success!");
  });
});

test.describe("RequestAccessForm (/access)", () => {
  test("submits successfully with name, email, and agreement", async ({
    page,
  }) => {
    await page.goto("/groups-directory/access");

    await page.fill('input[name="name"]', "Alex");
    await page.fill('input[name="email"]', "alex@example.com");
    await page.check('input[name="agreedToTerms"]');

    await page.click('button:has-text("Request access")');
    await waitForSuccess(page, "Success!");
  });

  test("submit is disabled with missing required fields", async ({ page }) => {
    await page.goto("/groups-directory/access");

    await page.fill('input[name="name"]', "Alex");
    // leave email and agreedToTerms empty

    await expect(
      page.locator('button:has-text("Request access")'),
    ).toBeDisabled();
  });

  test("submit is disabled with invalid email", async ({ page }) => {
    await page.goto("/groups-directory/access");

    await page.fill('input[name="name"]', "Alex");
    await page.fill('input[name="email"]', "notanemail");
    await page.check('input[name="agreedToTerms"]');

    await expect(
      page.locator('button:has-text("Request access")'),
    ).toBeDisabled();
  });
});

import { test, expect } from "@playwright/test";
import { waitForSuccess } from "./helpers";

test.describe("/groups-directory/update (public)", () => {
  async function selectFirstGroup(page: ReturnType<typeof test.extend>) {
    const groupInput = page.locator('input[id="groupName"]');
    await groupInput.click();
    const firstOption = page.locator('[role="listbox"] li').first();
    await firstOption.waitFor({ timeout: 5_000 });
    await firstOption.click();
  }

  test("submits successfully with group, link, and email", async ({ page }) => {
    await page.goto("/groups-directory/update");
    await selectFirstGroup(page);

    await page.fill(
      'input[id="newLink"]',
      "https://chat.whatsapp.com/publicupdate999",
    );
    await page.fill('input[id="email"]', "contact@example.com");

    await page.click('button:has-text("Submit update")');
    await waitForSuccess(page);
  });

  test("submits successfully without a link (link is optional)", async ({
    page,
  }) => {
    await page.goto("/groups-directory/update");
    await selectFirstGroup(page);

    await page.fill('input[id="email"]', "contact@example.com");

    await page.click('button:has-text("Submit update")');
    await waitForSuccess(page);
  });

  test("submit is disabled without selecting a group", async ({ page }) => {
    await page.goto("/groups-directory/update");
    await page.fill('input[id="email"]', "contact@example.com");

    await expect(
      page.locator('button:has-text("Submit update")'),
    ).toBeDisabled();
  });

  test("submit is disabled with invalid email", async ({ page }) => {
    await page.goto("/groups-directory/update");
    await selectFirstGroup(page);

    await page.fill('input[id="email"]', "bademail");
    await page.locator('input[id="email"]').blur();

    await expect(
      page.locator('button:has-text("Submit update")'),
    ).toBeDisabled();
  });

  test("shows validation error for non-URL invite link", async ({ page }) => {
    await page.goto("/groups-directory/update");
    await selectFirstGroup(page);

    await page.fill('input[id="newLink"]', "not a url");
    await page.locator('input[id="newLink"]').blur();

    await expect(page.locator("text=valid URL")).toBeVisible();
    await expect(
      page.locator('button:has-text("Submit update")'),
    ).toBeDisabled();
  });

});

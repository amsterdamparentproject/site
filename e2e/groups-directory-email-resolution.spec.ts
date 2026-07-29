import { test, expect, Page } from "@playwright/test";
import { seedUid, waitForSuccess } from "./helpers";

// Shared helper — selects the first group from the autocomplete on /update
async function selectFirstGroup(page: Page) {
  const groupInput = page.locator('input[id="groupName"]');
  await groupInput.click();
  const firstOption = page.locator('[role="listbox"] li').first();
  await firstOption.waitFor({ timeout: 5_000 });
  await firstOption.click();
}

// ─────────────────────────────────────────────
// Case 1: Anonymous user — no cookie, fills email themselves
// ─────────────────────────────────────────────
test.describe("email resolution — anonymous user", () => {
  test("email field is visible on /add with no cookie", async ({ page }) => {
    await page.goto("/groups-directory/add");
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("email field is visible on /update with no cookie", async ({ page }) => {
    await page.goto("/groups-directory/update");
    await expect(page.locator('input[id="email"]')).toBeVisible();
  });

  test("/add submits successfully with user-provided email", async ({
    page,
  }) => {
    await page.goto("/groups-directory/add");
    await page.fill('input[name="groupName"]', "Test Parent Group");
    await page.fill(
      'input[name="inviteLink"]',
      "https://chat.whatsapp.com/anonaddtest",
    );
    await page.fill('input[name="email"]', "anon@example.com");
    await page.click('button:has-text("Add group")');
    await waitForSuccess(page, "Success!");
  });

  test("/update submits successfully with user-provided email", async ({
    page,
  }) => {
    await page.goto("/groups-directory/update");
    await selectFirstGroup(page);
    await page.fill('input[id="email"]', "anon@example.com");
    await page.click('button:has-text("Submit update")');
    await waitForSuccess(page);
  });

  test("/add submit is disabled without email", async ({ page }) => {
    await page.goto("/groups-directory/add");
    await page.fill('input[name="groupName"]', "Test Group");
    await page.fill(
      'input[name="inviteLink"]',
      "https://chat.whatsapp.com/test",
    );
    // leave email empty
    await expect(page.locator('button:has-text("Add group")')).toBeDisabled();
  });

  test("/update submit is disabled without email", async ({ page }) => {
    await page.goto("/groups-directory/update");
    await selectFirstGroup(page);
    // leave email empty
    await expect(
      page.locator('button:has-text("Submit update")'),
    ).toBeDisabled();
  });
});

// ─────────────────────────────────────────────
// Case 2: Cookie user on public forms — email resolved server-side from cookie
// ─────────────────────────────────────────────
test.describe("email resolution — cookie user on public forms", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await seedUid(page);
  });

  test("email field is hidden on /update when app_uid cookie is set", async ({
    page,
  }) => {
    await page.goto("/groups-directory/update");
    await expect(page.locator('input[id="email"]')).not.toBeVisible();
  });

  test("/update submits without user-provided email when app_uid cookie is set", async ({
    page,
  }) => {
    await page.goto("/groups-directory/update");
    await selectFirstGroup(page);
    // No email filled — server action resolves it from the cookie via service role lookup
    await page.click('button:has-text("Submit update")');
    await waitForSuccess(page);
  });
});

// ─────────────────────────────────────────────
// Case 3: Authenticated directory user — email from server props, modal form
// ─────────────────────────────────────────────
test.describe("email resolution — authenticated directory user", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await seedUid(page);
  });

  test("email field is hidden in the add-group modal", async ({ page }) => {
    await page.goto("/groups-directory");
    await page.click('button:has-text("Add new group")');
    // hasIdentity is true because userId prop is set — email field is not rendered
    await expect(page.locator('input[name="email"]')).not.toBeVisible();
  });

  test("add-group modal submits without user-provided email", async ({
    page,
  }) => {
    await page.goto("/groups-directory");
    await page.click('button:has-text("Add new group")');
    await page.fill('input[name="groupName"]', "Cookie Auth Test Group");
    await page.fill(
      'input[name="inviteLink"]',
      "https://chat.whatsapp.com/authadd",
    );
    await page.click('button:has-text("Add group")');
    await waitForSuccess(page, "Success!");
  });

  test("email field is hidden in the edit-group modal", async ({ page }) => {
    await page.goto("/groups-directory");
    const adminButton = page.locator('button:has-text("Admin")').first();
    await adminButton.click();
    await expect(page.locator('input[name="email"]')).not.toBeVisible();
  });
});

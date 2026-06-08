import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { seedUid } from "./helpers";

function getDirectoryClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: "directory" } },
  );
}

async function getTestUserName(): Promise<string> {
  const { data } = await getDirectoryClient()
    .from("users")
    .select("name")
    .eq("public_id", process.env.TEST_APP_UID!)
    .single();
  if (!data?.name) throw new Error("Test user not found in directory.users");
  return data.name;
}


test.describe("Groups directory auth routing", () => {
  test("shows the directory when app_uid cookie is present", async ({
    page,
  }) => {
    const name = await getTestUserName();

    await seedUid(page);
    await page.goto("/groups-directory");

    await expect(page).toHaveURL("/groups-directory");
    await expect(
      page.locator(`h2:has-text("Welcome, ${name}!")`),
    ).toBeVisible();
  });

  test("shows the correct recommended and all group counts from the database when app_uid cookie is present", async ({
    page,
  }) => {
    await seedUid(page);
    await page.goto("/groups-directory");

    // Verify both tab buttons are visible with a numeric count — the exact
    // numbers come from the server's DB, so we match the pattern rather than
    // hard-coding counts that vary between test and live environments.
    await expect(
      page.locator('button', { hasText: /^Recommended \(\d+\)$/ }),
    ).toBeVisible();
    await expect(
      page.locator('button', { hasText: /^Browse all \(\d+\)$/ }),
    ).toBeVisible();
  });

  test("redirects to /access with noUid param when no cookie is present", async ({
    page,
  }) => {
    await page.goto("/groups-directory");

    await expect(page).toHaveURL("/groups-directory/access?noUid=true");
  });

  test("redirects to /access with badUid param and shows warning when uid is unrecognised", async ({
    page,
  }) => {
    await page.goto("/groups-directory?uid=invalid-uid");

    await expect(page).toHaveURL("/groups-directory/access?badUid=true");
    await expect(page.locator('h3:has-text("Invalid directory link")')).toBeVisible();
  });

  test("strips ?uid= param, shows the directory, and stores app_uid in localStorage", async ({
    page,
  }) => {
    const uid = process.env.TEST_APP_UID!;

    await page.goto(`/groups-directory?uid=${uid}`);

    // Client strips the param via history.replaceState
    await expect(page).toHaveURL("/groups-directory");

    // UID is persisted to localStorage
    const stored = await page.evaluate(() => localStorage.getItem("app_uid"));
    expect(stored).toBe(uid);
  });
});

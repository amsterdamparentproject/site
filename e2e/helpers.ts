import { Page } from "@playwright/test";

/**
 * Waits for the success confirmation to appear after a form submission.
 */
export async function waitForSuccess(
  page: Page,
  heading: "Thanks" | "Success!" = "Thanks",
  timeout = 15_000,
) {
  await page.waitForSelector(`h2:has-text("${heading}")`, {
    timeout,
    state: "visible",
  });
}

/**
 * Seeds the app_uid cookie so pages behind directory auth load correctly.
 * Uses TEST_APP_UID env var — set this in .env.test.local to a valid UID
 * in your test Supabase project.
 */
export async function seedUid(page: Page) {
  const uid = process.env.TEST_APP_UID;
  if (!uid) throw new Error("TEST_APP_UID is not set in .env.test.local");
  await page.context().addCookies([
    { name: "app_uid", value: uid, domain: "localhost", path: "/" },
  ]);
  // Also seed localStorage so client components that read app_uid from
  // localStorage (e.g. UpdateClient email field visibility) behave correctly.
  await page.goto("/");
  await page.evaluate((id) => localStorage.setItem("app_uid", id), uid);
}

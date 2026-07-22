/**
 * Auth helpers for FYP Hub Playwright tests.
 *
 * Mirrors postpartum-post/e2e/helpers/auth.ts exactly: magic link emails
 * are never fetched from an inbox — instead we generate the link directly
 * via the Supabase admin API and navigate to it in the browser. This keeps
 * tests fast and self-contained while still exercising the full
 * browser-side auth flow (verifyOtp/onAuthStateChange, session storage).
 *
 * Prefers NEXT_PUBLIC_TEST_SUPABASE_URL / TEST_SUPABASE_SERVICE_ROLE_KEY,
 * falling back to the main project otherwise — mirrors
 * lib/supabase/client.ts's createAuthBrowserClient() exactly, so this
 * lands on the same project seedActiveAccountWithMember() (fyp-db.ts) just
 * wrote to, regardless of whether .env.test happens to override the main
 * vars too (it currently does, but this doesn't depend on that).
 */

import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

function adminClient() {
  const url =
    process.env.NEXT_PUBLIC_TEST_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars in .env.test");
  return createClient(url, key);
}

/**
 * Generate a Supabase magic link for the given email, redirecting to the
 * Hub's confirm page. Returns the action_link URL — navigate to it in
 * Playwright to sign in.
 */
export async function generateHubMagicLink(email: string): Promise<string> {
  const supabase = adminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_DOMAIN ?? "http://localhost:3001"}/hub/auth/confirm`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error || !data.properties?.action_link) {
    throw new Error(
      `generateHubMagicLink failed: ${error?.message ?? "no action_link returned"}`,
    );
  }

  return data.properties.action_link;
}

/**
 * Sign a Playwright page in to the Hub as the given email by navigating to
 * a generated magic link. Waits until the browser has landed on /hub and
 * the session is persisted before returning.
 */
export async function signInToHubAs(page: Page, email: string): Promise<void> {
  const link = await generateHubMagicLink(email);
  await page.goto(link);
  // Regex, not a glob — the URL briefly contains a hash fragment
  // (#access_token=...) that glob patterns don't match reliably.
  await page.waitForURL(/\/hub/, { timeout: 15_000 });
  // Wait for the Supabase client to process the hash fragment and persist
  // the session before returning — otherwise a subsequent page.goto() can
  // fire before the session is stored, leaving the browser unauthenticated.
  await page.waitForFunction(
    () =>
      Object.keys(localStorage).some(
        (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
      ),
    { timeout: 10_000 },
  );
}

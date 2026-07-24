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
 *
 * Retries a couple of times on failure: diagnosed 2026-07-24, this project's
 * admin.generateLink() intermittently fails with "unrecognized JWT kid
 * <nil> for algorithm ES256" — a token with no `kid` header failing to
 * match the project's single active ECC signing key. Not caused by our
 * @example.com-domain bug (fixed separately, see e2eTestEmail() in
 * fyp-db.ts) — this recurs even with a real, deliverable email — and not a
 * mid-rotation propagation gap either (key's been stable for 2 months, only
 * one key active). Looks like a Supabase-side quirk specific to this one
 * Admin API endpoint rather than anything fixable here, so this retries
 * around it rather than papering over it silently: a genuine, persistent
 * failure (bad project config, wrong keys, etc.) will still exhaust the
 * retries and throw.
 */
export async function generateHubMagicLink(email: string): Promise<string> {
  const supabase = adminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_DOMAIN ?? "http://localhost:3001"}/hub/auth/confirm`;

  const maxAttempts = 3;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (!error && data.properties?.action_link) {
      return data.properties.action_link;
    }

    lastError = error?.message ?? "no action_link returned";
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  throw new Error(
    `generateHubMagicLink failed after ${maxAttempts} attempts: ${lastError}`,
  );
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

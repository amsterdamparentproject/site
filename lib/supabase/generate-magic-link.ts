import type { SupabaseClient } from "@supabase/supabase-js";

// Structurally typed to just the one method this actually calls, rather
// than the full SupabaseClient<Database, SchemaName, Schema> — callers pass
// clients scoped to different schemas (e.g. createFirstYearClient()'s
// "firstyear" scoping), which otherwise fails to type-check against a bare
// SupabaseClient even though .auth.admin.* isn't affected by that scoping
// at all (see getPostpartumPostSignInLink's own docs).
type GenerateLinkClient = {
  auth: {
    admin: Pick<SupabaseClient["auth"]["admin"], "generateLink">;
  };
};

// Wraps supabase.auth.admin.generateLink({type: "magiclink"}) with a
// bounded retry.
//
// Diagnosed 2026-07-24: for a brand-new email (no existing auth.users row),
// generateLink({type: "magiclink"}) can internally take a "signup"-shaped
// path instead (see getWelcomeHubSignInLink's own docs on that) that
// intermittently mints a JWT with no `kid` header. This project runs a
// single active ECC (ES256) signing key — GoTrue can't match a token that
// doesn't specify a `kid` to that key even though it's the only candidate,
// so verification later fails with "unrecognized JWT kid <nil> for
// algorithm ES256". Confirmed (2026-07-24) this isn't a key-rotation
// propagation gap (key's been stable 2 months, only one key active) and
// isn't caused by test-only factors (@example.com email rejection is a
// separate, already-fixed bug — see e2eTestEmail() in
// e2e/helpers/fyp-db.ts) — it reproduces in real manual testing too, only
// ever for brand-new Postpartum Post / Hub sign-ups, never for someone who
// has already signed in once. Looks like a Supabase-side quirk specific to
// this admin endpoint's brand-new-user path, not something fixable here —
// retrying tends to succeed on a later attempt, so this retries rather than
// failing the whole request outright. A genuine, persistent failure (bad
// project config, wrong keys, revoked service role key, etc.) still
// exhausts the retries and returns as a failure.
export async function generateMagicLinkWithRetry(
  supabase: GenerateLinkClient,
  email: string,
  redirectTo: string,
  maxAttempts = 3,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (!error && data.properties?.action_link) {
      return { success: true, url: data.properties.action_link };
    }

    lastError = error?.message ?? "no action_link returned";
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  return {
    success: false,
    error: `generateLink failed after ${maxAttempts} attempts: ${lastError}`,
  };
}

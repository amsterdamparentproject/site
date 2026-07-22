import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Generic base client
const createBaseClient = (schema: "public" | "directory" | "activities") =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema },
    },
  );

export const directoryClient = () => createBaseClient("directory");
export const activitiesClient = () => createBaseClient("activities");

// Plain (non-SSR) browser client for the FYP Hub's Supabase Auth session.
//
// Deliberately NOT the @supabase/ssr client above — the Hub mirrors
// postpartum-post's magic-link pattern (lib/supabase.ts's
// createBrowserClient()) exactly: the session lives in localStorage, not
// cookies, there's no server-side session, and access gating happens
// client-side via onAuthStateChange rather than middleware/RLS. See the
// "FYP Hub auth approach" memory for why this was chosen over the
// @supabase/ssr + middleware + RLS alternative.
//
// Prefers NEXT_PUBLIC_TEST_SUPABASE_URL/ANON_KEY when set, falling back to
// the main project otherwise — mirrors createFirstYearClient()'s
// (lib/supabase/server.ts) exact fallback pattern, so local dev auth and
// firstyear data land in the same (test) project instead of two different
// ones. Only production (where the TEST_ vars aren't set) actually uses
// the main project for auth.
//
// Singleton so every component in the tab shares one client and receives
// the same auth events (signIn/signOut) — a second client instance would
// miss events fired through the first.
let hubAuthClient: ReturnType<typeof createSupabaseClient> | null = null;

export const createAuthBrowserClient = () => {
  if (!hubAuthClient) {
    hubAuthClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_TEST_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_TEST_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return hubAuthClient;
};

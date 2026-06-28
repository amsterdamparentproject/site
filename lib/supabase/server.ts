import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// 1. The base server creator that handles schemas
const createBaseServerClient = async (
  schema: "public" | "directory" | "activities" = "public",
) => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignore: The `setAll` method was called from a Server Component.
          }
        },
      },
    },
  );
};

// Cookie-based clients (auth-aware, for user sessions)
export const createClient = () => createBaseServerClient("public");
export const createActivitiesClient = () =>
  createBaseServerClient("activities");
export const createDirectoryClient = () => createBaseServerClient("directory");

// Service role client (bypasses RLS, server-only, never expose to client)
export const createServiceClient = (
  schema: "public" | "directory" | "activities" = "public",
) =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema } },
  );

// First Year Program — scoped to the firstyear schema
// Uses TEST Supabase creds locally so dev writes don't hit production.
// In production (no TEST_ vars), falls back to the main Supabase project.
export const createFirstYearClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_TEST_SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: "firstyear" } },
  );

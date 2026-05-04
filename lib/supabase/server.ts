import { createServerClient } from "@supabase/ssr";
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

// Specialized exported clients
export const createClient = () => createBaseServerClient("public");
export const createActivitiesClient = () =>
  createBaseServerClient("activities");
export const createDirectoryClient = () => createBaseServerClient("directory");

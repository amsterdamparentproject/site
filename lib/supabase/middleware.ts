import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const urlUid = request.nextUrl.searchParams.get("uid");

  if (urlUid) {
    const cleanUid = urlUid.trim();

    // Only set valid UIDs as cookies
    if (
      cleanUid &&
      cleanUid !== "false" &&
      cleanUid !== "null" &&
      cleanUid !== "undefined"
    ) {
      response.cookies.set("app_uid", cleanUid, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // This refreshes a user's session in the background.
  // Swallow errors here: a transient Supabase/auth failure should never crash
  // the edge function and take down the whole page. Worst case, the session
  // just doesn't get refreshed on this request.
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error(
      "Groups Directory middleware: failed to refresh session:",
      error,
    );
  }

  // Don't leak the ?uid= capability token via the Referer header when the
  // Directory page links out to third parties (audit S4). Backwards-compatible:
  // affects only outbound referrers, never the incoming ?uid= link itself.
  response.headers.set("Referrer-Policy", "no-referrer");

  return response;
};

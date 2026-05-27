import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only run auth middleware on routes that actually need Supabase auth.
  // All other pages (/, /about, /calendar, /advice, /programs/*, etc.) are
  // fully static and must NOT be intercepted here — doing so prevents Netlify
  // from serving them from its edge CDN and adds a 200-800 ms Supabase
  // round-trip to every request (root cause of the 4.5 s TTFB).
  matcher: ["/groups-directory/:path*"],
};

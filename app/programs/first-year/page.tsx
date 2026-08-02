import { Suspense } from "react";
import { genPageMetadata } from "app/seo";
import { createFirstYearClient } from "@/lib/supabase/server";
import { toLegacyPrefill, type LegacyPrefill } from "@/lib/fyp/legacy-prefill";
import FirstYearProgramClient from "./FirstYearProgramClient";

export const metadata = genPageMetadata({
  title: "First Year Program",
  description:
    "Your nonprofit first year support system in Amsterdam. Monthly expert-led discussions, local socials, 1:1 peer matching, and a moderated community — from pregnancy through your baby's first year.",
  openGraph: {
    images: [
      `${process.env.BASE_PATH || ""}/static/images/web-share/first-year-program.png`,
    ],
  },
});

// This page now does a per-request DB lookup when ?legacyId is present (see
// below) — don't let it get statically cached with one visitor's prefill
// baked in for everyone else. Mirrors app/groups-directory/page.tsx's same
// comment/flag for the same reason.
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ legacyId?: string }>;
}

/**
 * Resolves ?legacyId=<firstyear.ftp_legacy row id> into FYPJoinForm's
 * prefill props, server-side only.
 *
 * IMPORTANT — this is the fix for a real privacy issue (flagged by Alex,
 * 2026-08-01): an earlier version of this feature put firstName/lastName/
 * email/due-date straight into the URL query string
 * (?firstName=&lastName=&email=). That's PII sitting in browser history,
 * server/CDN access logs, and any analytics tool that records page URLs
 * (this app already uses one), plus it leaks via the Referer header to any
 * third-party resource the page loads. The link the email now sends
 * (lib/emails/fyp-legacy-transition.ts's buildJoinUrl) carries only the
 * row's own opaque uuid — same "token, not data" approach
 * migration 007_ftp_legacy.sql's apply_url/refund_url already use (see
 * app/api/fyp/deposit-response/route.ts). The actual name/email/due-date
 * values are looked up here, server-side, with the service-role client
 * (RLS is enabled on ftp_legacy with no public policies — only
 * service_role can read it), and passed to FirstYearProgramClient as
 * props, never round-tripped back into the client-visible URL.
 *
 * Returns undefined (no prefill, not an error) for a missing/invalid/
 * not-found id — a broken or reused link should degrade to the ordinary
 * blank sign-up form, not an error page.
 */
async function resolveLegacyPrefill(
  legacyId: string | undefined,
): Promise<LegacyPrefill | undefined> {
  if (!legacyId) return undefined;

  const supabase = createFirstYearClient();
  const { data: row, error } = await supabase
    .from("ftp_legacy")
    .select("name, email, due_birth_date")
    .eq("id", legacyId)
    .maybeSingle();

  if (error) {
    console.error("[first-year page] legacyId lookup failed:", error);
    return undefined;
  }
  if (!row) return undefined;

  return toLegacyPrefill(row);
}

export default async function Page({ searchParams }: PageProps) {
  const { legacyId } = await searchParams;
  const prefill = await resolveLegacyPrefill(legacyId);

  return (
    <main>
      <Suspense>
        <FirstYearProgramClient
          initialFirstName={prefill?.firstName}
          initialLastName={prefill?.lastName}
          initialEmail={prefill?.email}
          initialMonth={prefill?.month}
          initialYear={prefill?.year}
        />
      </Suspense>
    </main>
  );
}

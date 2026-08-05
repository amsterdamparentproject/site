import { NextResponse } from "next/server";

// Fourth Trimester Program is being phased out in favor of First Year
// Program (see app/api/checkout/fyp/route.ts) — disabled 2026-08-02 rather
// than deleted outright, since /programs/fourth-trimester/mar-2026 is still
// a live cohort's real program page. All FTPCohorts entries also have
// groupStatus: "Full" now (data/fourth-trimester-program/cohorts.ts), which
// disables the "Save your place" button in the UI (CohortsAccordion.tsx) —
// this 410 is the server-side backstop for that, in case a stale cached
// page or a direct request still reaches this route. The original
// Stripe-session-creation logic lived here before this change — see git
// history if it's ever needed for reference. Delete this route (and the
// rest of /programs/fourth-trimester/*) once the mar-2026 cohort wraps —
// see __claude__/fyp-onboarding-punchlist.md's "old FTP pages" row.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Fourth Trimester Program registration is closed — First Year Program has taken its place.",
    },
    { status: 410 },
  );
}

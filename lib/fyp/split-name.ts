// ftp_legacy only has a single `name` column (see migration
// 007_ftp_legacy.sql) — this splits it into firstName/lastName for the
// legacy-transition email's personalized "Register" link (see
// lib/emails/fyp-legacy-transition.ts's buildJoinUrl). Last word is the
// last name, everything before it is the first name (per Alex 2026-08-01,
// so e.g. "Mary Jane Smith" → firstName "Mary Jane", lastName "Smith"). A
// single-word name (no space) becomes firstName only, lastName "".
//
// Extracted out of scripts/send-ftp-legacy-transition.mts into its own
// module so it can be unit-tested directly — that script runs real
// Stripe/Supabase calls at module scope (reads env vars, can process.exit)
// the moment it's imported, so importing it from a test would run the
// whole script instead of just this function.
export function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

// Shared FYP program constants — safe to import in both server and client code.

/** Date when live sessions begin. Baby plans created before this use deposit_baby. */
export const PROGRAM_START = new Date("2026-09-01T00:00:00Z");

/** PROGRAM_START as a Unix timestamp (seconds), for Stripe trial_end. */
export const PROGRAM_START_UNIX = Math.floor(PROGRAM_START.getTime() / 1000);

/** Returns "2026-09-01" if now is before PROGRAM_START, otherwise null. */
export function getBillingStartDate(now = new Date()): string | null {
  return now < PROGRAM_START ? "2026-09-01" : null;
}

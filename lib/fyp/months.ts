// Lowercase 3-letter month values — matches
// components/first-year-program/FYPJoinForm.tsx's own MONTHS array
// (`{ label: "January", value: "jan" }`, etc.) exactly. Kept as a small
// standalone constant here rather than importing from FYPJoinForm.tsx
// (a "use client" component) into server code, or exporting FYPJoinForm's
// MONTHS and re-deriving labels — calendar months are stable enough that a
// second 12-item array isn't a meaningful duplication risk.
const MONTH_VALUES = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

/**
 * Converts a Postgres `date` column value ("YYYY-MM-DD", as returned by
 * supabase-js) into the { month, year } shape FYPJoinForm's due-date
 * <select>s use. Returns null for an empty/unparseable value (e.g. a
 * ftp_legacy row with due_birth_date left null).
 *
 * Uses UTC getters deliberately — a "date"-typed column has no time-of-day
 * or timezone component, and parsing "YYYY-MM-DD" with `new Date(...)`
 * anchors it at UTC midnight, so local-timezone getters (getMonth,
 * getFullYear) could roll the date back a day for anyone west of UTC.
 */
export function monthYearFromDate(
  dateStr: string,
): { month: string; year: string } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return {
    month: MONTH_VALUES[d.getUTCMonth()],
    year: String(d.getUTCFullYear()),
  };
}

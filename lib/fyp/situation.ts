// Shared "when is your baby due/born" helpers — client-safe.
//
// Pulled out of FYPJoinForm.tsx (which used to own MONTHS + inline
// situation-derivation logic by itself) so the same month/year state and
// "expecting vs. baby's here" derivation can be shared across the page:
// FirstYearProgramClient now lifts month/year to the top of the page (see
// SituationSelector), and AccessToday / CostsBreakdown / FYPJoinForm all
// read the same derived `Situation` rather than each recomputing it their
// own way.
//
// A visitor's situation is never asked for directly — it's always derived
// from the month/year they pick, same as before this refactor.

export type Situation = "expecting" | "baby_here";

export const MONTHS = [
  { label: "January", value: "jan" },
  { label: "February", value: "feb" },
  { label: "March", value: "mar" },
  { label: "April", value: "apr" },
  { label: "May", value: "may" },
  { label: "June", value: "jun" },
  { label: "July", value: "jul" },
  { label: "August", value: "aug" },
  { label: "September", value: "sep" },
  { label: "October", value: "oct" },
  { label: "November", value: "nov" },
  { label: "December", value: "dec" },
] as const;

/** The 3-year window this form's Year <select> offers: last year, this year, next year. */
export function situationYears(now = new Date()): string[] {
  const currentYear = now.getFullYear();
  return [
    String(currentYear - 1),
    String(currentYear),
    String(currentYear + 1),
  ];
}

export function currentMonthValue(now = new Date()): string {
  return MONTHS[now.getMonth()].value;
}

/** True when the given month/year is strictly after "now"'s month. */
export function isFutureMonthYear(
  month: string,
  year: string,
  now = new Date(),
): boolean {
  const yearNum = parseInt(year, 10);
  const monthIdx = MONTHS.findIndex((m) => m.value === month);
  return (
    yearNum > now.getFullYear() ||
    (yearNum === now.getFullYear() && monthIdx > now.getMonth())
  );
}

/**
 * Derives a visitor's situation from their selected due/birth month+year.
 * A future month/year means still expecting; anything else (this month or
 * earlier) means the baby is here. Defaults to "expecting" when no date has
 * been picked yet, matching the join form's original behavior.
 */
export function deriveSituation(
  month: string,
  year: string,
  now = new Date(),
): Situation {
  if (!month || !year) return "expecting";
  return isFutureMonthYear(month, year, now) ? "expecting" : "baby_here";
}

/**
 * Default month/year to jump to when a visitor flips the binary situation
 * toggle (SituationSelector) instead of picking a precise date. If they're
 * already in the target situation, their existing pick is left alone;
 * otherwise this lands on "this month" (baby_here) or "next month"
 * (expecting) as a reasonable placeholder — FYPJoinForm's own due-month/year
 * selects remain the precise source of truth for billing, and let them
 * refine it from there.
 */
export function situationDefaultMonthYear(
  target: Situation,
  currentMonth: string,
  currentYear: string,
  now = new Date(),
): { month: string; year: string } {
  if (deriveSituation(currentMonth, currentYear, now) === target) {
    return { month: currentMonth, year: currentYear };
  }

  if (target === "baby_here") {
    return { month: currentMonthValue(now), year: String(now.getFullYear()) };
  }

  const monthIdx = MONTHS.findIndex((m) => m.value === currentMonthValue(now));
  const nextIdx = (monthIdx + 1) % 12;
  const nextYear =
    monthIdx + 1 >= 12 ? now.getFullYear() + 1 : now.getFullYear();
  return { month: MONTHS[nextIdx].value, year: String(nextYear) };
}

/**
 * Falls back to "today" whenever a candidate value isn't one of this form's
 * own valid options, rather than trusting it blindly — e.g. a legacy row's
 * due date could sit outside the 3-year window `situationYears` offers,
 * which would otherwise desync a <select> from state.
 */
export function resolveInitialMonthYear(
  initialMonth: string | undefined,
  initialYear: string | undefined,
  now = new Date(),
): { month: string; year: string } {
  const years = situationYears(now);
  const month =
    initialMonth && MONTHS.some((m) => m.value === initialMonth)
      ? initialMonth
      : currentMonthValue(now);
  const year =
    initialYear && years.includes(initialYear)
      ? initialYear
      : String(now.getFullYear());
  return { month, year };
}

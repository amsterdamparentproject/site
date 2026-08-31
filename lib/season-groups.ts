// Shared helpers for /season-groups: matching a visitor's due month/year
// against each Season Group's due_start/due_end range, and formatting that
// range for display. Kept separate from lib/fyp/situation.ts (which owns
// MONTHS/situationYears) since these are season-groups-specific.

import { MONTHS } from "@/lib/fyp/situation";
import { SeasonGroup } from "@/app/types/groups-directory";

/**
 * Represents a due month/year as a mid-month Date so it can be compared
 * against a due_start/due_end range. The exact day never matters here —
 * Season Groups span multiple months, so a day-of-month a few hours off
 * across timezones can never cross a range boundary.
 */
export function dueDateFromMonthYear(month: string, year: string): Date | null {
  if (!month || !year) return null;
  const monthIdx = MONTHS.findIndex((m) => m.value === month);
  if (monthIdx === -1) return null;
  const yearNum = Number(year);
  if (!Number.isFinite(yearNum)) return null;
  return new Date(yearNum, monthIdx, 15);
}

/** The Season Group whose due_start/due_end range contains the given due month/year, if any. */
export function findMatchedSeasonGroup(
  groups: SeasonGroup[],
  month: string,
  year: string,
): SeasonGroup | null {
  const dueDate = dueDateFromMonthYear(month, year);
  if (!dueDate) return null;
  return (
    groups.find((g) => {
      if (!g.due_start || !g.due_end) return false;
      const start = new Date(g.due_start);
      const end = new Date(g.due_end);
      return dueDate >= start && dueDate <= end;
    }) ?? null
  );
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ISO date-only strings (e.g. "2026-06-01") parse as UTC midnight, so read
// them back with the UTC getters — using local getters here would risk an
// off-by-one month/year near a boundary depending on the reader's timezone.
function shortMonthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Due Jun–Jul 2026" (or "Due Dec 2026 – Jan 2027" across a year boundary). */
export function formatDueRangeLabel(
  dueStart: string | null,
  dueEnd: string | null,
): string {
  if (!dueStart && !dueEnd) return "";
  if (dueStart && !dueEnd) return `Due from ${shortMonthYear(dueStart)}`;
  if (!dueStart && dueEnd) return `Due through ${shortMonthYear(dueEnd)}`;

  const start = new Date(dueStart as string);
  const end = new Date(dueEnd as string);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const startLabel = sameYear
    ? MONTH_SHORT[start.getUTCMonth()]
    : shortMonthYear(dueStart as string);
  return `Due ${startLabel}–${shortMonthYear(dueEnd as string)}`;
}

/** Ascending by due_start; groups with no due_start sort last. */
export function sortByDueStart(groups: SeasonGroup[]): SeasonGroup[] {
  return [...groups].sort((a, b) => {
    if (!a.due_start && !b.due_start) return 0;
    if (!a.due_start) return 1;
    if (!b.due_start) return -1;
    return a.due_start.localeCompare(b.due_start);
  });
}

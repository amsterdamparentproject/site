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

/**
 * Every Season Group whose due_start/due_end range contains the given due
 * month/year — plural because the same season can have more than one row
 * (e.g. a WhatsApp group and a Facebook group sharing identical dates; see
 * populate-season-group-dates.mts). Callers must not assume there's only
 * one match: silently picking the first would join/highlight whichever
 * platform happened to sort first, not the one the visitor actually wants.
 */
export function findMatchedSeasonGroups(
  groups: SeasonGroup[],
  month: string,
  year: string,
): SeasonGroup[] {
  const dueDate = dueDateFromMonthYear(month, year);
  if (!dueDate) return [];
  return groups.filter((g) => {
    if (!g.due_start || !g.due_end) return false;
    const start = new Date(g.due_start);
    const end = new Date(g.due_end);
    return dueDate >= start && dueDate <= end;
  });
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

/**
 * "For babies between Jun–Jul 2026" (or "For babies between Dec 2026–Jan
 * 2027" across a year boundary) — plain descriptive copy, not a category
 * label, so callers should render it like the group description rather
 * than a tag/pill.
 */
export function formatDueRangeLabel(
  dueStart: string | null,
  dueEnd: string | null,
): string {
  if (!dueStart && !dueEnd) return "";
  if (dueStart && !dueEnd)
    return `For babies due from ${shortMonthYear(dueStart)}`;
  if (!dueStart && dueEnd)
    return `For babies due through ${shortMonthYear(dueEnd)}`;

  const start = new Date(dueStart as string);
  const end = new Date(dueEnd as string);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const startLabel = sameYear
    ? MONTH_SHORT[start.getUTCMonth()]
    : shortMonthYear(dueStart as string);
  return `For babies between ${startLabel}–${shortMonthYear(dueEnd as string)}`;
}

/** Adds "Season" to a member's existing categories without duplicating it. */
export function mergeSeasonCategory(categories: string[]): string[] {
  return categories.includes("Season") ? categories : [...categories, "Season"];
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

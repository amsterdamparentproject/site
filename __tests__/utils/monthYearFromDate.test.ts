/**
 * monthYearFromDate() — lib/fyp/months.ts
 *
 * Converts a Postgres `date` column value ("YYYY-MM-DD") into the
 * { month, year } shape FYPJoinForm's due-date <select>s use ("jan".."dec"
 * + a plain year string). Feeds toLegacyPrefill() — see
 * __tests__/utils/toLegacyPrefill.test.ts.
 */

import { describe, it, expect } from "vitest";
import { monthYearFromDate } from "@/lib/fyp/months";

describe("monthYearFromDate", () => {
  it("converts a September date to { month: 'sep', year: '2026' }", () => {
    expect(monthYearFromDate("2026-09-15")).toEqual({
      month: "sep",
      year: "2026",
    });
  });

  it("converts a January date correctly (start-of-year edge)", () => {
    expect(monthYearFromDate("2027-01-01")).toEqual({
      month: "jan",
      year: "2027",
    });
  });

  it("converts a December date correctly (end-of-year edge)", () => {
    expect(monthYearFromDate("2026-12-31")).toEqual({
      month: "dec",
      year: "2026",
    });
  });

  it("returns null for an empty string", () => {
    expect(monthYearFromDate("")).toBeNull();
  });

  it("returns null for an unparseable value", () => {
    expect(monthYearFromDate("not-a-date")).toBeNull();
  });

  it("anchors on UTC so a date-only value doesn't roll back a day west of UTC", () => {
    // A naive `new Date("2026-09-01").getMonth()` (local-timezone getter)
    // would return August, not September, in any timezone behind UTC —
    // this is the regression this test guards against.
    expect(monthYearFromDate("2026-09-01")).toEqual({
      month: "sep",
      year: "2026",
    });
  });
});

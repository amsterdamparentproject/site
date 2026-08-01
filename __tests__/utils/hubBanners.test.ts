/**
 * app/hub/hub-banners.ts — pure decision helpers behind the Hub's
 * billing_start_date-driven banners (the layout's "Live events start..."
 * banner, the Home tab's Events calendar card, and the welcome banner's
 * familyType split). Extracted specifically so this logic is unit-testable
 * without rendering the components — see that file's own docs, same
 * reasoning as postpartumPostBanner.test.ts.
 */

import { describe, it, expect } from "vitest";
import {
  formatEventsStart,
  formatStartMonth,
  getWelcomeBannerVariant,
  hasEventsStarted,
} from "@/app/hub/hub-banners";

describe("hasEventsStarted", () => {
  const now = new Date("2026-08-01T00:00:00Z");

  it("is false for a null billing_start_date (e.g. a still-pending account)", () => {
    expect(hasEventsStarted(null, now)).toBe(false);
  });

  it("is false when billing_start_date is in the future", () => {
    expect(hasEventsStarted("2026-09-01", now)).toBe(false);
  });

  it("is true when billing_start_date is in the past", () => {
    expect(hasEventsStarted("2026-01-15", now)).toBe(true);
  });

  it("is true when billing_start_date is exactly now", () => {
    expect(hasEventsStarted("2026-08-01T00:00:00Z", now)).toBe(true);
  });
});

describe("formatEventsStart", () => {
  it("falls back to 'soon' for a null billing_start_date", () => {
    expect(formatEventsStart(null)).toBe("soon");
  });

  it("formats as 'Month YYYY' for a September 2026 date", () => {
    expect(formatEventsStart("2026-09-01")).toBe("September 2026");
  });

  it("formats as 'Month YYYY' for a January date (year boundary)", () => {
    expect(formatEventsStart("2027-01-15")).toBe("January 2027");
  });
});

describe("formatStartMonth", () => {
  it("formats a September date as 'September' (no year)", () => {
    expect(formatStartMonth("2026-09-01")).toBe("September");
  });

  it("formats a December date as 'December'", () => {
    expect(formatStartMonth("2026-12-25")).toBe("December");
  });
});

describe("getWelcomeBannerVariant", () => {
  it("returns 'multi' for a multi-parent family", () => {
    expect(getWelcomeBannerVariant("multi")).toBe("multi");
  });

  it("returns 'single' for a single-parent family", () => {
    expect(getWelcomeBannerVariant("single")).toBe("single");
  });

  it("falls back to 'single' for any unrecognized value", () => {
    expect(getWelcomeBannerVariant("")).toBe("single");
    expect(getWelcomeBannerVariant("unknown")).toBe("single");
  });
});

/**
 * toLegacyPrefill() — lib/fyp/legacy-prefill.ts
 *
 * Shapes a firstyear.ftp_legacy row (name/email/due_birth_date) into
 * FYPJoinForm's prefill props. Used by
 * app/programs/first-year/page.tsx's server-side ?legacyId= lookup — see
 * that file's comment for why this happens server-side rather than via the
 * URL.
 */

import { describe, it, expect } from "vitest";
import { toLegacyPrefill } from "@/lib/fyp/legacy-prefill";

describe("toLegacyPrefill", () => {
  it("splits name and passes email through unchanged", () => {
    expect(
      toLegacyPrefill({
        name: "Jane Doe",
        email: "jane@example.com",
        due_birth_date: null,
      }),
    ).toEqual({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
    });
  });

  it("includes month/year when due_birth_date is set", () => {
    expect(
      toLegacyPrefill({
        name: "Jane Doe",
        email: "jane@example.com",
        due_birth_date: "2026-09-15",
      }),
    ).toEqual({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      month: "sep",
      year: "2026",
    });
  });

  it("omits month/year (rather than including them as undefined) when due_birth_date is null", () => {
    const result = toLegacyPrefill({
      name: "Jane Doe",
      email: "jane@example.com",
      due_birth_date: null,
    });
    expect("month" in result).toBe(false);
    expect("year" in result).toBe(false);
  });

  it("handles a multi-word first name via the same last-word-is-lastName rule as splitName", () => {
    expect(
      toLegacyPrefill({
        name: "Mary Jane Smith",
        email: "mary@example.com",
        due_birth_date: null,
      }),
    ).toEqual({
      firstName: "Mary Jane",
      lastName: "Smith",
      email: "mary@example.com",
    });
  });
});

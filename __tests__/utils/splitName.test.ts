/**
 * splitName() — lib/fyp/split-name.ts
 *
 * ftp_legacy only stores a single `name` column, but the legacy-transition
 * email's personalized "Register" link (buildJoinUrl) and the FYP sign-up
 * form both need firstName/lastName separately. Rule (per Alex, confirmed
 * 2026-08-01): the last whitespace-separated word is the last name,
 * everything before it is the first name.
 */

import { describe, it, expect } from "vitest";
import { splitName } from "@/lib/fyp/split-name";

describe("splitName", () => {
  it("splits a simple two-word name", () => {
    expect(splitName("Jane Doe")).toEqual({
      firstName: "Jane",
      lastName: "Doe",
    });
  });

  it("treats every word before the last as the first name", () => {
    expect(splitName("Mary Jane Smith")).toEqual({
      firstName: "Mary Jane",
      lastName: "Smith",
    });
  });

  it("returns an empty lastName for a single-word name", () => {
    expect(splitName("Cher")).toEqual({ firstName: "Cher", lastName: "" });
  });

  it("collapses repeated internal whitespace", () => {
    expect(splitName("Jane   Doe")).toEqual({
      firstName: "Jane",
      lastName: "Doe",
    });
  });

  it("trims leading/trailing whitespace", () => {
    expect(splitName("  Jane Doe  ")).toEqual({
      firstName: "Jane",
      lastName: "Doe",
    });
  });
});

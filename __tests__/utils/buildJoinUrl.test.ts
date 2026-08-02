/**
 * buildJoinUrl() — lib/emails/fyp-legacy-transition.ts
 *
 * Builds the personalized "Register" link in the FTP→FYP legacy-transition
 * email: /programs/first-year#join with the ftp_legacy row's own uuid as
 * ?legacyId=. Deliberately carries no PII (see the function's own doc for
 * why — an earlier version put firstName/lastName/email directly in the
 * query string, which Alex flagged as a privacy problem). The read side —
 * app/programs/first-year/page.tsx resolving that id back into prefill
 * fields server-side — is covered by __tests__/utils/toLegacyPrefill.test.ts
 * (the DB-row → prefill-shape transform) and
 * e2e/fyp-join-form-prefill.spec.ts (the full loop through a real page load).
 */

import { describe, it, expect } from "vitest";
import { buildJoinUrl } from "@/lib/emails/fyp-legacy-transition";

describe("buildJoinUrl", () => {
  it("builds a URL with legacyId as the only query param and a #join hash", () => {
    const url = buildJoinUrl("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    expect(url).toBe(
      "https://amsterdamparentproject.nl/programs/first-year?legacyId=3fa85f64-5717-4562-b3fc-2c963f66afa6#join",
    );
  });

  it("always points at the production domain, never a preview/local one", () => {
    const url = buildJoinUrl("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    expect(url.startsWith("https://amsterdamparentproject.nl/")).toBe(true);
  });

  it("carries no PII — the query string is exactly one legacyId param", () => {
    const url = buildJoinUrl("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    const params = new URL(url).searchParams;
    expect([...params.keys()]).toEqual(["legacyId"]);
  });

  it("keeps the #join hash after the query string, not swallowed into it", () => {
    const url = buildJoinUrl("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    expect(url.endsWith("#join")).toBe(true);
    expect(new URL(url).hash).toBe("#join");
  });
});

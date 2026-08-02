/**
 * FYPJoinForm prefill via ?legacyId= — E2E
 *
 * The legacy-transition email's personalized "Register" button
 * (lib/emails/fyp-legacy-transition.ts's buildJoinUrl) links to
 * /programs/first-year?legacyId=<ftp_legacy row id>#join.
 * app/programs/first-year/page.tsx resolves that id server-side (name/
 * email/due_birth_date, via toLegacyPrefill) and passes the result down
 * through FirstYearProgramClient.tsx into FYPJoinForm.tsx's
 * initialFirstName/initialLastName/initialEmail/initialMonth/initialYear
 * props.
 *
 * Corrected 2026-08-01 (per Alex): an earlier version of this test/feature
 * put firstName/lastName/email straight in the URL query string. That's a
 * real privacy problem — PII in browser history, server/CDN logs,
 * analytics tools, and Referer headers — so the URL now carries only an
 * opaque uuid, and this test seeds a real DB row rather than just
 * constructing a URL with fake params (there's no client-side prefill left
 * to test directly; the URL alone proves nothing without the DB lookup
 * behind it).
 *
 * buildJoinUrl's own URL-construction and toLegacyPrefill's row→prefill
 * shape are covered by unit tests (__tests__/utils/buildJoinUrl.test.ts,
 * __tests__/utils/toLegacyPrefill.test.ts) — this test covers the one
 * thing those can't: that a real ?legacyId= URL actually lands on
 * prefilled, editable form fields once the server lookup + React hydration
 * both complete.
 *
 * Doesn't complete checkout — e2e/fyp-checkout.spec.ts already covers the
 * full submit → Stripe → webhook journey from a blank form; duplicating
 * that here would only add runtime, not coverage.
 */

import { test, expect } from "@playwright/test";
import { seedFtpLegacyRow, cleanupFtpLegacyRow } from "./helpers/fyp-db";

test("prefills first name, last name, email, and due date from a real ftp_legacy row", async ({
  page,
}) => {
  const row = await seedFtpLegacyRow({
    name: "Mary Jane Smith",
    dueBirthDate: "2026-09-15",
  });

  try {
    await page.goto(`/programs/first-year?legacyId=${row.id}#join`);

    const joinSection = page.locator("#join");
    // Next.js streaming can transiently duplicate elements before
    // hydration completes — same guard fyp-checkout.spec.ts's
    // fillJoinForm uses.
    await expect(joinSection.locator("form")).toHaveCount(1, {
      timeout: 10_000,
    });

    await expect(joinSection.locator("#first-name")).toHaveValue("Mary Jane");
    await expect(joinSection.locator("#last-name")).toHaveValue("Smith");
    await expect(joinSection.locator("#email")).toHaveValue(row.email);

    const monthSelect = joinSection.locator("#due-month");
    const yearSelect = joinSection.locator("select").nth(1);
    await expect(monthSelect).toHaveValue("sep");
    await expect(yearSelect).toHaveValue("2026");

    // Prefilled fields are still ordinary controlled inputs — editable,
    // not read-only — so a family member correcting a typo doesn't hit a
    // wall.
    await joinSection.locator("#first-name").fill("Marie");
    await expect(joinSection.locator("#first-name")).toHaveValue("Marie");
  } finally {
    await cleanupFtpLegacyRow(row.id);
  }
});

test("leaves fields blank for an unknown legacyId (broken/reused link degrades gracefully)", async ({
  page,
}) => {
  await page.goto(
    "/programs/first-year?legacyId=00000000-0000-0000-0000-000000000000#join",
  );

  const joinSection = page.locator("#join");
  await expect(joinSection.locator("form")).toHaveCount(1, {
    timeout: 10_000,
  });

  await expect(joinSection.locator("#first-name")).toHaveValue("");
  await expect(joinSection.locator("#last-name")).toHaveValue("");
  await expect(joinSection.locator("#email")).toHaveValue("");
});

test("leaves fields blank when no legacyId is present at all", async ({
  page,
}) => {
  await page.goto("/programs/first-year#join");

  const joinSection = page.locator("#join");
  await expect(joinSection.locator("form")).toHaveCount(1, {
    timeout: 10_000,
  });

  await expect(joinSection.locator("#first-name")).toHaveValue("");
  await expect(joinSection.locator("#last-name")).toHaveValue("");
  await expect(joinSection.locator("#email")).toHaveValue("");
});

test("never puts name or email in the page URL", async ({ page }) => {
  const row = await seedFtpLegacyRow({
    name: "Mary Jane Smith",
    dueBirthDate: "2026-09-15",
  });

  try {
    await page.goto(`/programs/first-year?legacyId=${row.id}#join`);
    await expect(page.locator("#join").locator("form")).toHaveCount(1, {
      timeout: 10_000,
    });

    // Regression guard for the privacy issue this feature was rebuilt to
    // fix: the browser's own address bar should never end up carrying the
    // person's name or email, no matter how the prefill resolves.
    expect(page.url()).not.toContain("Mary");
    expect(page.url()).not.toContain("Smith");
    expect(page.url()).not.toContain(encodeURIComponent(row.email));
  } finally {
    await cleanupFtpLegacyRow(row.id);
  }
});

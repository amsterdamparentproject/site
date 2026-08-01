/**
 * Hub account-status banners — E2E
 * (app/hub/(account)/layout.tsx's WelcomeBanner + "Live events start..."
 * banner, and app/hub/(account)/home/page.tsx's Events calendar card)
 *
 * Unit coverage for the underlying pure decision logic
 * (hasEventsStarted/formatEventsStart/formatStartMonth/
 * getWelcomeBannerVariant) lives in __tests__/utils/hubBanners.test.ts —
 * these tests instead cover the two things that only show up with a real
 * render: which banner copy actually appears for which familyType, and
 * that billing_start_date drives both the layout banner and the Home tab's
 * calendar card consistently.
 *
 * Dates are computed relative to "now" rather than hardcoded, so these
 * don't rot as the real PROGRAM_START date (2026-09-01) recedes into the
 * past.
 */

import { test, expect } from "@playwright/test";
import {
  seedActiveAccountWithMember,
  cleanupAccountByEmail,
} from "./helpers/fyp-db";
import { signInToHubAs } from "./helpers/hub-auth";

function isoDateDaysFromNow(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function monthNameFor(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", { month: "long" });
}

test.describe("Welcome banner — familyType split", () => {
  test("multi-parent family is nudged to add their partner via the Account tab", async ({
    page,
  }) => {
    const member = await seedActiveAccountWithMember({ familyType: "multi" });

    try {
      await signInToHubAs(page, member.email);
      await page.goto("/hub/home?welcome=1");

      await expect(
        page.getByText(/welcome to the first year program/i),
      ).toBeVisible();
      await expect(
        page.getByText(/add your partner so they can start getting set up/i),
      ).toBeVisible();
      await expect(
        page.getByText(/start meeting the other parents/i),
      ).not.toBeVisible();
    } finally {
      await cleanupAccountByEmail(member.email);
    }
  });

  test("single-parent family is nudged to join the WhatsApp group", async ({
    page,
  }) => {
    const member = await seedActiveAccountWithMember({
      familyType: "single",
    });

    try {
      await signInToHubAs(page, member.email);
      await page.goto("/hub/home?welcome=1");

      await expect(
        page.getByText(/welcome to the first year program/i),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "WhatsApp group" }),
      ).toBeVisible();
      await expect(
        page.getByText(/add your partner so they can start getting set up/i),
      ).not.toBeVisible();
    } finally {
      await cleanupAccountByEmail(member.email);
    }
  });
});

test.describe("billing_start_date-driven banners", () => {
  test("not-yet-started bundle (active status, future billing_start_date) shows the events-start banner and calendar placeholder with the right month", async ({
    page,
  }) => {
    const future = isoDateDaysFromNow(45);
    const month = monthNameFor(future);
    const member = await seedActiveAccountWithMember({
      status: "active",
      billingStartDate: future,
    });

    try {
      await signInToHubAs(page, member.email);
      await page.goto("/hub/home");

      // Layout's "Live events start [Month Year]..." banner — status is
      // "active" here (bundles flip active immediately at checkout, see
      // the webhook), so this only shows because billing_start_date, not
      // accountStatus, gates it.
      await expect(
        page.getByText(new RegExp(`live events start ${month}`, "i")),
      ).toBeVisible();

      // Home tab's Events calendar card shows the same month, no year.
      await expect(
        page.getByText(new RegExp(`starting in ${month}`, "i")),
      ).toBeVisible();
    } finally {
      await cleanupAccountByEmail(member.email);
    }
  });

  test("started program (billing_start_date in the past) hides both the events-start banner and the calendar placeholder", async ({
    page,
  }) => {
    const past = isoDateDaysFromNow(-30);
    const member = await seedActiveAccountWithMember({
      status: "active",
      billingStartDate: past,
    });

    try {
      await signInToHubAs(page, member.email);
      await page.goto("/hub/home");

      await expect(page.getByText(/live events start/i)).not.toBeVisible();
      await expect(page.getByText(/starting in/i)).not.toBeVisible();
      await expect(page.getByText(/starting soon/i)).not.toBeVisible();
    } finally {
      await cleanupAccountByEmail(member.email);
    }
  });

  test("no billing_start_date yet falls back to 'soon'/'Starting soon' rather than looking started", async ({
    page,
  }) => {
    // Omitting billingStartDate leaves it unset (null) — the shape of a
    // real account before the webhook ever sets it (see
    // app/api/checkout/fyp/route.ts), even though status here is already
    // "active" (bundles flip active immediately at checkout).
    const member = await seedActiveAccountWithMember({ status: "active" });

    try {
      await signInToHubAs(page, member.email);
      await page.goto("/hub/home");

      await expect(page.getByText(/live events start soon/i)).toBeVisible();
      await expect(page.getByText(/starting soon/i)).toBeVisible();
    } finally {
      await cleanupAccountByEmail(member.email);
    }
  });
});

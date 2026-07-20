/**
 * Integration tests: FYP cancellation lifecycle.
 *
 * Like fyp-pending-to-active.test.ts, these hit the REAL firstyear schema in
 * the test Supabase project (via createFirstYearClient(), unmocked) so we can
 * verify exact DB state. Stripe is mocked — no real subscriptions/charges.
 *
 * Covers all four FYP flows that can reach an active, cancelable account:
 *   - expecting_monthly / baby_monthly (plan_type: monthly, real Stripe subscription)
 *   - expecting_bundle / baby_bundle    (plan_type: bundle, one-time payment, no subscription)
 *
 * Expected behavior for all four: cancelFypAccount() sets status to
 * "canceling" (access continues), and the account only reaches "canceled"
 * once the period actually ends:
 *   - monthly: via the customer.subscription.deleted webhook handler, the
 *              same day Stripe's period actually ends.
 *   - bundle:  via the /api/fyp/process-bundle-cancellations sweep, which
 *              only runs once a month — so it finalizes on the run
 *              immediately preceding bundle_expires_at (start of next
 *              month), not once bundle_expires_at has simply "passed".
 *              Comparing against "today" instead would leave a canceling
 *              bundle account sitting an extra month past its actual term
 *              end, exactly the window where a same-day PP comp-sync run
 *              would hand out a free month it isn't entitled to. A bundle
 *              account "canceling" well before its term ends must NOT be
 *              touched by that sweep either way.
 *
 * Prerequisites:
 *   NEXT_PUBLIC_TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY must be set
 *   (loaded automatically from .env.test by Vitest via Vite's env handling).
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
vi.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

// Mock Stripe — we don't want real API calls, but we DO want real Supabase.
vi.mock("@/lib/stripe-client", () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    subscriptions: { update: vi.fn() },
  },
}));

// Do NOT mock @/lib/supabase/server — cancelFypAccount() and the route
// handlers use createFirstYearClient(), which reads
// NEXT_PUBLIC_TEST_SUPABASE_URL from .env.test, hitting the real test DB.

import { stripe } from "@/lib/stripe-client";
import { createClient } from "@supabase/supabase-js";
import { cancelFypAccount } from "@/lib/fyp/subscription";

// ─── Test DB client ───────────────────────────────────────────────────────────

let _db: ReturnType<typeof createClient> | null = null;
function testDb() {
  if (_db) return _db;
  const url = process.env.NEXT_PUBLIC_TEST_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing NEXT_PUBLIC_TEST_SUPABASE_URL or TEST_SUPABASE_SERVICE_ROLE_KEY — " +
        "check .env.test",
    );
  _db = createClient(url, key, { db: { schema: "firstyear" } });
  return _db;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface SeedAccountInput {
  sessionId: string;
  flow: string;
  planType: "monthly" | "bundle";
  familyType?: "single" | "multi";
  stripeSubscriptionId?: string | null;
  bundleExpiresAt?: string | null;
}

async function seedActiveAccount(input: SeedAccountInput): Promise<string> {
  const db = testDb();
  const { data, error } = await db
    .from("accounts")
    .insert({
      stripe_session_id: input.sessionId,
      stripe_customer_id: `cus_cancel_test_${input.sessionId}`,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      flow: input.flow,
      plan_type: input.planType,
      family_type: input.familyType ?? "single",
      billing_start_date: "2026-09-01",
      bundle_expires_at: input.bundleExpiresAt ?? null,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to seed test account: ${JSON.stringify(error)}`);
  }
  return data.id as string;
}

async function getAccountStatus(accountId: string): Promise<string> {
  const db = testDb();
  const { data } = await db
    .from("accounts")
    .select("status")
    .eq("id", accountId)
    .single();
  return data?.status;
}

async function cleanupAccount(accountId: string) {
  const db = testDb();
  await db.from("accounts").delete().eq("id", accountId);
}

function makeWebhookRequest(event: object) {
  return {
    text: async () => JSON.stringify(event),
    headers: {
      get: (h: string) => (h === "stripe-signature" ? "test-sig" : null),
    },
  } as any;
}

function makeApiRequest(body: object, authSecret?: string) {
  return {
    json: async () => body,
    headers: {
      get: (h: string) =>
        h.toLowerCase() === "authorization" && authSecret
          ? `Bearer ${authSecret}`
          : null,
    },
  } as any;
}

const RUN_ID = Date.now();

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("FYP cancellation lifecycle", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Monthly flows: cancel_at_period_end via Stripe, webhook finalizes ────────

  describe.each([
    { flow: "expecting_monthly", familyType: "multi" as const },
    { flow: "baby_monthly", familyType: "single" as const },
  ])("$flow (plan_type: monthly)", ({ flow, familyType }) => {
    const SESSION_ID = `cs_cancel_${RUN_ID}_${flow}`;
    const SUBSCRIPTION_ID = `sub_cancel_${RUN_ID}_${flow}`;
    let accountId: string;

    beforeEach(async () => {
      accountId = await seedActiveAccount({
        sessionId: SESSION_ID,
        flow,
        planType: "monthly",
        familyType,
        stripeSubscriptionId: SUBSCRIPTION_ID,
      });
    });

    afterEach(() => cleanupAccount(accountId));

    it(`[${flow}] sets cancel_at_period_end on Stripe and marks the account "canceling"`, async () => {
      vi.mocked(stripe.subscriptions.update).mockResolvedValue({} as any);

      await cancelFypAccount(accountId);

      expect(stripe.subscriptions.update).toHaveBeenCalledWith(
        SUBSCRIPTION_ID,
        { cancel_at_period_end: true },
      );
      expect(await getAccountStatus(accountId)).toBe("canceling");
    });

    it(`[${flow}] flips to "canceled" once customer.subscription.deleted fires for that subscription`, async () => {
      vi.mocked(stripe.subscriptions.update).mockResolvedValue({} as any);
      await cancelFypAccount(accountId);
      expect(await getAccountStatus(accountId)).toBe("canceling");

      vi.resetModules();
      const { POST: POST_webhook } = (await import(
        "@/app/api/webhooks/stripe/fyp/route"
      )) as any;

      const webhookEvent = {
        type: "customer.subscription.deleted",
        data: { object: { id: SUBSCRIPTION_ID } },
      };
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        webhookEvent as any,
      );

      const res = await POST_webhook(makeWebhookRequest(webhookEvent));
      expect(res.status).toBe(200);
      expect(await getAccountStatus(accountId)).toBe("canceled");
    });
  });

  // ── Bundle flows: no Stripe subscription, DB-only until finalize sweep ──────

  describe.each([
    { flow: "expecting_bundle", familyType: "single" as const },
    { flow: "baby_bundle", familyType: "multi" as const },
  ])("$flow (plan_type: bundle)", ({ flow, familyType }) => {
    const makeSessionId = (suffix: string) =>
      `cs_cancel_${RUN_ID}_${flow}_${suffix}`;

    it('marks the account "canceling" with no Stripe call (one-time payment, nothing to update)', async () => {
      const accountId = await seedActiveAccount({
        sessionId: makeSessionId("basic"),
        flow,
        planType: "bundle",
        familyType,
        bundleExpiresAt: "2027-03-01", // still in the future
      });

      try {
        await cancelFypAccount(accountId);

        expect(stripe.subscriptions.update).not.toHaveBeenCalled();
        expect(await getAccountStatus(accountId)).toBe("canceling");
      } finally {
        await cleanupAccount(accountId);
      }
    });

    it(`[${flow}] stays "canceling" through process-bundle-cancellations while bundle_expires_at is still in the future`, async () => {
      const accountId = await seedActiveAccount({
        sessionId: makeSessionId("future"),
        flow,
        planType: "bundle",
        familyType,
        bundleExpiresAt: "2027-03-01",
      });

      try {
        await cancelFypAccount(accountId);
        expect(await getAccountStatus(accountId)).toBe("canceling");

        vi.resetModules();
        const { POST: POST_process } = (await import(
          "@/app/api/fyp/process-bundle-cancellations/route"
        )) as any;
        process.env.FYP_PROCESS_BUNDLE_CANCELLATIONS_API_SECRET = "test-secret";

        const res = await POST_process(makeApiRequest({}, "test-secret"));
        expect(res.status).toBe(200);

        // Term hasn't ended yet — must NOT be processed.
        expect(await getAccountStatus(accountId)).toBe("canceling");
      } finally {
        await cleanupAccount(accountId);
      }
    });

    it(`[${flow}] flips to "canceled" via process-bundle-cancellations once bundle_expires_at has passed`, async () => {
      const accountId = await seedActiveAccount({
        sessionId: makeSessionId("past"),
        flow,
        planType: "bundle",
        familyType,
        bundleExpiresAt: "2020-01-01", // long past — also covers catch-up of a missed run
      });

      try {
        await cancelFypAccount(accountId);
        expect(await getAccountStatus(accountId)).toBe("canceling");

        vi.resetModules();
        const { POST: POST_process } = (await import(
          "@/app/api/fyp/process-bundle-cancellations/route"
        )) as any;
        process.env.FYP_PROCESS_BUNDLE_CANCELLATIONS_API_SECRET = "test-secret";

        const res = await POST_process(makeApiRequest({}, "test-secret"));
        expect(res.status).toBe(200);
        expect(await getAccountStatus(accountId)).toBe("canceled");
      } finally {
        await cleanupAccount(accountId);
      }
    });

    it(`[${flow}] flips to "canceled" when bundle_expires_at is the 1st of next month — the run that precedes actual term end, not a month late`, async () => {
      // Regression test: this job only runs once a month, and
      // bundle_expires_at is always the 1st of some month. Comparing
      // against "today" instead of "start of next month" would leave this
      // account "canceling" for a full extra month after its term ends —
      // exactly the window where a same-day PP comp-sync run would hand
      // out a free month nobody's entitled to. See the route's docblock.
      const now = new Date();
      const startOfNextMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
      )
        .toISOString()
        .slice(0, 10);

      const accountId = await seedActiveAccount({
        sessionId: makeSessionId("ends-next-month"),
        flow,
        planType: "bundle",
        familyType,
        bundleExpiresAt: startOfNextMonth,
      });

      try {
        await cancelFypAccount(accountId);
        expect(await getAccountStatus(accountId)).toBe("canceling");

        vi.resetModules();
        const { POST: POST_process } = (await import(
          "@/app/api/fyp/process-bundle-cancellations/route"
        )) as any;
        process.env.FYP_PROCESS_BUNDLE_CANCELLATIONS_API_SECRET = "test-secret";

        const res = await POST_process(makeApiRequest({}, "test-secret"));
        expect(res.status).toBe(200);
        expect(await getAccountStatus(accountId)).toBe("canceled");
      } finally {
        await cleanupAccount(accountId);
      }
    });

    it(`[${flow}] process-bundle-cancellations never touches an "active" bundle account, even past bundle_expires_at`, async () => {
      const accountId = await seedActiveAccount({
        sessionId: makeSessionId("active-past-term"),
        flow,
        planType: "bundle",
        familyType,
        bundleExpiresAt: "2020-01-01", // long past, but never canceled
      });

      try {
        vi.resetModules();
        const { POST: POST_process } = (await import(
          "@/app/api/fyp/process-bundle-cancellations/route"
        )) as any;
        process.env.FYP_PROCESS_BUNDLE_CANCELLATIONS_API_SECRET = "test-secret";

        await POST_process(makeApiRequest({}, "test-secret"));

        // Lifetime-access design (fyp-improvements-plan.md § Bundle term-end
        // tracking): an account that never asked to cancel stays "active"
        // past term-end — this sweep must not be the thing that ages it out.
        expect(await getAccountStatus(accountId)).toBe("active");
      } finally {
        await cleanupAccount(accountId);
      }
    });
  });

  // ── Guardrails ────────────────────────────────────────────────────────────

  it("throws and makes no Stripe call when the account is not active", async () => {
    const accountId = await seedActiveAccount({
      sessionId: `cs_cancel_${RUN_ID}_already_canceled`,
      flow: "expecting_monthly",
      planType: "monthly",
      stripeSubscriptionId: `sub_cancel_${RUN_ID}_already_canceled`,
    });
    await testDb()
      .from("accounts")
      .update({ status: "canceled" })
      .eq("id", accountId);

    try {
      await expect(cancelFypAccount(accountId)).rejects.toThrow(/not active/);
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    } finally {
      await cleanupAccount(accountId);
    }
  });
});

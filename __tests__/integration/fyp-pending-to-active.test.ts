/**
 * Integration tests: FYP pending → active state transition.
 *
 * Unlike the unit tests (which mock Supabase), these tests hit the REAL
 * firstyear schema in the test Supabase project so we can verify the exact
 * DB state at each step of the checkout + webhook flow.
 *
 * Stripe is still mocked — we don't create real charges or subscriptions.
 *
 * Prerequisites:
 *   NEXT_PUBLIC_TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY must be set
 *   (loaded automatically from .env.test by Vitest via Vite's env handling).
 *
 * What each test covers:
 *   1. Checkout route creates PENDING rows in both accounts + members
 *   2. Webhook route updates both rows to ACTIVE with correct billing fields
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
// next/server is not available in the vitest jsdom environment.
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
    checkout: { sessions: { create: vi.fn() } },
    webhooks: { constructEvent: vi.fn() },
    prices: { list: vi.fn() },
    subscriptions: { create: vi.fn() },
  },
}));

// Do NOT mock @/lib/supabase/server — the route handlers use createFirstYearClient()
// which reads NEXT_PUBLIC_TEST_SUPABASE_URL from .env.test, hitting the real test DB.

import { stripe } from "@/lib/stripe-client";
import { createClient } from "@supabase/supabase-js";

// ─── Test DB client ───────────────────────────────────────────────────────────

/** Direct Supabase client for the test firstyear schema. */
function testDb() {
  const url = process.env.NEXT_PUBLIC_TEST_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing NEXT_PUBLIC_TEST_SUPABASE_URL or TEST_SUPABASE_SERVICE_ROLE_KEY — " +
        "check .env.test",
    );
  return createClient(url, key, { db: { schema: "firstyear" } });
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function getAccountBySessionId(sessionId: string) {
  const db = testDb();
  const { data } = await db
    .from("accounts")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  return data;
}

async function getMembersByAccountId(accountId: string) {
  const db = testDb();
  const { data } = await db
    .from("members")
    .select("*")
    .eq("account_id", accountId);
  return data ?? [];
}

async function cleanupBySessionId(sessionId: string) {
  const db = testDb();
  const account = await getAccountBySessionId(sessionId);
  if (account) {
    // members cascade via ON DELETE CASCADE
    await db.from("accounts").delete().eq("id", account.id);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCheckoutRequest(body: object) {
  return { json: async () => body } as Request;
}

function makeWebhookRequest(event: object) {
  return {
    text: async () => JSON.stringify(event),
    headers: {
      get: (h: string) => (h === "stripe-signature" ? "test-sig" : null),
    },
  } as any;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("FYP pending → active state transition", () => {
  let POST_checkout: (
    req: Request,
  ) => Promise<{ body: unknown; status: number }>;
  let POST_webhook: (req: any) => Promise<{ body: unknown; status: number }>;

  const SESSION_ID = `cs_int_${Date.now()}`;
  const CUSTOMER_ID = "cus_int_test_001";
  const SUBSCRIPTION_ID = "sub_int_test_001";

  beforeEach(async () => {
    vi.resetModules();
    [{ POST: POST_checkout }, { POST: POST_webhook }] = await Promise.all([
      import("@/app/api/checkout/fyp/route") as Promise<any>,
      import("@/app/api/webhooks/stripe/fyp/route") as Promise<any>,
    ]);
  });

  // ── expecting_monthly ───────────────────────────────────────────────────────

  describe("expecting_monthly flow", () => {
    const SESSION = `${SESSION_ID}_exp`;
    const EMAIL = `int-expecting-${Date.now()}@example.com`;

    beforeEach(() => {
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
        id: SESSION,
        url: "https://checkout.stripe.com/test",
      } as any);
    });

    afterEach(() => cleanupBySessionId(SESSION));

    it("checkout creates pending account and member, webhook activates both", async () => {
      // ── Step 1: checkout creates pending records ──────────────────────────
      const checkoutRes = await POST_checkout(
        makeCheckoutRequest({
          flow: "expecting_monthly",
          familyType: "multi",
          dueOrBirthMonth: "oct",
          dueOrBirthYear: "2026",
          members: [{ firstName: "Test", lastName: "Expecting", email: EMAIL }],
        }),
      );
      expect(checkoutRes.status).toBe(200);

      // ── Verify PENDING state ──────────────────────────────────────────────
      const pendingAccount = await getAccountBySessionId(SESSION);
      expect(pendingAccount).not.toBeNull();
      expect(pendingAccount.status).toBe("pending");
      expect(pendingAccount.flow).toBe("expecting_monthly");
      expect(pendingAccount.stripe_customer_id).toBeNull();
      expect(pendingAccount.stripe_subscription_id).toBeNull();
      expect(pendingAccount.billing_start_date).toBeNull();

      const pendingMembers = await getMembersByAccountId(pendingAccount.id);
      expect(pendingMembers).toHaveLength(1);
      expect(pendingMembers[0].first_name).toBe("Test");
      expect(pendingMembers[0].last_name).toBe("Expecting");
      expect(pendingMembers[0].email).toBe(EMAIL);
      expect(pendingMembers[0].status).toBe("pending");

      // ── Step 2: webhook fires (Stripe payment complete) ───────────────────
      const webhookEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: SESSION,
            customer: CUSTOMER_ID,
            subscription: null,
            metadata: {
              product: "fyp_deposit",
              family_type: "multi",
              due_or_birth_month: "oct",
              due_or_birth_year: "2026",
            },
          },
        },
      };
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        webhookEvent as any,
      );
      vi.mocked(stripe.prices.list).mockResolvedValue({
        data: [{ id: "price_fyp_monthly_multi" }],
      } as any);
      vi.mocked(stripe.subscriptions.create).mockResolvedValue({
        id: SUBSCRIPTION_ID,
      } as any);

      const webhookRes = await POST_webhook(makeWebhookRequest(webhookEvent));
      expect(webhookRes.status).toBe(200);

      // ── Verify ACTIVE state ───────────────────────────────────────────────
      const activeAccount = await getAccountBySessionId(SESSION);
      expect(activeAccount.status).toBe("active");
      expect(activeAccount.stripe_customer_id).toBe(CUSTOMER_ID);
      expect(activeAccount.stripe_subscription_id).toBe(SUBSCRIPTION_ID);
      // Oct 2026 due date → billing starts Nov 1 2026 (after PROGRAM_START, no clamping)
      expect(activeAccount.billing_start_date).toBe("2026-11-01");

      const activeMembers = await getMembersByAccountId(activeAccount.id);
      expect(activeMembers).toHaveLength(1);
      expect(activeMembers[0].status).toBe("active");
    });
  });

  // ── baby_deposit ────────────────────────────────────────────────────────────

  describe("baby_deposit flow", () => {
    const SESSION = `${SESSION_ID}_baby`;
    const EMAIL = `int-baby-${Date.now()}@example.com`;

    beforeEach(() => {
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
        id: SESSION,
        url: "https://checkout.stripe.com/test",
      } as any);
    });

    afterEach(() => cleanupBySessionId(SESSION));

    it("checkout creates pending account and member, webhook activates both with billing_start_date=2026-09-01", async () => {
      // ── Step 1: checkout creates pending records ──────────────────────────
      const checkoutRes = await POST_checkout(
        makeCheckoutRequest({
          flow: "baby_deposit",
          familyType: "single",
          dueOrBirthMonth: "may",
          dueOrBirthYear: "2026",
          members: [{ firstName: "Test", lastName: "Baby", email: EMAIL }],
        }),
      );
      expect(checkoutRes.status).toBe(200);

      // ── Verify PENDING state ──────────────────────────────────────────────
      const pendingAccount = await getAccountBySessionId(SESSION);
      expect(pendingAccount).not.toBeNull();
      expect(pendingAccount.status).toBe("pending");
      expect(pendingAccount.flow).toBe("baby_deposit");
      expect(pendingAccount.stripe_customer_id).toBeNull();
      expect(pendingAccount.stripe_subscription_id).toBeNull();
      expect(pendingAccount.billing_start_date).toBeNull();

      const pendingMembers = await getMembersByAccountId(pendingAccount.id);
      expect(pendingMembers).toHaveLength(1);
      expect(pendingMembers[0].first_name).toBe("Test");
      expect(pendingMembers[0].last_name).toBe("Baby");
      expect(pendingMembers[0].email).toBe(EMAIL);
      expect(pendingMembers[0].status).toBe("pending");

      // ── Step 2: webhook fires ─────────────────────────────────────────────
      const webhookEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: SESSION,
            customer: CUSTOMER_ID,
            subscription: null,
            metadata: {
              product: "fyp_baby_deposit",
              family_type: "single",
              due_or_birth_month: "may",
              due_or_birth_year: "2026",
            },
          },
        },
      };
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        webhookEvent as any,
      );
      vi.mocked(stripe.prices.list).mockResolvedValue({
        data: [{ id: "price_fyp_monthly_single" }],
      } as any);
      vi.mocked(stripe.subscriptions.create).mockResolvedValue({
        id: SUBSCRIPTION_ID,
      } as any);

      const webhookRes = await POST_webhook(makeWebhookRequest(webhookEvent));
      expect(webhookRes.status).toBe(200);

      // ── Verify ACTIVE state ───────────────────────────────────────────────
      const activeAccount = await getAccountBySessionId(SESSION);
      expect(activeAccount.status).toBe("active");
      expect(activeAccount.stripe_customer_id).toBe(CUSTOMER_ID);
      expect(activeAccount.stripe_subscription_id).toBe(SUBSCRIPTION_ID);
      // baby_deposit always defers to PROGRAM_START
      expect(activeAccount.billing_start_date).toBe("2026-09-01");

      const activeMembers = await getMembersByAccountId(activeAccount.id);
      expect(activeMembers).toHaveLength(1);
      expect(activeMembers[0].status).toBe("active");
    });
  });
});

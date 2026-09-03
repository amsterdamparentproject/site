import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Hoisted mocks — must come before any imports that reference these modules
vi.mock("@/lib/stripe-client", () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
    prices: { list: vi.fn() },
    subscriptions: { create: vi.fn() },
  },
}));
vi.mock("@/lib/supabase/server", () => ({ createFirstYearClient: vi.fn() }));
vi.mock("@/lib/fyp/postpartum-post", () => ({
  deactivatePostpartumPost: vi.fn(),
}));
vi.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";
import { deactivatePostpartumPost } from "@/lib/fyp/postpartum-post";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCheckoutEvent(metadata: Record<string, string>) {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        customer: "cus_test_123",
        subscription: null,
        metadata,
      },
    },
  };
}

function makeRequest(body = "{}", signature = "sig") {
  return {
    text: async () => body,
    headers: {
      get: (h: string) => (h === "stripe-signature" ? signature : null),
    },
  } as any;
}

function mockSupabase() {
  const client = {
    from: vi.fn(() => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })),
  };
  vi.mocked(createFirstYearClient).mockReturnValue(client as any);
  return client;
}

function mockStripePrice() {
  vi.mocked(stripe.prices.list).mockResolvedValue({
    data: [{ id: "price_monthly_single" }],
  } as any);
}

function mockStripeSubscription() {
  const create = vi.mocked(stripe.subscriptions.create);
  create.mockResolvedValue({ id: "sub_test_123" } as any);
  return create;
}

// ─── expecting_monthly trial_end ──────────────────────────────────────────────

describe("fyp webhook — expecting_monthly trial_end", () => {
  let POST: (req: any) => Promise<unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ POST } = await import("@/app/api/webhooks/stripe/fyp/route"));
    mockSupabase();
    mockStripePrice();
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(
      (_body, _sig, _secret) => makeCheckoutEvent({}) as any,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes trial_end as the 1st of the month after a July 2026 due date", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent({
        product: "fyp_deposit",
        family_type: "single",
        due_or_birth_month: "jul",
        due_or_birth_year: "2026",
      }) as any,
    );
    const sub = mockStripeSubscription();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));

    await POST(makeRequest());

    expect(sub).toHaveBeenCalledOnce();
    const args = sub.mock.calls[0][0] as any;
    const aug1_2026 = Math.floor(
      new Date("2026-08-01T00:00:00Z").getTime() / 1000,
    );
    expect(args.trial_end).toBe(aug1_2026);
  });

  it("computes trial_end as the 1st of the month after an August 2026 due date", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent({
        product: "fyp_deposit",
        family_type: "single",
        due_or_birth_month: "aug",
        due_or_birth_year: "2026",
      }) as any,
    );
    const sub = mockStripeSubscription();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));

    await POST(makeRequest());

    expect(sub).toHaveBeenCalledOnce();
    const args = sub.mock.calls[0][0] as any;
    const sep1_2026 = Math.floor(
      new Date("2026-09-01T00:00:00Z").getTime() / 1000,
    );
    expect(args.trial_end).toBe(sep1_2026);
  });

  it("computes trial_end for a September 2026 due date (Oct 1 billing)", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent({
        product: "fyp_deposit",
        family_type: "single",
        due_or_birth_month: "sep",
        due_or_birth_year: "2026",
      }) as any,
    );
    const sub = mockStripeSubscription();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));

    await POST(makeRequest());

    expect(sub).toHaveBeenCalledOnce();
    const args = sub.mock.calls[0][0] as any;
    const oct1_2026 = Math.floor(
      new Date("2026-10-01T00:00:00Z").getTime() / 1000,
    );
    expect(args.trial_end).toBe(oct1_2026);
  });

  it("computes trial_end for a December 2026 due date (Jan 2027 billing)", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent({
        product: "fyp_deposit",
        family_type: "single",
        due_or_birth_month: "dec",
        due_or_birth_year: "2026",
      }) as any,
    );
    const sub = mockStripeSubscription();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));

    await POST(makeRequest());

    const args = sub.mock.calls[0][0] as any;
    const jan1_2027 = Math.floor(
      new Date("2027-01-01T00:00:00Z").getTime() / 1000,
    );
    expect(args.trial_end).toBe(jan1_2027);
  });
});

// ─── baby_bundle billing_start_date ──────────────────────────────────────────

/**
 * Variant of mockSupabase that returns a stable `accountUpdate` spy so tests
 * can inspect the args passed to accounts.update().
 */
function mockSupabaseWithAccountCapture() {
  const accountUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  });
  const client = {
    from: vi.fn(() => ({ update: accountUpdate })),
  };
  vi.mocked(createFirstYearClient).mockReturnValue(client as any);
  return accountUpdate;
}

describe("fyp webhook — baby_bundle", () => {
  let POST: (req: any) => Promise<unknown>;

  beforeEach(async () => {
    vi.resetModules();
    ({ POST } = await import("@/app/api/webhooks/stripe/fyp/route"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets billing_start_date and bundle_expires_at to today + 6 months", async () => {
    const accountUpdate = mockSupabaseWithAccountCapture();
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent({
        product: "fyp_bundle_baby",
        family_type: "multi",
      }) as any,
    );
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T00:00:00Z"));

    await POST(makeRequest());

    expect(accountUpdate).toHaveBeenCalledOnce();
    const args = accountUpdate.mock.calls[0][0] as any;
    expect(args.billing_start_date).toBe("2026-10-15");
    expect(args.bundle_expires_at).toBe("2027-04-01");
  });
});

// ─── customer.subscription.deleted — cancellation + Postpartum Post deactivation ──

function makeSubscriptionDeletedEvent(subscriptionId: string) {
  return {
    type: "customer.subscription.deleted",
    data: { object: { id: subscriptionId } },
  };
}

/**
 * Mocked Supabase client for the subscription.deleted handler: supports the
 * accounts lookup-by-subscription-id, the accounts status update, and the
 * members lookup for linked Postpartum Post ids — each keyed off the table
 * name so a single mock can serve all three calls the handler makes.
 */
function mockSupabaseForSubscriptionDeleted(opts: {
  account: { id: string } | null;
  linkedMembers: Array<{ id: string }>;
}) {
  const accountUpdateEq = vi.fn().mockResolvedValue({ error: null });
  const client = {
    from: vi.fn((table: string) => {
      if (table === "accounts") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: opts.account, error: null }),
            }),
          }),
          update: () => ({ eq: accountUpdateEq }),
        };
      }
      if (table === "members") {
        return {
          select: () => ({
            eq: () => ({
              not: async () => ({ data: opts.linkedMembers, error: null }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table in mock: ${table}`);
    }),
  };
  vi.mocked(createFirstYearClient).mockReturnValue(client as any);
  return { accountUpdateEq };
}

describe("fyp webhook — customer.subscription.deleted", () => {
  let POST: (req: any) => Promise<unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ POST } = await import("@/app/api/webhooks/stripe/fyp/route"));
  });

  it("marks the matching account canceled", async () => {
    const { accountUpdateEq } = mockSupabaseForSubscriptionDeleted({
      account: { id: "account_1" },
      linkedMembers: [],
    });
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeSubscriptionDeletedEvent("sub_123") as any,
    );

    await POST(makeRequest());

    expect(accountUpdateEq).toHaveBeenCalledWith("id", "account_1");
  });

  it("calls deactivatePostpartumPost for every linked member on the account", async () => {
    mockSupabaseForSubscriptionDeleted({
      account: { id: "account_1" },
      linkedMembers: [{ id: "member_a" }, { id: "member_b" }],
    });
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeSubscriptionDeletedEvent("sub_123") as any,
    );
    vi.mocked(deactivatePostpartumPost).mockResolvedValue(undefined);

    await POST(makeRequest());

    expect(deactivatePostpartumPost).toHaveBeenCalledTimes(2);
    expect(deactivatePostpartumPost).toHaveBeenCalledWith("member_a");
    expect(deactivatePostpartumPost).toHaveBeenCalledWith("member_b");
  });

  it("does not call deactivatePostpartumPost when no members are linked", async () => {
    mockSupabaseForSubscriptionDeleted({
      account: { id: "account_1" },
      linkedMembers: [],
    });
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeSubscriptionDeletedEvent("sub_123") as any,
    );

    await POST(makeRequest());

    expect(deactivatePostpartumPost).not.toHaveBeenCalled();
  });

  it("one member's deactivate failure doesn't block the others", async () => {
    mockSupabaseForSubscriptionDeleted({
      account: { id: "account_1" },
      linkedMembers: [{ id: "member_a" }, { id: "member_b" }],
    });
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeSubscriptionDeletedEvent("sub_123") as any,
    );
    vi.mocked(deactivatePostpartumPost)
      .mockRejectedValueOnce(new Error("PP down"))
      .mockResolvedValueOnce(undefined);

    await POST(makeRequest());

    expect(deactivatePostpartumPost).toHaveBeenCalledTimes(2);
  });

  it("does nothing (no deactivate calls) when no account matches the subscription", async () => {
    mockSupabaseForSubscriptionDeleted({ account: null, linkedMembers: [] });
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeSubscriptionDeletedEvent("sub_unknown") as any,
    );

    await POST(makeRequest());

    expect(deactivatePostpartumPost).not.toHaveBeenCalled();
  });
});

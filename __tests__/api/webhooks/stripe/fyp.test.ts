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
import { PROGRAM_START_UNIX } from "@/lib/fyp/program";

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

// ─── expecting_monthly trial_end clamping ─────────────────────────────────────

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

  it("clamps trial_end to PROGRAM_START for a July 2026 due date", async () => {
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
    // Aug 1 2026 would be the natural trial_end for July due date,
    // but it must be clamped to PROGRAM_START (Sep 1 2026)
    expect(args.trial_end).toBe(PROGRAM_START_UNIX);
  });

  it("clamps trial_end to PROGRAM_START for an August 2026 due date", async () => {
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
    // Sep 1 2026 = PROGRAM_START, so clamping is a no-op here — still correct
    expect(args.trial_end).toBe(PROGRAM_START_UNIX);
  });

  it("does not clamp trial_end for a September 2026 due date (Oct 1 billing)", async () => {
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
    // Oct 1 2026 > PROGRAM_START, so no clamping
    const oct1_2026 = Math.floor(
      new Date("2026-10-01T00:00:00Z").getTime() / 1000,
    );
    expect(args.trial_end).toBe(oct1_2026);
    expect(args.trial_end).toBeGreaterThan(PROGRAM_START_UNIX);
  });

  it("does not clamp trial_end for a December 2026 due date (Jan 2027 billing)", async () => {
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

  it("uses billing_start_date from metadata when present (before PROGRAM_START)", async () => {
    const accountUpdate = mockSupabaseWithAccountCapture();
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent({
        product: "fyp_bundle_baby",
        family_type: "single",
        billing_start_date: "2026-09-01",
      }) as any,
    );
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));

    await POST(makeRequest());

    expect(accountUpdate).toHaveBeenCalledOnce();
    const args = accountUpdate.mock.calls[0][0] as any;
    expect(args.billing_start_date).toBe("2026-09-01");
    expect(args.bundle_expires_at).toBe("2027-03-01");
  });

  it("falls back to today when billing_start_date is absent from metadata (after PROGRAM_START)", async () => {
    const accountUpdate = mockSupabaseWithAccountCapture();
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent({
        product: "fyp_bundle_baby",
        family_type: "multi",
        // no billing_start_date in metadata — program has already started
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

// ─── baby_deposit trial_end ───────────────────────────────────────────────────

describe("fyp webhook — baby_deposit", () => {
  let POST: (req: any) => Promise<unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ POST } = await import("@/app/api/webhooks/stripe/fyp/route"));
    mockSupabase();
    mockStripePrice();
  });

  it("always uses PROGRAM_START_UNIX as trial_end", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      makeCheckoutEvent({
        product: "fyp_baby_deposit",
        family_type: "multi",
      }) as any,
    );
    const sub = mockStripeSubscription();

    await POST(makeRequest());

    expect(sub).toHaveBeenCalledOnce();
    const args = sub.mock.calls[0][0] as any;
    expect(args.trial_end).toBe(PROGRAM_START_UNIX);
  });
});

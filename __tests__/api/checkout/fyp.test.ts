import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Hoisted mocks — must come before any imports that reference these modules
vi.mock("@/lib/stripe-client", () => ({
  stripe: {
    checkout: { sessions: { create: vi.fn() } },
    prices: { list: vi.fn() },
  },
}));
vi.mock("@/lib/supabase/server", () => ({ createFirstYearClient: vi.fn() }));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";
import { PROGRAM_START, getBillingStartDate } from "@/lib/fyp/program";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockSupabase() {
  const single = vi
    .fn()
    .mockResolvedValue({ data: { id: "acc-1" }, error: null });
  const memberInsert = vi.fn().mockResolvedValue({ error: null });
  const client = {
    from: vi.fn((table: string) => {
      if (table === "accounts") {
        return {
          insert: vi
            .fn()
            .mockReturnValue({ select: vi.fn().mockReturnValue({ single }) }),
        };
      }
      return { insert: memberInsert };
    }),
  };
  vi.mocked(createFirstYearClient).mockReturnValue(client as any);
  return client;
}

function mockStripeSession(url = "https://checkout.stripe.com/session") {
  const create = vi.mocked(stripe.checkout.sessions.create);
  create.mockResolvedValue({ id: "cs_test_123", url } as any);
  return create;
}

function mockStripePrice() {
  vi.mocked(stripe.prices.list).mockResolvedValue({
    data: [{ id: "price_monthly_single" }],
  } as any);
}

function makeRequest(body: object) {
  return { json: async () => body } as Request;
}

// ─── getBillingStartDate ──────────────────────────────────────────────────────

describe("getBillingStartDate", () => {
  it("returns '2026-09-01' when called before PROGRAM_START", () => {
    const before = new Date("2026-06-01T00:00:00Z");
    expect(getBillingStartDate(before)).toBe("2026-09-01");
  });

  it("returns null on PROGRAM_START itself", () => {
    expect(getBillingStartDate(PROGRAM_START)).toBeNull();
  });

  it("returns null when called after PROGRAM_START", () => {
    const after = new Date("2027-01-01T00:00:00Z");
    expect(getBillingStartDate(after)).toBeNull();
  });

  it("returns null one millisecond after PROGRAM_START", () => {
    const justAfter = new Date(PROGRAM_START.getTime() + 1);
    expect(getBillingStartDate(justAfter)).toBeNull();
  });

  it("returns '2026-09-01' one millisecond before PROGRAM_START", () => {
    const justBefore = new Date(PROGRAM_START.getTime() - 1);
    expect(getBillingStartDate(justBefore)).toBe("2026-09-01");
  });
});

// ─── Route handler ────────────────────────────────────────────────────────────

describe("POST /api/checkout/fyp", () => {
  let POST: (req: Request) => Promise<unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ POST } = await import("@/app/api/checkout/fyp/route"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── baby_deposit ──────────────────────────────────────────────────────────

  describe("baby_deposit", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));
      mockSupabase();
    });

    it("creates a mode:payment session for €25", async () => {
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_deposit", familyType: "single" }));

      expect(create).toHaveBeenCalledOnce();
      const args = create.mock.calls[0][0] as any;
      expect(args.mode).toBe("payment");
      expect(args.line_items[0].price_data.unit_amount).toBe(2500);
    });

    it("sets product metadata to fyp_baby_deposit", async () => {
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_deposit", familyType: "single" }));

      const args = create.mock.calls[0][0] as any;
      expect(args.metadata.product).toBe("fyp_baby_deposit");
    });

    it("does not include billing_start_date in session metadata (webhook handles that)", async () => {
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_deposit", familyType: "multi" }));

      const args = create.mock.calls[0][0] as any;
      expect(args.metadata.billing_start_date).toBeUndefined();
    });
  });

  // ── baby_monthly — always starts immediately ───────────────────────────────

  describe("baby_monthly", () => {
    beforeEach(() => {
      mockSupabase();
      mockStripePrice();
    });

    it("creates a subscription with no trial_end", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_monthly", familyType: "single" }));

      const args = create.mock.calls[0][0] as any;
      expect(args.mode).toBe("subscription");
      expect(args.subscription_data).toBeUndefined();
    });

    it("does not include billing_start_date in metadata", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_monthly", familyType: "multi" }));

      const args = create.mock.calls[0][0] as any;
      expect(args.metadata.billing_start_date).toBeUndefined();
    });
  });

  // ── baby_bundle — before program start ───────────────────────────────────

  describe("baby_bundle before PROGRAM_START", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));
      mockSupabase();
    });

    it("includes billing_start_date in metadata", async () => {
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_bundle", familyType: "single" }));

      const args = create.mock.calls[0][0] as any;
      expect(args.metadata.billing_start_date).toBe("2026-09-01");
    });

    it("describes September 2026 access start in product description", async () => {
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_bundle", familyType: "single" }));

      const args = create.mock.calls[0][0] as any;
      const description = args.line_items[0].price_data.product_data
        .description as string;
      expect(description).toContain("September 2026");
    });
  });

  // ── baby_bundle — after program start ────────────────────────────────────

  describe("baby_bundle after PROGRAM_START", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2027-01-01T00:00:00Z"));
      mockSupabase();
    });

    it("does not include billing_start_date in metadata", async () => {
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_bundle", familyType: "single" }));

      const args = create.mock.calls[0][0] as any;
      expect(args.metadata.billing_start_date).toBeUndefined();
    });

    it("describes immediate access in product description", async () => {
      const create = mockStripeSession();
      await POST(makeRequest({ flow: "baby_bundle", familyType: "multi" }));

      const args = create.mock.calls[0][0] as any;
      const description = args.line_items[0].price_data.product_data
        .description as string;
      expect(description).toContain("immediately");
    });
  });

  // ── expecting flows are unaffected ───────────────────────────────────────

  describe("expecting flows (unaffected by PROGRAM_START)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-15T00:00:00Z"));
      mockSupabase();
    });

    it("expecting_bundle does not include billing_start_date", async () => {
      const create = mockStripeSession();
      await POST(
        makeRequest({ flow: "expecting_bundle", familyType: "single" }),
      );

      const args = create.mock.calls[0][0] as any;
      expect(args.metadata.billing_start_date).toBeUndefined();
    });

    it("expecting_monthly does not include billing_start_date", async () => {
      const create = mockStripeSession();
      await POST(
        makeRequest({ flow: "expecting_monthly", familyType: "single" }),
      );

      const args = create.mock.calls[0][0] as any;
      expect(args.metadata.billing_start_date).toBeUndefined();
    });
  });
});

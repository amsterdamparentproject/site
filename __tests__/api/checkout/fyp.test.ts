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

function makeRequest(body: object) {
  return { json: async () => body } as Request;
}

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

  // ── retired monthly flows — checkout is bundle-only since Oct 2026 ────────

  describe("retired monthly flows", () => {
    beforeEach(() => {
      mockSupabase();
    });

    it.each(["expecting_monthly", "baby_deposit", "baby_monthly"])(
      "%s is rejected with a 400 and never reaches Stripe",
      async (flow) => {
        const create = mockStripeSession();
        const res = (await POST(
          makeRequest({ flow, familyType: "single" }),
        )) as { body: { error: string }; status: number };

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("Unsupported flow");
        expect(create).not.toHaveBeenCalled();
      },
    );
  });

  // ── baby_bundle — access begins immediately, no deferred billing ──────────

  describe("baby_bundle", () => {
    beforeEach(() => {
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

  // ── expecting flows never include billing_start_date ──────────────────────

  describe("expecting flows", () => {
    beforeEach(() => {
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
  });
});

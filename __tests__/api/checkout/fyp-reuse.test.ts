import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/stripe-client", () => ({
  stripe: {
    checkout: { sessions: { create: vi.fn() } },
    prices: { list: vi.fn() },
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createFirstYearClient: vi.fn(() => ({
    from: (table: string) =>
      table === "accounts"
        ? {
            insert: () => ({
              select: () => ({
                single: async () => ({ data: { id: "acc-1" }, error: null }),
              }),
            }),
          }
        : { insert: async () => ({ error: null }) },
  })),
}));
vi.mock("@/lib/fyp/checkout-dedupe", () => ({
  findReusableCheckoutUrl: vi.fn(),
  pruneExpiredPendingAccounts: vi.fn(),
}));
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

import { stripe } from "@/lib/stripe-client";
import {
  findReusableCheckoutUrl,
  pruneExpiredPendingAccounts,
} from "@/lib/fyp/checkout-dedupe";

const body = {
  flow: "baby_bundle",
  familyType: "multi",
  dueOrBirthMonth: "aug",
  dueOrBirthYear: "2026",
  members: [{ firstName: "A", lastName: "B", email: "a@example.com" }],
};

describe("POST /api/checkout/fyp — duplicate attempts", () => {
  let POST: (req: Request) => Promise<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ POST } = await import("@/app/api/checkout/fyp/route"));
  });

  it("returns the existing open session instead of creating a new one", async () => {
    vi.mocked(findReusableCheckoutUrl).mockResolvedValue(
      "https://checkout.stripe.com/existing",
    );

    const res = await POST({ json: async () => body } as Request);

    expect(res.body).toEqual({ url: "https://checkout.stripe.com/existing" });
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    expect(pruneExpiredPendingAccounts).not.toHaveBeenCalled();
  });

  it("falls through to a fresh session (and prunes) when nothing is reusable", async () => {
    vi.mocked(findReusableCheckoutUrl).mockResolvedValue(null);
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      id: "cs_new",
      url: "https://checkout.stripe.com/new",
    } as any);

    const res = await POST({ json: async () => body } as Request);

    expect(res.body).toEqual({ url: "https://checkout.stripe.com/new" });
    expect(stripe.checkout.sessions.create).toHaveBeenCalledOnce();
    expect(pruneExpiredPendingAccounts).toHaveBeenCalledWith(
      expect.anything(),
      ["a@example.com"],
    );
  });
});

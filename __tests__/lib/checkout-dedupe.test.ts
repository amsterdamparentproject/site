import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/stripe-client", () => ({
  stripe: { checkout: { sessions: { retrieve: vi.fn() } } },
}));

import { stripe } from "@/lib/stripe-client";
import {
  findReusableCheckoutUrl,
  pruneExpiredPendingAccounts,
} from "@/lib/fyp/checkout-dedupe";
import { fakeFirstYearDb } from "./fake-firstyear-db";

const NOW = new Date("2026-10-06T12:00:00Z");
const hoursAgo = (h: number) =>
  new Date(NOW.getTime() - h * 3600_000).toISOString();

const attempt = {
  dbFlow: "baby_bundle",
  familyType: "multi",
  dueOrBirthMonth: "aug",
  dueOrBirthYear: "2026",
  members: [
    { firstName: "Vanessa", lastName: "S", email: "Vanessa@Example.com" },
  ],
};

function seed(overrides: Record<string, unknown> = {}) {
  return fakeFirstYearDb({
    accounts: [
      {
        id: "a1",
        status: "pending",
        flow: "baby_bundle",
        family_type: "multi",
        due_or_birth_month: "aug",
        due_or_birth_year: "2026",
        stripe_session_id: "cs_1",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        created_at: hoursAgo(1),
        ...overrides,
      },
    ],
    members: [
      {
        id: "m1",
        account_id: "a1",
        first_name: "Vanessa",
        last_name: "S",
        email: "vanessa@example.com",
      },
    ],
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

describe("findReusableCheckoutUrl", () => {
  it("returns the open session's URL for an identical recent attempt", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue({
      status: "open",
      url: "https://checkout.stripe.com/open",
    } as any);
    const { client } = seed();
    expect(await findReusableCheckoutUrl(client, attempt)).toBe(
      "https://checkout.stripe.com/open",
    );
  });

  it("does not reuse an expired or completed session", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValue({
      status: "expired",
      url: null,
    } as any);
    const { client } = seed();
    expect(await findReusableCheckoutUrl(client, attempt)).toBeNull();
  });

  it("does not reuse when the flow, family type or month differ", async () => {
    const { client } = seed();
    for (const changed of [
      { dbFlow: "baby_deposit" },
      { familyType: "single" },
      { dueOrBirthMonth: "sep" },
    ]) {
      expect(
        await findReusableCheckoutUrl(client, { ...attempt, ...changed }),
      ).toBeNull();
    }
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
  });

  it("does not reuse when the names on the earlier attempt differ", async () => {
    const { client } = seed();
    const renamed = {
      ...attempt,
      members: [{ ...attempt.members[0], firstName: "Vanesa" }],
    };
    expect(await findReusableCheckoutUrl(client, renamed)).toBeNull();
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
  });

  it("ignores pending accounts older than the session lifetime", async () => {
    const { client } = seed({ created_at: hoursAgo(30) });
    expect(await findReusableCheckoutUrl(client, attempt)).toBeNull();
  });

  it("ignores accounts that are no longer pending", async () => {
    const { client } = seed({ status: "active" });
    expect(await findReusableCheckoutUrl(client, attempt)).toBeNull();
  });

  it("swallows errors so checkout can fall back to a fresh session", async () => {
    vi.mocked(stripe.checkout.sessions.retrieve).mockRejectedValue(
      new Error("stripe down"),
    );
    const { client } = seed();
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await findReusableCheckoutUrl(client, attempt)).toBeNull();
  });
});

describe("pruneExpiredPendingAccounts", () => {
  it("deletes stale unpaid pending accounts and their members", async () => {
    const db = seed({ created_at: hoursAgo(30) });
    await pruneExpiredPendingAccounts(db.client, ["vanessa@example.com"]);
    expect(db.tables.accounts).toHaveLength(0);
    expect(db.tables.members).toHaveLength(0);
  });

  it("keeps recent pending accounts", async () => {
    const db = seed({ created_at: hoursAgo(2) });
    await pruneExpiredPendingAccounts(db.client, ["vanessa@example.com"]);
    expect(db.tables.accounts).toHaveLength(1);
    expect(db.tables.members).toHaveLength(1);
  });

  it("never deletes an account that has Stripe payment state", async () => {
    const db = seed({ created_at: hoursAgo(30), stripe_customer_id: "cus_1" });
    await pruneExpiredPendingAccounts(db.client, ["vanessa@example.com"]);
    expect(db.tables.accounts).toHaveLength(1);
  });

  it("never deletes active accounts", async () => {
    const db = seed({ created_at: hoursAgo(30), status: "active" });
    await pruneExpiredPendingAccounts(db.client, ["vanessa@example.com"]);
    expect(db.tables.accounts).toHaveLength(1);
  });
});

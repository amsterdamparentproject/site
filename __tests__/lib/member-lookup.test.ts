import { describe, it, expect } from "vitest";
import { findMemberByEmail } from "@/lib/fyp/member-lookup";
import { fakeFirstYearDb } from "./fake-firstyear-db";

const EMAIL = "jennifer@example.com";

describe("findMemberByEmail", () => {
  it("returns null when no member has the email", async () => {
    const { client } = fakeFirstYearDb({ members: [], accounts: [] });
    expect(await findMemberByEmail(client, EMAIL)).toBeNull();
  });

  it("returns the only match without consulting accounts", async () => {
    const { client } = fakeFirstYearDb({
      members: [{ id: "m1", account_id: "a1", email: EMAIL }],
    });
    expect(await findMemberByEmail(client, EMAIL)).toEqual({
      id: "m1",
      account_id: "a1",
    });
  });

  it("prefers the active account over a newer pending duplicate", async () => {
    const { client } = fakeFirstYearDb({
      // newest first, like the real query
      members: [
        { id: "m-pending", account_id: "a-pending", email: EMAIL },
        { id: "m-active", account_id: "a-active", email: EMAIL },
      ],
      accounts: [
        { id: "a-pending", status: "pending" },
        { id: "a-active", status: "active" },
      ],
    });
    expect(await findMemberByEmail(client, EMAIL)).toEqual({
      id: "m-active",
      account_id: "a-active",
    });
  });

  it("ranks canceling above canceled above pending", async () => {
    const { client } = fakeFirstYearDb({
      members: [
        { id: "m1", account_id: "a-pending", email: EMAIL },
        { id: "m2", account_id: "a-canceled", email: EMAIL },
        { id: "m3", account_id: "a-canceling", email: EMAIL },
      ],
      accounts: [
        { id: "a-pending", status: "pending" },
        { id: "a-canceled", status: "canceled" },
        { id: "a-canceling", status: "canceling" },
      ],
    });
    expect((await findMemberByEmail(client, EMAIL))?.id).toBe("m3");
  });

  it("keeps the newest row on a status tie", async () => {
    const { client } = fakeFirstYearDb({
      members: [
        { id: "newer", account_id: "a2", email: EMAIL },
        { id: "older", account_id: "a1", email: EMAIL },
      ],
      accounts: [
        { id: "a1", status: "active" },
        { id: "a2", status: "active" },
      ],
    });
    expect((await findMemberByEmail(client, EMAIL))?.id).toBe("newer");
  });

  it("matches case-insensitively on the email", async () => {
    const { client } = fakeFirstYearDb({
      members: [{ id: "m1", account_id: "a1", email: EMAIL }],
    });
    expect(
      await findMemberByEmail(client, `  ${EMAIL.toUpperCase()} `),
    ).not.toBeNull();
  });
});

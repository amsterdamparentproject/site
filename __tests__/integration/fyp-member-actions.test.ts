/**
 * Integration tests: member-roster DB operations (lib/fyp/members.ts)
 *
 * addFypMember, updateFypMemberProfile, deleteFypMember, and
 * getFypAccountMembers — the "Your family" section's add/edit/remove
 * backend. Like fyp-activate-pp.test.ts, these hit the REAL firstyear
 * schema in the test Supabase project (via createFirstYearClient(),
 * unmocked). deleteFypMember's call to postpartum-post's own
 * /api/fyp/deactivate route is mocked via global fetch, same pattern as
 * fyp-activate-pp.test.ts — see that file's docs for why the mock has to
 * be scoped to PP's base URL rather than a blanket fetch mock.
 *
 * These exercise the id-taking lib functions directly rather than the
 * app/hub/actions.ts Server Action wrappers, which additionally require a
 * verified Supabase Auth access token (audit S2) — not something these
 * tests mint. The wrappers are thin (requireHubMember + account-scope
 * check) and covered by e2e instead.
 *
 * Prerequisites:
 *   NEXT_PUBLIC_TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY must be set
 *   (loaded automatically from .env.test by Vitest via Vite's env handling).
 *   Requires migration 010_fyp_members_whatsapp.sql to have been run against
 *   the test project.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  addFypMember,
  updateFypMemberProfile,
  deleteFypMember,
  getFypAccountMembers,
} from "@/lib/fyp/members";

// ─── Test DB client ───────────────────────────────────────────────────────────

let _db: SupabaseClient<any, "firstyear"> | null = null;
function testDb() {
  if (_db) return _db;
  const url = process.env.NEXT_PUBLIC_TEST_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing NEXT_PUBLIC_TEST_SUPABASE_URL or TEST_SUPABASE_SERVICE_ROLE_KEY — check .env.test",
    );
  _db = createClient<any, "firstyear">(url, key, {
    db: { schema: "firstyear" },
  });
  return _db;
}

const RUN_ID = Date.now();

async function seedAccount(familyType: "single" | "multi" = "multi") {
  const db = testDb();
  const { data: account, error } = await db
    .from("accounts")
    .insert({
      stripe_session_id: `cs_member_actions_${RUN_ID}_${crypto.randomUUID()}`,
      flow: "baby_monthly",
      plan_type: "monthly",
      family_type: familyType,
      status: "active",
    })
    .select("id")
    .single();
  if (error || !account) {
    throw new Error(`Failed to seed account: ${JSON.stringify(error)}`);
  }
  return account.id as string;
}

async function seedMember(
  accountId: string,
  overrides: {
    email: string;
    firstName?: string;
    lastName?: string;
    whatsapp?: string | null;
    postpartumpostMemberId?: string | null;
    createdAt?: string;
  },
) {
  const db = testDb();
  const { data: member, error } = await db
    .from("members")
    .insert({
      account_id: accountId,
      first_name: overrides.firstName ?? "Test",
      last_name: overrides.lastName ?? "Member",
      email: overrides.email,
      ...(overrides.whatsapp !== undefined
        ? { whatsapp: overrides.whatsapp }
        : {}),
      ...(overrides.postpartumpostMemberId !== undefined
        ? { postpartumpost_member_id: overrides.postpartumpostMemberId }
        : {}),
      ...(overrides.createdAt ? { created_at: overrides.createdAt } : {}),
    })
    .select("id")
    .single();
  if (error || !member) {
    throw new Error(`Failed to seed member: ${JSON.stringify(error)}`);
  }
  return member.id as string;
}

async function getMemberRow(memberId: string) {
  const { data } = await testDb()
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();
  return data;
}

async function countMembers(accountId: string): Promise<number> {
  const { count } = await testDb()
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId);
  return count ?? 0;
}

async function cleanup(accountId: string) {
  await testDb().from("accounts").delete().eq("id", accountId);
}

// ─── addFypMember ─────────────────────────────────────────────────────────────

describe("addFypMember", () => {
  it("creates a new member row on the account", async () => {
    const accountId = await seedAccount();
    try {
      const result = await addFypMember(
        accountId,
        "Partner",
        "Parent",
        `add-happy-${RUN_ID}@example.com`,
        "+31 6 12345678",
      );

      expect(result).toEqual({ success: true });
      expect(await countMembers(accountId)).toBe(1);

      const members = await getFypAccountMembers(accountId);
      expect(members).toHaveLength(1);
      expect(members[0]).toMatchObject({
        firstName: "Partner",
        lastName: "Parent",
        email: `add-happy-${RUN_ID}@example.com`,
        whatsapp: "+31 6 12345678",
      });
    } finally {
      await cleanup(accountId);
    }
  });

  it("trims fields, lowercases the email, and stores no WhatsApp when omitted", async () => {
    const accountId = await seedAccount();
    try {
      const result = await addFypMember(
        accountId,
        "  Casey  ",
        "  Doe  ",
        `  ADD-TRIM-${RUN_ID}@Example.com  `,
      );

      expect(result).toEqual({ success: true });
      const members = await getFypAccountMembers(accountId);
      expect(members[0]).toMatchObject({
        firstName: "Casey",
        lastName: "Doe",
        email: `add-trim-${RUN_ID}@example.com`,
        whatsapp: null,
      });
    } finally {
      await cleanup(accountId);
    }
  });

  it("rejects an email that's already a member somewhere, without inserting a second row", async () => {
    const accountId = await seedAccount();
    const email = `add-dup-${RUN_ID}@example.com`;
    await seedMember(accountId, { email });

    try {
      const result = await addFypMember(accountId, "Second", "Try", email);

      expect(result).toEqual({
        success: false,
        error: "This email is already used by another member",
      });
      expect(await countMembers(accountId)).toBe(1);
    } finally {
      await cleanup(accountId);
    }
  });

  it("requires first name, last name, and email", async () => {
    const accountId = await seedAccount();
    try {
      const result = await addFypMember(accountId, "", "Parent", "");
      expect(result).toEqual({
        success: false,
        error: "First name, last name, and email are required",
      });
      expect(await countMembers(accountId)).toBe(0);
    } finally {
      await cleanup(accountId);
    }
  });
});

// ─── updateFypMemberProfile ───────────────────────────────────────────────────

describe("updateFypMemberProfile", () => {
  it("updates first/last name and WhatsApp", async () => {
    const accountId = await seedAccount();
    const memberId = await seedMember(accountId, {
      email: `update-happy-${RUN_ID}@example.com`,
      firstName: "Old",
      lastName: "Name",
    });

    try {
      const result = await updateFypMemberProfile(
        memberId,
        "New",
        "Name",
        "+31 6 00000000",
      );

      expect(result).toEqual({ success: true });
      const row = await getMemberRow(memberId);
      expect(row).toMatchObject({
        first_name: "New",
        last_name: "Name",
        whatsapp: "+31 6 00000000",
      });
    } finally {
      await cleanup(accountId);
    }
  });

  it("clears WhatsApp to null when given an empty/whitespace string", async () => {
    const accountId = await seedAccount();
    const memberId = await seedMember(accountId, {
      email: `update-clear-whatsapp-${RUN_ID}@example.com`,
      whatsapp: "+31 6 11111111",
    });

    try {
      const result = await updateFypMemberProfile(
        memberId,
        "Test",
        "Member",
        "   ",
      );

      expect(result).toEqual({ success: true });
      const row = await getMemberRow(memberId);
      expect(row?.whatsapp).toBeNull();
    } finally {
      await cleanup(accountId);
    }
  });

  it("requires first and last name, and doesn't touch the row when missing", async () => {
    const accountId = await seedAccount();
    const memberId = await seedMember(accountId, {
      email: `update-invalid-${RUN_ID}@example.com`,
      firstName: "Unchanged",
      lastName: "Name",
    });

    try {
      const result = await updateFypMemberProfile(memberId, "", "Name", "");
      expect(result).toEqual({
        success: false,
        error: "First and last name are required",
      });
      const row = await getMemberRow(memberId);
      expect(row?.first_name).toBe("Unchanged");
    } finally {
      await cleanup(accountId);
    }
  });
});

// ─── getFypAccountMembers ─────────────────────────────────────────────────────

describe("getFypAccountMembers", () => {
  it("returns every member on the account, ordered oldest-first", async () => {
    const accountId = await seedAccount();
    const olderId = await seedMember(accountId, {
      email: `roster-older-${RUN_ID}@example.com`,
      firstName: "Older",
      createdAt: "2020-01-01T00:00:00.000Z",
    });
    const newerId = await seedMember(accountId, {
      email: `roster-newer-${RUN_ID}@example.com`,
      firstName: "Newer",
      createdAt: "2020-06-01T00:00:00.000Z",
    });

    try {
      const members = await getFypAccountMembers(accountId);
      expect(members.map((m) => m.id)).toEqual([olderId, newerId]);
      expect(members.map((m) => m.firstName)).toEqual(["Older", "Newer"]);
    } finally {
      await cleanup(accountId);
    }
  });

  it("returns [] for an account with no members (rather than throwing)", async () => {
    const accountId = await seedAccount();
    try {
      expect(await getFypAccountMembers(accountId)).toEqual([]);
    } finally {
      await cleanup(accountId);
    }
  });
});

// ─── deleteFypMember ──────────────────────────────────────────────────────────
//
// Mirrors fyp-activate-pp.test.ts's PP-only fetch mock: intercept only
// requests to PP's base URL so Supabase's own (unmocked, real-test-DB)
// calls aren't accidentally caught by the same global fetch mock.

const PP_BASE = "http://pp.test";

function mockPPFetch(
  impl: (
    ...args: Parameters<typeof fetch>
  ) => ReturnType<typeof fetch> | Promise<unknown>,
) {
  const original = global.fetch;
  const mock = vi.fn(impl);
  global.fetch = (async (...args: Parameters<typeof fetch>) => {
    const url = args[0];
    if (typeof url === "string" && url.startsWith(PP_BASE)) {
      return mock(...args);
    }
    return original(...args);
  }) as typeof fetch;
  return mock;
}

describe("deleteFypMember", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.FYP_DEACTIVATE_API_SECRET = "test-deactivate-secret";
    process.env.POSTPARTUM_POST_BASE_URL = PP_BASE;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("deletes the member row when there's no linked Postpartum Post member", async () => {
    const accountId = await seedAccount();
    const memberId = await seedMember(accountId, {
      email: `delete-unlinked-${RUN_ID}@example.com`,
    });
    const fetchMock = mockPPFetch(async () => ({ ok: true }));

    try {
      const result = await deleteFypMember(memberId);
      expect(result).toEqual({ success: true });
      expect(await getMemberRow(memberId)).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      await cleanup(accountId);
    }
  });

  it("deactivates Postpartum Post first, then deletes the row, when linked", async () => {
    const accountId = await seedAccount();
    const ppMemberId = crypto.randomUUID();
    const memberId = await seedMember(accountId, {
      email: `delete-linked-${RUN_ID}@example.com`,
      postpartumpostMemberId: ppMemberId,
    });
    const fetchMock = mockPPFetch(async () => ({ ok: true }));

    try {
      const result = await deleteFypMember(memberId);
      expect(result).toEqual({ success: true });
      expect(fetchMock).toHaveBeenCalledWith(
        `${PP_BASE}/api/fyp/deactivate`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-deactivate-secret",
          }),
        }),
      );
      expect(await getMemberRow(memberId)).toBeNull();
    } finally {
      await cleanup(accountId);
    }
  });

  it("leaves the member row intact if Postpartum Post deactivation fails", async () => {
    const accountId = await seedAccount();
    const memberId = await seedMember(accountId, {
      email: `delete-deactivate-fails-${RUN_ID}@example.com`,
      postpartumpostMemberId: crypto.randomUUID(),
    });
    mockPPFetch(async () => ({
      ok: false,
      status: 500,
      text: async () => "boom",
    }));

    try {
      const result = await deleteFypMember(memberId);
      expect(result.success).toBe(false);
      // The row must still exist — deleting it after a failed deactivation
      // would leave a dangling PP comp with no corresponding FYP member.
      expect(await getMemberRow(memberId)).not.toBeNull();
    } finally {
      await cleanup(accountId);
    }
  });
});

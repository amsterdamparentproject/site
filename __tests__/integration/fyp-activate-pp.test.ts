/**
 * Integration tests: activatePostpartumPost() / deactivatePostpartumPost()
 * (lib/fyp/postpartum-post.ts)
 *
 * Like fyp-cancellation.test.ts, these hit the REAL firstyear schema in the
 * test Supabase project (via createFirstYearClient(), unmocked). The calls
 * to postpartum-post's own /api/fyp/activate and /api/fyp/deactivate routes
 * are mocked via global fetch — those routes' own logic is tested in
 * postpartum-post's own test suite (__tests__/api/fyp-activate.test.ts,
 * __tests__/api/fyp-deactivate.test.ts), not here.
 *
 * Prerequisites:
 *   NEXT_PUBLIC_TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY must be set
 *   (loaded automatically from .env.test by Vitest via Vite's env handling).
 *   Requires migration 009_fyp_pp_link.sql to have been run against the test
 *   project (adds firstyear.members.postpartumpost_member_id).
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  activatePostpartumPost,
  deactivatePostpartumPost,
} from "@/lib/fyp/postpartum-post";

// ─── Test DB client ───────────────────────────────────────────────────────────

let _db: ReturnType<typeof createClient> | null = null;
function testDb() {
  if (_db) return _db;
  const url = process.env.NEXT_PUBLIC_TEST_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing NEXT_PUBLIC_TEST_SUPABASE_URL or TEST_SUPABASE_SERVICE_ROLE_KEY — check .env.test",
    );
  _db = createClient(url, key, { db: { schema: "firstyear" } });
  return _db;
}

const RUN_ID = Date.now();

async function seedAccountAndMember(overrides: {
  email: string;
  firstName: string;
  lastName: string;
  postpartumpostMemberId?: string | null;
  planType?: "monthly" | "bundle";
  bundleExpiresAt?: string;
}): Promise<{ accountId: string; memberId: string }> {
  const db = testDb();
  const planType = overrides.planType ?? "monthly";

  const { data: account, error: accountError } = await db
    .from("accounts")
    .insert({
      stripe_session_id: `cs_activate_${RUN_ID}_${crypto.randomUUID()}`,
      flow: planType === "bundle" ? "expecting_bundle" : "expecting_monthly",
      plan_type: planType,
      family_type: "single",
      status: "active",
      ...(planType === "bundle"
        ? { bundle_expires_at: overrides.bundleExpiresAt ?? "2099-01-01" }
        : {}),
    })
    .select("id")
    .single();
  if (accountError || !account) {
    throw new Error(`Failed to seed account: ${JSON.stringify(accountError)}`);
  }

  const { data: member, error: memberError } = await db
    .from("members")
    .insert({
      account_id: account.id,
      first_name: overrides.firstName,
      last_name: overrides.lastName,
      email: overrides.email,
      ...(overrides.postpartumpostMemberId !== undefined
        ? { postpartumpost_member_id: overrides.postpartumpostMemberId }
        : {}),
    })
    .select("id")
    .single();
  if (memberError || !member) {
    throw new Error(`Failed to seed member: ${JSON.stringify(memberError)}`);
  }

  return { accountId: account.id, memberId: member.id };
}

async function cleanup(accountId: string) {
  await testDb().from("accounts").delete().eq("id", accountId);
}

async function getMemberLink(memberId: string): Promise<string | null> {
  const { data } = await testDb()
    .from("members")
    .select("postpartumpost_member_id")
    .eq("id", memberId)
    .single();
  return data?.postpartumpost_member_id ?? null;
}

// ─── PP-only fetch mock ───────────────────────────────────────────────────────
//
// activatePostpartumPost()/deactivatePostpartumPost() make TWO kinds of
// network calls: real Supabase REST calls (via createFirstYearClient(), left
// unmocked so these tests hit the real test DB) and the call to PP's API
// (which we want to mock). Both go through the same global `fetch`, so a
// blanket `global.fetch = vi.fn()` also intercepts Supabase's own calls —
// supabase-js then chokes on the mocked response shape and throws from
// *inside* the Supabase query, which surfaces here as a misleading "member
// not found" (whatever the mock response was missing — `.text()`, `.status`,
// etc. — is what supabase-js's own error handling was actually tripping on).
//
// Fix: only intercept requests whose URL starts with PP_BASE; forward
// everything else (Supabase's calls) to the real, original fetch.
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

describe("activatePostpartumPost", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.FYP_ACTIVATE_API_SECRET = "test-activate-secret";
    process.env.FYP_DEACTIVATE_API_SECRET = "test-deactivate-secret";
    process.env.POSTPARTUM_POST_BASE_URL = PP_BASE;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("is idempotent: returns the existing link immediately, no fetch call", async () => {
    const existingId = crypto.randomUUID();
    const { accountId, memberId } = await seedAccountAndMember({
      email: `activate-idempotent-${RUN_ID}@example.com`,
      firstName: "Already",
      lastName: "Linked",
      postpartumpostMemberId: existingId,
    });

    const fetchMock = mockPPFetch(async () => ({ ok: true }));

    try {
      const result = await activatePostpartumPost(memberId);

      expect(result).toEqual({
        postpartumpostMemberId: existingId,
        created: false,
      });
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      await cleanup(accountId);
    }
  });

  it("monthly plan: calls postpartum-post's /api/fyp/activate with planType 'monthly' and persists the returned id", async () => {
    const { accountId, memberId } = await seedAccountAndMember({
      email: `activate-new-${RUN_ID}@example.com`,
      firstName: "New",
      lastName: "Parent",
      planType: "monthly",
    });

    const ppMemberId = crypto.randomUUID();
    const fetchMock = mockPPFetch(async () => ({
      ok: true,
      json: async () => ({
        postpartumpost_member_id: ppMemberId,
        created: true,
      }),
    }));

    try {
      const result = await activatePostpartumPost(memberId);

      expect(fetchMock).toHaveBeenCalledWith(
        `${PP_BASE}/api/fyp/activate`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-activate-secret",
          }),
        }),
      );
      const [, init] = fetchMock.mock.calls[0];
      expect(JSON.parse(init!.body as string)).toEqual({
        email: `activate-new-${RUN_ID}@example.com`,
        firstName: "New",
        lastName: "Parent",
        planType: "monthly",
      });

      expect(result).toEqual({
        postpartumpostMemberId: ppMemberId,
        created: true,
      });
      expect(await getMemberLink(memberId)).toBe(ppMemberId);
    } finally {
      await cleanup(accountId);
    }
  });

  it("bundle plan: passes planType 'bundle' and bundleExpiresAt through", async () => {
    const { accountId, memberId } = await seedAccountAndMember({
      email: `activate-bundle-${RUN_ID}@example.com`,
      firstName: "Bundle",
      lastName: "Parent",
      planType: "bundle",
      bundleExpiresAt: "2027-05-01",
    });

    const ppMemberId = crypto.randomUUID();
    const fetchMock = mockPPFetch(async () => ({
      ok: true,
      json: async () => ({
        postpartumpost_member_id: ppMemberId,
        created: true,
      }),
    }));

    try {
      await activatePostpartumPost(memberId);

      const [, init] = fetchMock.mock.calls[0];
      expect(JSON.parse(init!.body as string)).toEqual({
        email: `activate-bundle-${RUN_ID}@example.com`,
        firstName: "Bundle",
        lastName: "Parent",
        planType: "bundle",
        bundleExpiresAt: "2027-05-01",
      });
    } finally {
      await cleanup(accountId);
    }
  });

  it("throws if postpartum-post's route returns a non-ok response", async () => {
    const { accountId, memberId } = await seedAccountAndMember({
      email: `activate-fail-${RUN_ID}@example.com`,
      firstName: "Will",
      lastName: "Fail",
    });

    mockPPFetch(async () => ({
      ok: false,
      status: 500,
      text: async () => "boom",
    }));

    try {
      await expect(activatePostpartumPost(memberId)).rejects.toThrow(/500/);
      expect(await getMemberLink(memberId)).toBeNull();
    } finally {
      await cleanup(accountId);
    }
  });

  it("throws if the member doesn't exist", async () => {
    await expect(
      activatePostpartumPost("00000000-0000-0000-0000-000000000000"),
    ).rejects.toThrow(/not found/);
  });
});

describe("deactivatePostpartumPost", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.FYP_DEACTIVATE_API_SECRET = "test-deactivate-secret";
    process.env.POSTPARTUM_POST_BASE_URL = PP_BASE;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("no-ops (no fetch call) for a member never linked to Postpartum Post", async () => {
    const { accountId, memberId } = await seedAccountAndMember({
      email: `deactivate-unlinked-${RUN_ID}@example.com`,
      firstName: "Never",
      lastName: "Linked",
    });

    const fetchMock = mockPPFetch(async () => ({ ok: true }));

    try {
      await deactivatePostpartumPost(memberId);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      await cleanup(accountId);
    }
  });

  it("calls postpartum-post's /api/fyp/deactivate with the linked member's id", async () => {
    const ppMemberId = crypto.randomUUID();
    const { accountId, memberId } = await seedAccountAndMember({
      email: `deactivate-linked-${RUN_ID}@example.com`,
      firstName: "Linked",
      lastName: "Member",
      postpartumpostMemberId: ppMemberId,
    });

    const fetchMock = mockPPFetch(async () => ({ ok: true }));

    try {
      await deactivatePostpartumPost(memberId);

      expect(fetchMock).toHaveBeenCalledWith(
        `${PP_BASE}/api/fyp/deactivate`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-deactivate-secret",
          }),
        }),
      );
      const [, init] = fetchMock.mock.calls[0];
      expect(JSON.parse(init!.body as string)).toEqual({
        postpartumpostMemberId: ppMemberId,
      });
    } finally {
      await cleanup(accountId);
    }
  });

  it("throws if postpartum-post's deactivate route returns a non-ok response", async () => {
    const { accountId, memberId } = await seedAccountAndMember({
      email: `deactivate-fail-${RUN_ID}@example.com`,
      firstName: "Will",
      lastName: "Fail",
      postpartumpostMemberId: crypto.randomUUID(),
    });

    mockPPFetch(async () => ({
      ok: false,
      status: 500,
      text: async () => "boom",
    }));

    try {
      await expect(deactivatePostpartumPost(memberId)).rejects.toThrow(/500/);
    } finally {
      await cleanup(accountId);
    }
  });
});

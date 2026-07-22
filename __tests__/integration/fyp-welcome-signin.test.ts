/**
 * Integration tests: getWelcomeHubSignInLink
 * (app/programs/first-year/welcome/actions.ts)
 *
 * The welcome page's direct-into-the-Hub sign-in link (GoToHubButton): looks
 * up the account by stripe_session_id, picks the account's oldest member,
 * and generates a Supabase magic link for them — no inbox round trip. Like
 * fyp-member-actions.test.ts, this hits the REAL firstyear schema in the
 * test Supabase project (via createFirstYearClient(), unmocked).
 *
 * admin.generateLink() itself is also left unmocked and hits Supabase's real
 * Auth admin API — it's the same call e2e/helpers/hub-auth.ts makes for
 * every signed-in e2e test, not a third-party service that needs stubbing.
 * For the "picks the oldest member" case, where the return value alone
 * doesn't reveal which email was targeted, a fetch spy scoped to the
 * generate_link endpoint records the request body and then passes the call
 * through untouched — so the real link is still generated, just observed
 * along the way.
 *
 * Prerequisites:
 *   NEXT_PUBLIC_TEST_SUPABASE_URL + TEST_SUPABASE_SERVICE_ROLE_KEY must be set
 *   (loaded automatically from .env.test by Vitest via Vite's env handling).
 */

import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { getWelcomeHubSignInLink } from "@/app/programs/first-year/welcome/actions";

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

async function seedAccount(stripeSessionId: string) {
  const db = testDb();
  const { data: account, error } = await db
    .from("accounts")
    .insert({
      stripe_session_id: stripeSessionId,
      flow: "baby_monthly",
      plan_type: "monthly",
      family_type: "single",
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
      ...(overrides.createdAt ? { created_at: overrides.createdAt } : {}),
    })
    .select("id")
    .single();
  if (error || !member) {
    throw new Error(`Failed to seed member: ${JSON.stringify(error)}`);
  }
  return member.id as string;
}

async function cleanup(accountId: string) {
  await testDb().from("accounts").delete().eq("id", accountId);
}

// ─── generate_link request spy ────────────────────────────────────────────────
//
// Records the `email` argument passed to Supabase's admin generate_link
// endpoint, then forwards the request to the real fetch unchanged — the
// real link still gets generated, we're just watching who it's for.

function spyOnGenerateLinkEmail(): { emails: string[]; restore: () => void } {
  const original = global.fetch;
  const emails: string[] = [];
  global.fetch = (async (...args: Parameters<typeof fetch>) => {
    const url = args[0];
    if (
      typeof url === "string" &&
      url.includes("/auth/v1/admin/generate_link")
    ) {
      const init = args[1];
      try {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        if (typeof body.email === "string") emails.push(body.email);
      } catch {
        // ignore parse failures — just means we don't record this call
      }
    }
    return original(...args);
  }) as typeof fetch;
  return {
    emails,
    restore: () => {
      global.fetch = original;
    },
  };
}

describe("getWelcomeHubSignInLink", () => {
  it("matches the account by stripe_session_id and generates a sign-in link", async () => {
    const sessionId = `cs_welcome_happy_${RUN_ID}`;
    const accountId = await seedAccount(sessionId);
    await seedMember(accountId, {
      email: `welcome-happy-${RUN_ID}@example.com`,
    });

    try {
      const result = await getWelcomeHubSignInLink(sessionId);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.url).toBe("string");
        expect(result.url.startsWith("http")).toBe(true);
      }
    } finally {
      await cleanup(accountId);
    }
  });

  it("returns success: false when no account matches the session id", async () => {
    const result = await getWelcomeHubSignInLink(
      `cs_welcome_does_not_exist_${RUN_ID}`,
    );
    expect(result).toEqual({ success: false });
  });

  it("picks the oldest member's email when the account has more than one", async () => {
    const sessionId = `cs_welcome_multi_${RUN_ID}`;
    const accountId = await seedAccount(sessionId);
    const olderEmail = `welcome-older-${RUN_ID}@example.com`;
    await seedMember(accountId, {
      email: olderEmail,
      firstName: "Older",
      createdAt: "2020-01-01T00:00:00.000Z",
    });
    await seedMember(accountId, {
      email: `welcome-newer-${RUN_ID}@example.com`,
      firstName: "Newer",
      createdAt: "2020-06-01T00:00:00.000Z",
    });

    const spy = spyOnGenerateLinkEmail();
    try {
      const result = await getWelcomeHubSignInLink(sessionId);
      expect(result.success).toBe(true);
      expect(spy.emails).toEqual([olderEmail]);
    } finally {
      spy.restore();
      await cleanup(accountId);
    }
  });

  it("returns success: false when the matched account has no members", async () => {
    const sessionId = `cs_welcome_no_members_${RUN_ID}`;
    const accountId = await seedAccount(sessionId);

    try {
      const result = await getWelcomeHubSignInLink(sessionId);
      expect(result).toEqual({ success: false });
    } finally {
      await cleanup(accountId);
    }
  });
});

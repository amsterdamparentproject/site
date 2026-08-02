/**
 * DB + Stripe helpers for First Year Program Playwright tests.
 *
 * Talks directly to the test Supabase project (firstyear schema) and Stripe
 * to verify state after checkout and clean up after test runs.
 *
 * Since migration 006, email is stored on firstyear.members (not accounts).
 * Account lookups go through the members table.
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

function supabase() {
  const url = process.env.NEXT_PUBLIC_TEST_SUPABASE_URL;
  const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing NEXT_PUBLIC_TEST_SUPABASE_URL / TEST_SUPABASE_SERVICE_ROLE_KEY",
    );
  return createClient(url, key, { db: { schema: "firstyear" } });
}

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
  return new Stripe(key);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FYPAccount {
  id: string;
  stripe_customer_id: string | null;
  stripe_session_id: string;
  stripe_subscription_id: string | null;
  flow: string;
  plan_type: string;
  family_type: string;
  due_or_birth_month: string | null;
  due_or_birth_year: string | null;
  billing_start_date: string | null;
  bundle_expires_at: string | null;
  status: string;
}

export interface FYPMember {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Test email addresses
// ---------------------------------------------------------------------------

/**
 * Builds a synthetic-but-real test email via Gmail's `+` addressing — all
 * mail still lands in the same real inbox (or nowhere, if unread), but the
 * domain is genuinely deliverable.
 *
 * Diagnosed 2026-07-24: `@example.com` (RFC 2606's reserved example domain,
 * previously used here) gets a hard SMTP 550 from Supabase's mail relay —
 * "Invalid `to` field. Please use our testing email address instead of
 * domains like `example.com`." This bites any test that reaches
 * supabase.auth.admin.generateLink(): despite the whole point of using
 * generateLink() being to grab the returned action_link without needing a
 * real inbox, Supabase still attempts to send the magic-link email as a
 * side effect — and that send failing turns into a 500 from the /otp
 * endpoint, which the client then surfaces as a confusing, seemingly
 * unrelated error (an "unrecognized JWT kid" signature-verification
 * failure was one observed symptom — a red herring, not the real cause).
 * Every FYP Hub sign-in path goes through generateLink() one way or another
 * (HubLoginForm's OTP request, the welcome page's direct sign-in, PP's own
 * sign-in link), so any synthetic email that might get signed in with needs
 * a real domain, not just ones a human will actually read.
 */
export function e2eTestEmail(label: string): string {
  return `amsterdamparentproject+${label}@gmail.com`;
}

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

export interface SeededFYPMember {
  memberId: string;
  accountId: string;
  email: string;
  firstName: string;
  lastName: string;
  // The stripe_session_id set on the seeded account — exposed so tests of
  // the welcome page's direct-sign-in link (which looks accounts up by
  // this value) can build a matching `?session_id=` URL without needing to
  // separately query the DB for it.
  stripeSessionId: string;
}

/**
 * Insert an firstyear.accounts + firstyear.members row directly, bypassing
 * Stripe checkout entirely — for tests (e.g. hub-auth.spec.ts) that only
 * need a signed-in Hub member and don't care how the account originated.
 * Defaults to an active monthly, single-family account; pass `status` to
 * seed a lapsed/canceling account, or `familyType: "multi"` for tests of
 * the Account tab's "Your family" roster/add-member UI (only rendered for
 * multi-family accounts — see app/hub/(account)/account/page.tsx).
 *
 * `billingStartDate` (added for the Hub banner e2e coverage,
 * hub-banners.spec.ts) defaults to unset (null) — matching a real account
 * before the webhook ever sets it — so tests of the "not started yet"
 * banner/calendar states don't need to pass anything. Pass an ISO date
 * string in the past/future to exercise the started/not-started split (see
 * app/hub/hub-banners.ts's hasEventsStarted).
 */
export async function seedActiveAccountWithMember(
  overrides: {
    email?: string;
    firstName?: string;
    lastName?: string;
    status?: string;
    familyType?: "single" | "multi";
    billingStartDate?: string;
  } = {},
): Promise<SeededFYPMember> {
  const db = supabase();
  const id = crypto.randomUUID();
  const email = overrides.email ?? e2eTestEmail(`e2e-hub-${id.slice(0, 8)}`);
  const firstName = overrides.firstName ?? "Test";
  const lastName = overrides.lastName ?? "Member";
  const stripeSessionId = `test_e2e_hub_${id}`;

  const { data: account, error: accountError } = await db
    .from("accounts")
    .insert({
      stripe_session_id: stripeSessionId,
      flow: "baby_monthly",
      plan_type: "monthly",
      family_type: overrides.familyType ?? "single",
      status: overrides.status ?? "active",
      ...(overrides.billingStartDate
        ? { billing_start_date: overrides.billingStartDate }
        : {}),
    })
    .select("id")
    .single();
  if (accountError || !account)
    throw new Error(
      `seedActiveAccountWithMember account insert failed: ${accountError?.message}`,
    );

  const { data: member, error: memberError } = await db
    .from("members")
    .insert({
      account_id: account.id,
      first_name: firstName,
      last_name: lastName,
      email,
    })
    .select("id")
    .single();
  if (memberError || !member)
    throw new Error(
      `seedActiveAccountWithMember member insert failed: ${memberError?.message}`,
    );

  return {
    memberId: member.id,
    accountId: account.id,
    email,
    firstName,
    lastName,
    stripeSessionId,
  };
}

export interface SeededSiblingMember {
  memberId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Adds another member directly to an existing (multi-family) account —
 * bypassing MemberRoster's own "Add member" form, for tests that need
 * several members on one account without exercising that form themselves
 * (it has its own dedicated coverage in hub-members.spec.ts). Used by
 * hub-pp-activation.spec.ts's sibling-visibility regression test — NOT a
 * way to run per-member scenarios (e.g. Postpartum Post activation) under
 * one shared sign-in: MemberCard's PP actions are isSelf-only by design
 * (see that file's docblock for why), so a sibling seeded here can only
 * ever be used to assert what does *not* appear on their card, not to
 * exercise their own activate/sign-in flow — that still needs its own
 * account + sign-in, same as the signed-in member always would.
 */
export async function addSeededMember(
  accountId: string,
  overrides: { firstName?: string; lastName?: string } = {},
): Promise<SeededSiblingMember> {
  const db = supabase();
  const id = crypto.randomUUID();
  const email = e2eTestEmail(`e2e-hub-sibling-${id.slice(0, 8)}`);
  const firstName = overrides.firstName ?? "Sibling";
  const lastName = overrides.lastName ?? "Member";

  const { data: member, error } = await db
    .from("members")
    .insert({
      account_id: accountId,
      first_name: firstName,
      last_name: lastName,
      email,
    })
    .select("id")
    .single();
  if (error || !member)
    throw new Error(`addSeededMember insert failed: ${error?.message}`);

  return { memberId: member.id, email, firstName, lastName };
}

export interface SeededFtpLegacyRow {
  id: string;
  email: string;
}

/**
 * Insert a firstyear.ftp_legacy row — for e2e coverage of the
 * legacy-transition email's personalized "Register" link
 * (?legacyId=<row.id>#join → app/programs/first-year/page.tsx's
 * server-side lookup → FYPJoinForm prefill). See
 * e2e/fyp-join-form-prefill.spec.ts.
 *
 * `name` is a single field on this table (see migration
 * 007_ftp_legacy.sql) — split into first/last by splitName() at read time,
 * not here.
 */
export async function seedFtpLegacyRow(
  overrides: {
    name?: string;
    email?: string;
    dueBirthDate?: string; // "YYYY-MM-DD"
    status?: string;
    cohort?: string;
  } = {},
): Promise<SeededFtpLegacyRow> {
  const db = supabase();
  const id = crypto.randomUUID();
  const email =
    overrides.email ?? e2eTestEmail(`e2e-ftp-legacy-${id.slice(0, 8)}`);

  const { data: row, error } = await db
    .from("ftp_legacy")
    .insert({
      name: overrides.name ?? "Mary Jane Smith",
      email,
      due_birth_date: overrides.dueBirthDate ?? null,
      status: overrides.status ?? "pending",
      cohort: overrides.cohort ?? null,
    })
    .select("id")
    .single();
  if (error || !row)
    throw new Error(`seedFtpLegacyRow insert failed: ${error?.message}`);

  return { id: row.id, email };
}

export async function cleanupFtpLegacyRow(id: string): Promise<void> {
  const db = supabase();
  await db.from("ftp_legacy").delete().eq("id", id);
}

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

/**
 * Return members for a given account, with status derived from the account
 * via the member_details view (status lives on accounts, not members).
 */
export async function getMembersByAccountId(
  accountId: string,
): Promise<FYPMember[]> {
  const db = supabase();
  const { data } = await db
    .from("member_details")
    .select("*")
    .eq("account_id", accountId);
  return data ?? [];
}

/** Find a member row by email, then return the associated account. */
export async function getAccountByEmail(
  email: string,
): Promise<FYPAccount | null> {
  const db = supabase();

  const { data: member } = await db
    .from("members")
    .select("account_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!member) return null;

  const { data: account } = await db
    .from("accounts")
    .select("*")
    .eq("id", member.account_id)
    .maybeSingle();

  return account ?? null;
}

export async function getAccountStatusByEmail(
  email: string,
): Promise<string | null> {
  const account = await getAccountByEmail(email);
  return account?.status ?? null;
}

/** Seeds a member as already linked to a Postpartum Post member id — for
 * tests of the "Go to Postpartum Post" button (only shown once a member is
 * already active, per MemberCard's isPpActive gate), which don't want to
 * exercise the activation flow itself first. */
export async function linkMemberToPostpartumPost(
  memberId: string,
  postpartumpostMemberId: string,
): Promise<void> {
  const db = supabase();
  const { error } = await db
    .from("members")
    .update({ postpartumpost_member_id: postpartumpostMemberId })
    .eq("id", memberId);
  if (error) {
    throw new Error(`linkMemberToPostpartumPost failed: ${error.message}`);
  }
}

/** Reads back the postpartumpost_member_id linked to a member row — used
 * to verify the Hub's "Activate Postpartum Post" flow actually persisted
 * the id returned by postpartum-post's /api/fyp/activate route. */
export async function getMemberPostpartumPostId(
  memberId: string,
): Promise<string | null> {
  const db = supabase();
  const { data } = await db
    .from("members")
    .select("postpartumpost_member_id")
    .eq("id", memberId)
    .maybeSingle();
  return data?.postpartumpost_member_id ?? null;
}

// ---------------------------------------------------------------------------
// Cleanup helpers
// ---------------------------------------------------------------------------

export async function cleanupAccountByEmail(email: string): Promise<void> {
  const db = supabase();

  const { data: member } = await db
    .from("members")
    .select("account_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!member) return;

  const { data: account } = await db
    .from("accounts")
    .select("id, stripe_subscription_id, stripe_customer_id")
    .eq("id", member.account_id)
    .maybeSingle();

  if (!account) return;

  // Cancel the Stripe subscription if one exists
  if (account.stripe_subscription_id) {
    try {
      await stripe().subscriptions.cancel(account.stripe_subscription_id);
    } catch {
      // Already canceled — ignore
    }
  }

  // Delete the Stripe customer if one exists
  if (account.stripe_customer_id) {
    try {
      await stripe().customers.del(account.stripe_customer_id);
    } catch {
      // Already deleted — ignore
    }
  }

  // Delete account — members cascade via ON DELETE CASCADE
  await db.from("accounts").delete().eq("id", account.id);
}

/**
 * Purge all leftover e2e test accounts matching a given email pattern.
 * Useful for cleaning up after failed test runs.
 */
export async function purgeTestAccounts(emailPattern: string): Promise<number> {
  const db = supabase();
  const { data: members } = await db
    .from("members")
    .select("email")
    .like("email", emailPattern);
  if (!members?.length) return 0;
  await Promise.all(members.map((m) => cleanupAccountByEmail(m.email)));
  return members.length;
}

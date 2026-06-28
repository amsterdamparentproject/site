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

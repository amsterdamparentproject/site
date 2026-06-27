/**
 * DB + Stripe helpers for First Year Program Playwright tests.
 *
 * Talks directly to the test Supabase project (firstyear schema) and Stripe
 * to verify state after checkout and clean up after test runs.
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
// Read helpers
// ---------------------------------------------------------------------------

export interface FYPAccount {
  id: string;
  email: string;
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

export async function getAccountByEmail(
  email: string,
): Promise<FYPAccount | null> {
  const { data } = await supabase()
    .from("accounts")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data ?? null;
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
  const account = await getAccountByEmail(email);
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

  await db.from("accounts").delete().eq("id", account.id);
}

/**
 * Purge all leftover e2e test accounts matching a given email pattern.
 * Useful for cleaning up after failed test runs.
 */
export async function purgeTestAccounts(emailPattern: string): Promise<number> {
  const db = supabase();
  const { data: accounts } = await db
    .from("accounts")
    .select("email")
    .like("email", emailPattern);
  if (!accounts?.length) return 0;
  await Promise.all(accounts.map((a) => cleanupAccountByEmail(a.email)));
  return accounts.length;
}

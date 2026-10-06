import { stripe } from "@/lib/stripe-client";
import type { createFirstYearClient } from "@/lib/supabase/server";

type FirstYearClient = ReturnType<typeof createFirstYearClient>;

// Stripe Checkout sessions expire 24h after creation (we never set
// expires_at), so a pending account older than this can never be paid.
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export type CheckoutAttempt = {
  dbFlow: string;
  familyType: string;
  dueOrBirthMonth?: string;
  dueOrBirthYear?: string;
  members: { firstName: string; lastName: string; email: string }[];
};

const norm = (s: string) => s.trim().toLowerCase();

/**
 * checkout inserts a pending account + member rows for every Stripe session
 * it creates, so a double-clicked or retried "Join" leaves duplicate rows for
 * one email (and the abandoned ones are never cleaned up). Before creating a
 * new session, look for a still-open session from an identical earlier
 * attempt (same email(s), flow, family type, month/year, names) and hand its
 * URL back instead. Returns null when there is nothing safe to reuse, and
 * never throws: on any error the caller just creates a fresh session as
 * before.
 */
export async function findReusableCheckoutUrl(
  supabase: FirstYearClient,
  attempt: CheckoutAttempt,
): Promise<string | null> {
  try {
    const emails = attempt.members.map((m) => norm(m.email)).filter(Boolean);
    if (!emails.length) return null;

    const { data: byEmail } = await supabase
      .from("members")
      .select("account_id")
      .in("email", emails);
    const candidateIds = [...new Set((byEmail ?? []).map((r) => r.account_id))];
    if (!candidateIds.length) return null;

    const since = new Date(Date.now() - SESSION_TTL_MS).toISOString();
    let query = supabase
      .from("accounts")
      .select("id, stripe_session_id")
      .in("id", candidateIds)
      .eq("status", "pending")
      .eq("flow", attempt.dbFlow)
      .eq("family_type", attempt.familyType)
      .gte("created_at", since);
    query = attempt.dueOrBirthMonth
      ? query.eq("due_or_birth_month", attempt.dueOrBirthMonth)
      : query.is("due_or_birth_month", null);
    query = attempt.dueOrBirthYear
      ? query.eq("due_or_birth_year", attempt.dueOrBirthYear)
      : query.is("due_or_birth_year", null);
    const { data: accounts } = await query.order("created_at", {
      ascending: false,
    });

    for (const account of accounts ?? []) {
      if (!account.stripe_session_id) continue;

      // The earlier attempt must have captured exactly the same people.
      const { data: rows } = await supabase
        .from("members")
        .select("first_name, last_name, email")
        .eq("account_id", account.id);
      const key = (m: { first: string; last: string; email: string }) =>
        `${norm(m.email)}|${norm(m.first)}|${norm(m.last)}`;
      const existing = (rows ?? [])
        .map((r) =>
          key({ first: r.first_name, last: r.last_name, email: r.email }),
        )
        .sort();
      const wanted = attempt.members
        .map((m) =>
          key({ first: m.firstName, last: m.lastName, email: m.email }),
        )
        .sort();
      if (existing.join("\n") !== wanted.join("\n")) continue;

      const session = await stripe.checkout.sessions.retrieve(
        account.stripe_session_id,
      );
      if (session.status === "open" && session.url) return session.url;
    }
    return null;
  } catch (err) {
    console.error("[fyp checkout] reuse lookup failed (non-fatal):", err);
    return null;
  }
}

/**
 * Best-effort cleanup: deletes pending accounts (and their members) for these
 * emails that are old enough that their Stripe session has necessarily
 * expired. Pending accounts that never got a customer or subscription hold no
 * payment state, so nothing is lost. Never throws.
 */
export async function pruneExpiredPendingAccounts(
  supabase: FirstYearClient,
  emails: string[],
): Promise<void> {
  try {
    const normalized = emails.map(norm).filter(Boolean);
    if (!normalized.length) return;

    const { data: byEmail } = await supabase
      .from("members")
      .select("account_id")
      .in("email", normalized);
    const candidateIds = [...new Set((byEmail ?? []).map((r) => r.account_id))];
    if (!candidateIds.length) return;

    const cutoff = new Date(Date.now() - SESSION_TTL_MS).toISOString();
    const { data: stale } = await supabase
      .from("accounts")
      .select("id")
      .in("id", candidateIds)
      .eq("status", "pending")
      .is("stripe_customer_id", null)
      .is("stripe_subscription_id", null)
      .lt("created_at", cutoff);
    const staleIds = (stale ?? []).map((a) => a.id as string);
    if (!staleIds.length) return;

    await supabase.from("members").delete().in("account_id", staleIds);
    await supabase.from("accounts").delete().in("id", staleIds);
  } catch (err) {
    console.error("[fyp checkout] pending cleanup failed (non-fatal):", err);
  }
}

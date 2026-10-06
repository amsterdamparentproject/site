import type { createFirstYearClient } from "@/lib/supabase/server";

type FirstYearClient = ReturnType<typeof createFirstYearClient>;

export type MemberRef = { id: string; account_id: string };

// Lower = better. Staff/active accounts win over everything; a pending row
// (an unpaid checkout attempt) is the least trustworthy match.
const STATUS_RANK: Record<string, number> = {
  active: 0,
  staff: 0,
  canceling: 1,
  canceled: 2,
  pending: 3,
};
const UNKNOWN_STATUS_RANK = 2;

/**
 * Resolves the single firstyear.members row that an email should sign in as.
 *
 * members.email has no DB-level unique constraint, and checkout inserts a
 * pending account + member for every Stripe session it creates (a double
 * click or a retried checkout therefore leaves a second row for the same
 * email). A plain `.maybeSingle()` on email errors out when two rows match,
 * which made Hub sign-in resolve to "not a member". This picks the best row
 * instead: active over canceling/canceled over pending, newest first on ties.
 */
export async function findMemberByEmail(
  supabase: FirstYearClient,
  email: string,
): Promise<MemberRef | null> {
  const { data: rows, error } = await supabase
    .from("members")
    .select("id, account_id, created_at")
    .eq("email", email.trim().toLowerCase())
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !rows?.length) return null;
  if (rows.length === 1) {
    return { id: rows[0].id, account_id: rows[0].account_id };
  }

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, status")
    .in(
      "id",
      rows.map((r) => r.account_id),
    );

  const statusById = new Map<string, string>(
    (accounts ?? []).map((a) => [a.id as string, a.status as string]),
  );
  const rank = (accountId: string) =>
    STATUS_RANK[statusById.get(accountId) ?? ""] ?? UNKNOWN_STATUS_RANK;

  // rows are already newest-first, so a stable sort keeps recency as the tiebreak.
  const best = [...rows].sort(
    (a, b) => rank(a.account_id) - rank(b.account_id),
  )[0];
  return { id: best.id, account_id: best.account_id };
}

import { createFirstYearClient } from "@/lib/supabase/server";
import { findMemberByEmail } from "@/lib/fyp/member-lookup";

export type HubMember = { memberId: string; accountId: string; email: string };

/**
 * Authorization primitive for FYP Hub server actions.
 *
 * Verifies the caller's Supabase access token and resolves their
 * firstyear.members row + owning account. Hub actions MUST derive identity and
 * account from here and never trust a client-supplied member id, account id, or
 * Stripe customer id (see __claude__/security-audit-2026-07-24.md, S2/S3).
 * Mirrors postpartum-post's lib/require-member.ts.
 *
 * For actions that touch a *specific* member (editing/removing a partner,
 * activating their PP comp), verify the target is on the returned accountId
 * before proceeding. auth.getUser validates the JWT against the shared auth
 * project; the firstyear schema scoping doesn't affect .auth.* calls.
 *
 * Returns null when the token is missing, invalid/expired, or resolves to no
 * matching member row.
 */
export async function requireHubMember(
  accessToken: string,
): Promise<HubMember | null> {
  if (!accessToken) return null;

  const supabase = createFirstYearClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return null;

  // Not a bare .maybeSingle(): duplicate rows for one email (e.g. a retried
  // checkout's abandoned pending row) would make that lookup error out.
  const member = await findMemberByEmail(supabase, email);
  if (!member) return null;

  return {
    memberId: member.id,
    accountId: member.account_id,
    email,
  };
}

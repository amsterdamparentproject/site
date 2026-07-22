"use server";

import { createFirstYearClient } from "@/lib/supabase/server";

// FYP Hub auth — server actions.
//
// Mirrors postpartum-post/app/actions/profile.ts's checkMemberExists() /
// getMemberProfile() one-for-one: no server-side session, no RLS. Both
// actions trust their `email` argument, on the assumption that callers
// only ever pass an email that came from a live Supabase Auth session
// (checked client-side via onAuthStateChange in HubAccountContext) or,
// for checkFypMemberExists, an email the user just typed themselves before
// any session exists. See the "FYP Hub auth approach" memory for the
// pros/cons of this trust model vs. RLS.

export type HubMemberProfile = {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  accountStatus: string;
  planType: string;
};

/**
 * Whether this email resolves to a full, sign-in-able Hub member — gates
 * whether HubLoginForm even sends a magic link.
 *
 * Deliberately reuses getFypMemberProfile() rather than a lighter
 * members-only existence check: a member row with no resolvable account
 * would previously pass a members-only check, send the magic link anyway,
 * then fail post-signin and silently force a sign-out (see
 * HubAccountContext) — confusing, since nothing on screen explains why the
 * link "didn't work." Checking the same account+member join here means
 * that case now surfaces immediately as "No Hub account found," before any
 * email is sent, instead of after a successful-looking sign-in bounces the
 * user straight back out.
 */
export async function checkFypMemberExists(email: string): Promise<boolean> {
  const profile = await getFypMemberProfile(email);
  return profile !== null;
}

/**
 * Looks up the Hub member + their account status/plan for a signed-in
 * session's email. Returns null if no member row matches, or if the
 * member's account can't be resolved — the caller (HubAccountContext)
 * treats that as "authenticated but not a Hub member" and signs the
 * session back out.
 *
 * Note: firstyear.members.account_id is a NOT NULL FK with ON DELETE
 * CASCADE, so a member row genuinely outliving its account shouldn't
 * happen via normal app flows — deleting the account deletes the member
 * too. In practice this null branch is more likely to fire on a transient
 * query error than a truly orphaned row; today that's treated the same as
 * "not a member" (sign out), which is conservative but could
 * force-sign-out an otherwise-valid member on a momentary blip. Worth
 * distinguishing "confirmed not found" from "lookup failed" if that turns
 * out to matter in practice — not done here to keep this change scoped.
 */
export async function getFypMemberProfile(
  email: string,
): Promise<HubMemberProfile | null> {
  const supabase = createFirstYearClient();

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, account_id, first_name, last_name, email")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (memberError || !member) return null;

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("status, plan_type")
    .eq("id", member.account_id)
    .maybeSingle();

  if (accountError || !account) return null;

  return {
    id: member.id,
    accountId: member.account_id,
    firstName: member.first_name,
    lastName: member.last_name,
    email: member.email,
    accountStatus: account.status,
    planType: account.plan_type,
  };
}

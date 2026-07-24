"use server";

import { createFirstYearClient } from "@/lib/supabase/server";
import { deactivatePostpartumPost } from "@/lib/fyp/postpartum-post";

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
  whatsapp: string | null;
  accountStatus: string;
  planType: string;
  flow: string;
  // "single" or "multi" — the family-structure tier chosen at signup (see
  // FYPJoinForm's "I have a partner" / "I am a single parent" toggle).
  // Gates whether the Account tab offers "Add member": the join form's own
  // copy already promises multi-family signups they can "add your
  // partner(s) to the subscription from your profile" afterward — that's
  // this feature. Single-parent accounts don't get that copy/promise, so
  // they don't get the add-member UI either.
  familyType: string;
  stripeCustomerId: string | null;
  postpartumpostMemberId: string | null;
  billingStartDate: string | null;
  bundleExpiresAt: string | null;
  signedUpAt: string;
  // How many members share this account — used to disable "remove member"
  // when this is the only one (accounts can't have zero members today; see
  // deleteFypMember's docs).
  memberCount: number;
};

// Lightweight per-member summary for the Account tab's "other members"
// roster — deliberately excludes account-level fields (status, plan,
// billing dates) already shown once on the signed-in member's own card,
// since those are identical for every member on the same account.
export type HubAccountMemberSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string | null;
  postpartumpostMemberId: string | null;
  signedUpAt: string;
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
    .select(
      "id, account_id, first_name, last_name, email, whatsapp, postpartumpost_member_id",
    )
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (memberError || !member) return null;

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select(
      "status, plan_type, flow, family_type, stripe_customer_id, billing_start_date, bundle_expires_at, created_at",
    )
    .eq("id", member.account_id)
    .maybeSingle();

  if (accountError || !account) return null;

  const { count: memberCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("account_id", member.account_id);

  return {
    id: member.id,
    accountId: member.account_id,
    firstName: member.first_name,
    lastName: member.last_name,
    email: member.email,
    whatsapp: member.whatsapp,
    accountStatus: account.status,
    planType: account.plan_type,
    flow: account.flow,
    familyType: account.family_type,
    stripeCustomerId: account.stripe_customer_id,
    postpartumpostMemberId: member.postpartumpost_member_id,
    billingStartDate: account.billing_start_date,
    bundleExpiresAt: account.bundle_expires_at,
    signedUpAt: account.created_at,
    // count is unlikely to be null in practice (only if the query itself
    // errors, which head:true swallows into a null count) — defaulting to
    // 1 is the safe direction, since it disables delete rather than
    // wrongly allowing it on a bad count.
    memberCount: memberCount ?? 1,
  };
}

/**
 * Updates a Hub member's editable profile fields (first/last name and
 * WhatsApp number — email is tied to the Supabase Auth session identity
 * and isn't editable here). Mirrors app/hub/account/actions.ts's trust
 * model: no server-side session, trusts the memberId argument the same way
 * the rest of Hub's actions do.
 *
 * whatsapp is optional and unvalidated beyond trimming — see migration
 * 010's docs for why (no rigid format constraint; members may enter
 * numbers in different international formats).
 */
export async function updateFypMemberProfile(
  memberId: string,
  firstName: string,
  lastName: string,
  whatsapp: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  if (!trimmedFirst || !trimmedLast) {
    return { success: false, error: "First and last name are required" };
  }

  const supabase = createFirstYearClient();
  const { error } = await supabase
    .from("members")
    .update({
      first_name: trimmedFirst,
      last_name: trimmedLast,
      whatsapp: whatsapp.trim() || null,
    })
    .eq("id", memberId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Returns every member on an account, ordered by signup (oldest first) —
 * powers the Account tab's "other members" roster. Includes the signed-in
 * member themselves; callers filter them out by id since their own
 * HubMemberProfile (from getFypMemberProfile) already renders as the main
 * card.
 */
export async function getFypAccountMembers(
  accountId: string,
): Promise<HubAccountMemberSummary[]> {
  const supabase = createFirstYearClient();
  const { data, error } = await supabase
    .from("members")
    .select(
      "id, first_name, last_name, email, whatsapp, postpartumpost_member_id, created_at",
    )
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    firstName: m.first_name,
    lastName: m.last_name,
    email: m.email,
    whatsapp: m.whatsapp,
    postpartumpostMemberId: m.postpartumpost_member_id,
    signedUpAt: m.created_at,
  }));
}

/**
 * Adds a new member (e.g. a partner) to an existing FYP account — the
 * self-serve counterpart to what FYPJoinForm's checkout-time `members`
 * array already does for the first member. No separate billing step: the
 * family-structure discount (single vs multi) is a flat tier chosen once
 * at signup, not priced per seat, so adding a member here doesn't touch
 * Stripe — see FYPJoinForm's "After sign up, you can add your partner(s)
 * to the subscription from your profile" copy, which is exactly this
 * feature. Restricted to multi-family accounts by the caller (MemberCard's
 * familyType check) rather than here, consistent with this file's existing
 * trust model (server actions here don't re-derive gating from scratch;
 * see getFypMemberProfile's own docs on that trade-off).
 *
 * The new member doesn't need a separate account-creation step of their
 * own — like every other Hub member, their first sign-in (via the normal
 * magic-link flow) is what lazily creates their Supabase Auth user; this
 * action only needs to create their firstyear.members row so that sign-in
 * resolves to this account.
 */
export async function addFypMember(
  accountId: string,
  firstName: string,
  lastName: string,
  email: string,
  whatsapp?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedFirst || !trimmedLast || !trimmedEmail) {
    return {
      success: false,
      error: "First name, last name, and email are required",
    };
  }

  const supabase = createFirstYearClient();

  // Guard against adding an email that's already a member somewhere (on
  // this account or another) — members.email has no DB-level unique
  // constraint (see migration 006), so without this check a duplicate
  // would silently create two rows resolving to the same sign-in email,
  // and getFypMemberProfile's .maybeSingle() lookup would become
  // ambiguous.
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "This email is already used by another member",
    };
  }

  const { error } = await supabase.from("members").insert({
    account_id: accountId,
    first_name: trimmedFirst,
    last_name: trimmedLast,
    email: trimmedEmail,
    whatsapp: whatsapp?.trim() || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Removes a member from their FYP account. If they'd already activated
 * Postpartum Post, deactivates that comp first (best-effort correctness —
 * avoids leaving a dangling PP comp with no corresponding FYP member once
 * the members row is gone). Same trust model as the rest of this file: no
 * server-side session, trusts the memberId argument.
 *
 * Also used to remove members other than the caller (see the Account
 * tab's "other members" roster / addFypMember) — MemberCard's own delete
 * flow is the self-removal path (which signs the session out afterward,
 * since there'd be no member row left for it to resolve to); removing a
 * sibling member doesn't touch the caller's own session at all.
 */
export async function deleteFypMember(
  memberId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createFirstYearClient();

  const { data: member, error: lookupError } = await supabase
    .from("members")
    .select("postpartumpost_member_id")
    .eq("id", memberId)
    .maybeSingle();

  if (lookupError) {
    return { success: false, error: lookupError.message };
  }

  if (member?.postpartumpost_member_id) {
    try {
      await deactivatePostpartumPost(memberId);
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to deactivate Postpartum Post before removing member",
      };
    }
  }

  const { error } = await supabase.from("members").delete().eq("id", memberId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

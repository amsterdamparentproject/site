"use server";

import { createFirstYearClient } from "@/lib/supabase/server";
import { requireHubMember } from "@/lib/require-hub-member";
import * as fypMembers from "@/lib/fyp/members";
import { getResourceDownloadUrl } from "@/lib/fyp/resources";

export type {
  HubMemberProfile,
  HubAccountMemberSummary,
} from "@/lib/fyp/members";

// FYP Hub member-CRUD — Server Actions. Each mutating/reading action (other
// than checkFypMemberExists, which runs before a session exists) derives
// identity from the caller's verified Supabase access token via
// requireHubMember and account-scopes the target — never trusts a
// client-supplied member/account id (audit S2). The actual DB work lives in
// lib/fyp/members.ts.

/**
 * Whether this email resolves to a full, sign-in-able Hub member — gates
 * whether HubLoginForm even sends a magic link. Runs before any session
 * exists, so (unlike the rest of this file) it necessarily trusts the email
 * argument — it only ever returns a boolean, never member data.
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
  const profile = await fypMembers.getFypMemberProfile(email);
  return profile !== null;
}

/**
 * Looks up the signed-in caller's own Hub member + account status/plan.
 * Returns null if the token doesn't verify or no member row matches — the
 * caller (HubAccountContext) treats that as "authenticated but not a Hub
 * member" and signs the session back out.
 */
export async function getFypMemberProfile(
  accessToken: string,
): Promise<fypMembers.HubMemberProfile | null> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return null;
  return fypMembers.getFypMemberProfile(authed.email);
}

// Shared by updateFypMemberProfile/deleteFypMember: both act on a
// caller-supplied memberId that may be a sibling on the same account
// (MemberRoster reuses MemberCard's edit/delete flow for "other members"),
// so the check is "on my account," not "is me."
async function memberIsOnAccount(
  memberId: string,
  accountId: string,
): Promise<boolean> {
  const supabase = createFirstYearClient();
  const { data } = await supabase
    .from("members")
    .select("id")
    .eq("id", memberId)
    .eq("account_id", accountId)
    .maybeSingle();
  return !!data;
}

/**
 * Updates a Hub member's editable profile fields (first/last name and
 * WhatsApp — email is tied to the Supabase Auth session identity and isn't
 * editable here). The target may be the caller themselves or a sibling
 * member on the same account (audit S2) — never a member on another
 * account.
 */
export async function updateFypMemberProfile(
  accessToken: string,
  memberId: string,
  firstName: string,
  lastName: string,
  whatsapp: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return { success: false, error: "Not signed in" };

  if (!(await memberIsOnAccount(memberId, authed.accountId))) {
    return { success: false, error: "Member not found on your account" };
  }

  return fypMembers.updateFypMemberProfile(
    memberId,
    firstName,
    lastName,
    whatsapp,
  );
}

/**
 * Returns every member on the caller's own account, ordered by signup —
 * powers the Account tab's "other members" roster. The account is always
 * resolved from the caller's verified token, never a client-supplied
 * accountId (audit S2).
 */
export async function getFypAccountMembers(
  accessToken: string,
): Promise<fypMembers.HubAccountMemberSummary[]> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return [];
  return fypMembers.getFypAccountMembers(authed.accountId);
}

/**
 * Adds a new member (e.g. a partner) to the caller's own FYP account — see
 * lib/fyp/members.ts's addFypMember for the full behavior. The account is
 * always the caller's own, resolved from the verified token (audit S2).
 */
export async function addFypMember(
  accessToken: string,
  firstName: string,
  lastName: string,
  email: string,
  whatsapp?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return { success: false, error: "Not signed in" };

  return fypMembers.addFypMember(
    authed.accountId,
    firstName,
    lastName,
    email,
    whatsapp,
  );
}

/**
 * Mints a short-lived signed download URL for a resource guide in the FYP
 * guides Storage bucket — any signed-in Hub member or staff (facilitator/
 * admin) can download any guide, no per-role restriction, since guides
 * aren't account-scoped data. requireHubMember is still the gate: only a
 * verified Hub session gets a URL at all, which is the whole point of
 * moving guides off the old public static path.
 */
export async function getFypResourceDownloadUrl(
  accessToken: string,
  storagePath: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return { success: false, error: "Not signed in" };

  return getResourceDownloadUrl(storagePath);
}

/**
 * Returns the active FYP WhatsApp group's current invite link — Hub-only,
 * never a NEXT_PUBLIC_* var (see FYP_WHATSAPP_URL's own comment in
 * lib/fyp/resources.ts for why: rotation is the deciding factor, not just
 * confidentiality). requireHubMember is the actual gate; this Hub has no
 * server-side session/cookies (auth lives in browser localStorage only, see
 * HubAccountContext), so — same as resource guide downloads — the caller
 * must already hold a verified access token, which rules out a bare public
 * redirect route that could check membership server-side on its own.
 */
export async function getFypWhatsAppUrl(
  accessToken: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return { success: false, error: "Not signed in" };

  const url = process.env.FYP_WHATSAPP_URL;
  if (!url) return { success: false, error: "WhatsApp link not configured" };

  return { success: true, url };
}

/**
 * Returns the FYP Q&A form URL — Hub-only, never a NEXT_PUBLIC_* var (same
 * reasoning as getFypWhatsAppUrl: kept out of the public JS bundle rather
 * than just relying on obscurity). requireHubMember is the actual gate.
 */
export async function getFypQaFormUrl(
  accessToken: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return { success: false, error: "Not signed in" };

  const url = process.env.FYP_QA_FORM_URL;
  if (!url) return { success: false, error: "Q&A form not configured" };

  return { success: true, url };
}

/**
 * Removes a member from the caller's own FYP account — either the caller
 * themselves or a sibling member (same account-scoping as
 * updateFypMemberProfile; audit S2).
 */
export async function deleteFypMember(
  accessToken: string,
  memberId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return { success: false, error: "Not signed in" };

  if (!(await memberIsOnAccount(memberId, authed.accountId))) {
    return { success: false, error: "Member not found on your account" };
  }

  return fypMembers.deleteFypMember(memberId);
}

"use server";

import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";
import { requireHubMember } from "@/lib/require-hub-member";
import { generateMagicLinkWithRetry } from "@/lib/supabase/generate-magic-link";
import { activatePostpartumPost } from "@/lib/fyp/postpartum-post";
import { cancelFypAccount } from "@/lib/fyp/subscription";

// /hub/account mutations. Each derives identity from the caller's verified
// Supabase access token via requireHubMember (audit S2/S3) — never trusting a
// client-supplied member/account/customer id. Account-scoped actions verify
// the target belongs to the caller's own account before acting.

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Activates (or links to an existing) Postpartum Post membership for a Hub
 * member. Idempotent — see activatePostpartumPost()'s own docs.
 */
export async function activateMemberPostpartumPost(
  accessToken: string,
  targetMemberId: string,
): Promise<ActionResult> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return { success: false, error: "Not signed in" };

  // Only act on a member of the caller's own account (audit S2).
  const supabase = createFirstYearClient();
  const { data: target } = await supabase
    .from("members")
    .select("id")
    .eq("id", targetMemberId)
    .eq("account_id", authed.accountId)
    .maybeSingle();
  if (!target)
    return { success: false, error: "Member not found on your account" };

  try {
    await activatePostpartumPost(targetMemberId);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Cancels an FYP account (cancel_at_period_end for monthly plans, immediate
 * DB-only "canceling" for bundles) — see cancelFypAccount()'s own docs.
 */
export async function cancelFypSubscription(
  accessToken: string,
): Promise<ActionResult> {
  const authed = await requireHubMember(accessToken);
  if (!authed) return { success: false, error: "Not signed in" };

  try {
    await cancelFypAccount(authed.accountId);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Creates a Stripe Billing Portal session for an FYP customer and returns
 * its URL — mirrors postpartum-post/app/actions/profile.ts's
 * getCustomerPortalUrl() one-for-one. No FYP billing-portal integration
 * existed before this; monthly accounts have a real Stripe subscription to
 * manage there (payment method, invoices), bundle accounts still get a
 * portal session (invoice history) even without a subscription to manage.
 */
export async function getFypCustomerPortalUrl(
  accessToken: string,
): Promise<string> {
  const authed = await requireHubMember(accessToken);
  if (!authed) throw new Error("Not signed in");

  // Resolve the Stripe customer from the caller's own account — never trust a
  // client-supplied customer id (audit S3).
  const supabase = createFirstYearClient();
  const { data: account } = await supabase
    .from("accounts")
    .select("stripe_customer_id")
    .eq("id", authed.accountId)
    .single();
  if (!account?.stripe_customer_id) throw new Error("No billing account found");

  const session = await stripe.billingPortal.sessions.create({
    customer: account.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_DOMAIN ?? "https://amsterdamparentproject.nl"}/hub/billing`,
  });
  return session.url;
}

/**
 * Generates a one-click sign-in link into Postpartum Post for a Hub
 * member's email, so "Go to Postpartum Post" lands them in an already
 * signed-in session there instead of PP's own login form.
 *
 * Works because Hub and PP currently share one Supabase Auth project
 * (see the "FYP Hub auth approach" memory / the shared-email-branding
 * saga) — createFirstYearClient()'s service-role key is scoped to the
 * `firstyear` schema for table queries, but that scoping doesn't apply to
 * `.auth.admin.*` calls, which operate on the whole project's auth API
 * regardless. admin.generateLink is the exact mechanism e2e tests already
 * use to bypass real inbox delivery (see e2e/helpers/hub-auth.ts /
 * postpartum-post/e2e/helpers/auth.ts) — this is that same trick, for
 * real, in production.
 *
 * Only called for members who've already activated Postpartum Post (see
 * MemberCard's isPpActive gate), so a matching PP member row is guaranteed
 * to already exist, and since they're signing in via this same shared
 * Supabase project already (as a Hub member), their auth.users row already
 * exists too — the earlier-diagnosed "type=signup instead of magiclink for
 * brand-new emails" issue (see e2e memory) doesn't apply here.
 */
export async function getPostpartumPostSignInLink(
  accessToken: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const supabase = createFirstYearClient();

  // SECURITY (audit S1): never trust a client-supplied email here — returning
  // a working magic sign-in link for an arbitrary address is account takeover
  // (Hub and PP share one Supabase Auth project). Verify the caller's session
  // server-side and mint the link only for their OWN verified email. auth.getUser
  // validates the JWT against the shared auth project; the firstyear schema
  // scoping doesn't affect .auth.* calls (see this file's header docs).
  const { data: userData, error: userError } =
    await supabase.auth.getUser(accessToken);
  const email = userData?.user?.email?.toLowerCase();
  if (userError || !email) {
    return { success: false, error: "Not signed in" };
  }

  const redirectTo = `${process.env.POSTPARTUM_POST_BASE_URL ?? "https://postpartumpost.com"}/auth/confirm`;
  return generateMagicLinkWithRetry(supabase, email, redirectTo);
}

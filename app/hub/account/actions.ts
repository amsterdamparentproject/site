"use server";

import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";
import { activatePostpartumPost } from "@/lib/fyp/postpartum-post";
import { cancelFypAccount } from "@/lib/fyp/subscription";

// /hub/account mutations. Same trust model as app/hub/actions.ts: no
// server-side session (see HubAccountContext), so these trust the
// memberId/accountId argument on the assumption the caller only ever passes
// one it already resolved from a live, signed-in session's profile lookup.

type ActionResult = { success: true } | { success: false; error: string };

/**
 * Activates (or links to an existing) Postpartum Post membership for a Hub
 * member. Idempotent — see activatePostpartumPost()'s own docs.
 */
export async function activateMemberPostpartumPost(
  memberId: string,
): Promise<ActionResult> {
  try {
    await activatePostpartumPost(memberId);
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
  accountId: string,
): Promise<ActionResult> {
  try {
    await cancelFypAccount(accountId);
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
  stripeCustomerId: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
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
  email: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const supabase = createFirstYearClient();
  const redirectTo = `${process.env.POSTPARTUM_POST_BASE_URL ?? "https://postpartumpost.com"}/auth/confirm`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error || !data.properties?.action_link) {
    return {
      success: false,
      error:
        error?.message ?? "Failed to generate a Postpartum Post sign-in link",
    };
  }

  return { success: true, url: data.properties.action_link };
}

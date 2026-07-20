import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";

// FYP subscription lifecycle — cancellation.
//
// Mirrors Postpartum Post's pattern exactly (postpartum-post/lib/subscription-utils.ts
// + app/actions/unsubscribe.ts): a pure Stripe helper, plus a higher-level function
// that validates the account, calls it, and marks the account "canceling" (still
// has access until the current billing period ends). The FYP webhook's
// customer.subscription.deleted handler flips status to "canceled" once the
// period actually ends — never done here, since the period hasn't ended yet.
//
// firstyear.accounts.status is a plain text column (no enum/check constraint),
// so no migration is needed to introduce "canceling" as a third value:
// active | canceling | canceled.

/**
 * Sets a Stripe subscription to cancel at the end of the current billing
 * period. Mirrors Postpartum Post's cancelSubscription() one-for-one.
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Cancels an FYP account and marks it "canceling" — access continues
 * through the end of the current billing period / bundle term, then flips
 * to "canceled":
 *
 * - **Monthly accounts** (expecting_monthly, baby_monthly, baby_deposit once
 *   activated) have a real Stripe subscription — this sets
 *   `cancel_at_period_end: true` on it. `customer.subscription.deleted`
 *   (app/api/webhooks/stripe/fyp/route.ts) flips status to "canceled"
 *   automatically once Stripe actually ends the subscription.
 * - **Bundle accounts** (expecting_bundle, baby_bundle) are a one-time
 *   payment, already fully paid — there's no Stripe subscription to update.
 *   This is DB-only: status goes straight to "canceling". Nothing from
 *   Stripe will ever finalize it, since there's no subscription-ended event
 *   for a one-time charge — /api/fyp/process-bundle-cancellations (a monthly
 *   n8n sweep, scheduled alongside the existing end-of-month jobs) closes
 *   that gap by flipping "canceling" bundle accounts to "canceled" on the
 *   run immediately preceding `bundle_expires_at` (not once it's simply
 *   "passed" — that job only runs monthly, so waiting for a strict past-
 *   date check would leave an account "canceling" a full extra month after
 *   its term actually ends; see that route's docblock). See
 *   __claude__/fyp-improvements-plan.md § "Bundle term-end tracking" for why
 *   this doesn't reopen the "no aging-out job" decision made there — that
 *   decision is about not touching accounts that never asked to cancel.
 */
export async function cancelFypAccount(accountId: string): Promise<void> {
  const supabase = createFirstYearClient();

  const { data: account, error } = await supabase
    .from("accounts")
    .select("id, status, stripe_subscription_id, plan_type")
    .eq("id", accountId)
    .single();

  if (error || !account) {
    throw new Error(`Account not found: ${accountId}`);
  }

  if (account.status !== "active") {
    throw new Error(
      `Account ${accountId} is not active (status: ${account.status}) — nothing to cancel`,
    );
  }

  if (account.plan_type === "monthly") {
    if (!account.stripe_subscription_id) {
      throw new Error(
        `Account ${accountId} is a monthly plan with no stripe_subscription_id — can't cancel a subscription that was never created`,
      );
    }
    await cancelSubscription(account.stripe_subscription_id);
  }
  // Bundle plans fall through with no Stripe call — see docblock above.

  const { error: updateError } = await supabase
    .from("accounts")
    .update({ status: "canceling" })
    .eq("id", accountId);

  if (updateError) {
    // For monthly accounts, the Stripe call already succeeded — don't leave this silent.
    throw new Error(
      `${account.plan_type === "monthly" ? "Stripe subscription canceled but " : ""}DB update failed for account ${accountId}: ${JSON.stringify(updateError)}`,
    );
  }
}

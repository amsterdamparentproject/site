import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";
import { PROGRAM_START_UNIX } from "@/lib/fyp/program";
import { deactivatePostpartumPost } from "@/lib/fyp/postpartum-post";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Webhook endpoint for First Year Program Stripe events.
// Register in Stripe dashboard → Webhooks:
//   URL: https://amsterdamparentproject.nl/api/webhooks/stripe/fyp
//   Events: checkout.session.completed, customer.subscription.deleted
//
// On every completed checkout this webhook:
//   1. Updates the pending firstyear.accounts row (created by /api/checkout/fyp)
//      with Stripe customer/subscription IDs, billing dates, and status → active.
//   2. For expecting_monthly: creates a deferred subscription (trial_end = 1st of month
//      after due date) with the APP_FYP_DEPOSIT coupon applied to the first invoice.
//
// On customer.subscription.deleted (the billing period actually ends, not the
// moment someone requests cancellation — see /api/fyp/cancel for that):
//   Flips the matching firstyear.accounts row's status → canceled. Mirrors
//   Postpartum Post's webhook handling one-for-one (no separate
//   customer.subscription.updated handler — PP doesn't use one either).
//   Also deactivates any linked Postpartum Post comp for members on that
//   account (monthly plans only — see lib/fyp/postpartum-post.ts and
//   __claude__/fyp-improvements-plan.md § 2a).

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * Returns Unix timestamp for the 1st of the month after the given due month,
 * choosing the next upcoming occurrence.
 */
function billingStartTimestamp(dueMonth: string): number {
  const dueIdx = MONTH_INDEX[dueMonth];
  if (dueIdx === undefined) throw new Error(`Unknown month value: ${dueMonth}`);

  const billingIdx = (dueIdx + 1) % 12;
  const yearBump = dueIdx + 1 >= 12 ? 1 : 0;
  const now = new Date();
  const thisYear = now.getUTCFullYear();

  const candidateYear =
    billingIdx < now.getUTCMonth() ||
    (billingIdx === now.getUTCMonth() && now.getUTCDate() > 1)
      ? thisYear + 1
      : thisYear + yearBump;

  return Math.floor(
    new Date(Date.UTC(candidateYear, billingIdx, 1)).getTime() / 1000,
  );
}

/** Returns a YYYY-MM-DD string for a Unix timestamp */
function toDateString(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

/** Returns the 1st of the month that is 6 months after the given YYYY-MM-DD date */
function addSixMonths(date: string): string {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + 6);
  d.setUTCDate(1);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  console.log("[fyp webhook] POST received");
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("[fyp webhook] missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_FYP!,
    );
  } catch (err) {
    console.error("[fyp webhook] signature verification failed:", String(err));
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const product = session.metadata?.product;
    const familyType = session.metadata?.family_type ?? "multi";
    // Month/year come from session metadata (collected on-page)
    const dueOrBirthMonth = session.metadata?.due_or_birth_month;
    const customerId = session.customer as string | null;

    console.log("[fyp webhook] checkout.session.completed", {
      sessionId: session.id.slice(-8),
      product,
      familyType,
      dueOrBirthMonth,
      subscription: session.subscription,
      supabaseUrl:
        process.env.NEXT_PUBLIC_TEST_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_SUPABASE_URL,
    });

    const supabase = createFirstYearClient();

    // ── expecting_monthly ──────────────────────────────────────────────────────
    if (product === "fyp_deposit") {
      let subscriptionId: string | null = null;
      let billingStartDate: string | null = null;

      if (!customerId) {
        console.error("[fyp webhook] no customer on fyp_deposit session");
      } else if (!dueOrBirthMonth) {
        console.error(
          "[fyp webhook] missing due_or_birth_month in session metadata",
        );
      } else {
        try {
          const trialEnd = Math.max(
            billingStartTimestamp(dueOrBirthMonth),
            PROGRAM_START_UNIX,
          );
          billingStartDate = toDateString(trialEnd);

          const lookupKey =
            familyType === "multi" ? "fyp_monthly_multi" : "fyp_monthly_single";
          const prices = await stripe.prices.list({ lookup_keys: [lookupKey] });
          const price = prices.data[0];
          if (!price) throw new Error(`Price not found: ${lookupKey}`);

          const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: price.id }],
            trial_end: trialEnd,
            discounts: [{ coupon: process.env.STRIPE_FYP_DEPOSIT_COUPON_ID! }],
          });
          subscriptionId = subscription.id;
          console.log(
            `[fyp webhook] subscription ${subscriptionId} deferred to ${billingStartDate}`,
          );
        } catch (err) {
          console.error(
            "[fyp webhook] failed to create deferred subscription:",
            err,
          );
        }
      }

      const { error } = await supabase
        .from("accounts")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          billing_start_date: billingStartDate,
          status: "active",
        })
        .eq("stripe_session_id", session.id);
      if (error)
        console.error(
          "[fyp webhook] update error (expecting_monthly):",
          JSON.stringify(error),
        );
    }

    // ── expecting_bundle ───────────────────────────────────────────────────────
    if (product === "fyp_bundle_expecting") {
      let billingStartDate: string | null = null;
      let bundleExpiresAt: string | null = null;

      if (dueOrBirthMonth) {
        billingStartDate = toDateString(
          Math.max(billingStartTimestamp(dueOrBirthMonth), PROGRAM_START_UNIX),
        );
        bundleExpiresAt = addSixMonths(billingStartDate);
      }

      const { error } = await supabase
        .from("accounts")
        .update({
          stripe_customer_id: customerId,
          billing_start_date: billingStartDate,
          bundle_expires_at: bundleExpiresAt,
          status: "active",
        })
        .eq("stripe_session_id", session.id);
      if (error)
        console.error(
          "[fyp webhook] update error (expecting_bundle):",
          JSON.stringify(error),
        );
    }

    // ── baby_deposit ───────────────────────────────────────────────────────────
    // Baby families joining before PROGRAM_START. Identical to expecting_monthly
    // except trial_end is fixed at PROGRAM_START rather than computed from due date.
    if (product === "fyp_baby_deposit") {
      let subscriptionId: string | null = null;
      const billingStartDate = "2026-09-01";

      if (!customerId) {
        console.error("[fyp webhook] no customer on fyp_baby_deposit session");
      } else {
        try {
          const lookupKey =
            familyType === "multi" ? "fyp_monthly_multi" : "fyp_monthly_single";
          const prices = await stripe.prices.list({ lookup_keys: [lookupKey] });
          const price = prices.data[0];
          if (!price) throw new Error(`Price not found: ${lookupKey}`);

          const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: price.id }],
            trial_end: PROGRAM_START_UNIX,
            discounts: [{ coupon: process.env.STRIPE_FYP_DEPOSIT_COUPON_ID! }],
          });
          subscriptionId = subscription.id;
          console.log(
            `[fyp webhook] baby_deposit subscription ${subscriptionId} deferred to ${billingStartDate}`,
          );
        } catch (err) {
          console.error(
            "[fyp webhook] failed to create deferred subscription (baby_deposit):",
            err,
          );
        }
      }

      const { error } = await supabase
        .from("accounts")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          billing_start_date: billingStartDate,
          status: "active",
        })
        .eq("stripe_session_id", session.id);
      if (error)
        console.error(
          "[fyp webhook] update error (baby_deposit):",
          JSON.stringify(error),
        );
    }

    // ── baby_monthly ───────────────────────────────────────────────────────────
    if (product === "fyp_monthly_baby") {
      const subscriptionId = session.subscription as string | null;
      const today = new Date().toISOString().slice(0, 10);

      const { error } = await supabase
        .from("accounts")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          billing_start_date: today,
          status: "active",
        })
        .eq("stripe_session_id", session.id);
      if (error)
        console.error(
          "[fyp webhook] update error (baby_monthly):",
          JSON.stringify(error),
        );
    }

    // ── baby_bundle ────────────────────────────────────────────────────────────
    if (product === "fyp_bundle_baby") {
      const today = new Date().toISOString().slice(0, 10);
      // Before PROGRAM_START the checkout session embeds billing_start_date:"2026-09-01"
      // in metadata so access doesn't begin before the program launches.
      const billingStartDate = session.metadata?.billing_start_date ?? today;

      const { error } = await supabase
        .from("accounts")
        .update({
          stripe_customer_id: customerId,
          billing_start_date: billingStartDate,
          bundle_expires_at: addSixMonths(billingStartDate),
          status: "active",
        })
        .eq("stripe_session_id", session.id);
      if (error)
        console.error(
          "[fyp webhook] update error (baby_bundle):",
          JSON.stringify(error),
        );
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const supabase = createFirstYearClient();

    const { data: account, error: fetchError } = await supabase
      .from("accounts")
      .select("id")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();

    if (fetchError || !account) {
      console.error(
        "[fyp webhook] no account found for subscription (subscription.deleted):",
        subscription.id,
        JSON.stringify(fetchError),
      );
    } else {
      const { error } = await supabase
        .from("accounts")
        .update({ status: "canceled" })
        .eq("id", account.id);

      if (error) {
        console.error(
          "[fyp webhook] update error (subscription.deleted):",
          JSON.stringify(error),
        );
      } else {
        console.log(
          `[fyp webhook] subscription ${subscription.id} deleted — account marked canceled`,
        );
      }

      // Monthly-plan Postpartum Post comp: strip the discount now that FYP
      // access has actually ended. Bundle comps self-expire against
      // bundle_expires_at and never need this call — see
      // __claude__/fyp-improvements-plan.md § 2a.
      const { data: linkedMembers } = await supabase
        .from("members")
        .select("id")
        .eq("account_id", account.id)
        .not("postpartumpost_member_id", "is", null);

      for (const member of linkedMembers ?? []) {
        try {
          await deactivatePostpartumPost(member.id);
        } catch (err) {
          console.error(
            `[fyp webhook] failed to deactivate Postpartum Post for member ${member.id}:`,
            err,
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

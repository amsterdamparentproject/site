import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Webhook endpoint for First Year Program Stripe events.
// Register in Stripe dashboard → Webhooks:
//   URL: https://amsterdamparentproject.nl/api/webhooks/stripe/fyp
//   Events: checkout.session.completed
//
// On every completed checkout this webhook:
//   1. Inserts a row into firstyear.accounts
//   2. For expecting_monthly: creates a deferred subscription (trial_end = 1st of month
//      after due date) with the APP_FYP_DEPOSIT coupon applied to the first invoice
//
// TODO: also create a Postpartum Post subscription and seed their Post profile
//   with due_or_birth_month, due_or_birth_year, language from checkout metadata.
//   Post profile is the source of truth for profile data (zip, bio, etc.).

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

/** Adds 6 months to a YYYY-MM-DD string */
function addSixMonths(date: string): string {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + 6);
  return d.toISOString().slice(0, 10);
}

function getCustomField(
  fields: Stripe.Checkout.Session.CustomField[],
  key: string,
): string | undefined {
  return fields.find((f) => f.key === key)?.dropdown?.value ?? undefined;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_FYP!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const product = session.metadata?.product;
    const familyType = session.metadata?.family_type ?? "multi";
    const customFields = session.custom_fields ?? [];
    const email = session.customer_details?.email ?? "";
    const customerId = session.customer as string | null;

    const supabase = createFirstYearClient();

    // ── expecting_monthly ──────────────────────────────────────────────────────
    // 1. Create deferred subscription with APP_FYP_DEPOSIT coupon
    // 2. Insert member row
    if (product === "fyp_deposit") {
      const dueOrBirthMonth = getCustomField(
        customFields,
        "due_or_birth_month",
      );
      const dueOrBirthYear = getCustomField(customFields, "due_or_birth_year");
      // language and zip collected via Post profile, not checkout
      const language = getCustomField(customFields, "language");

      let subscriptionId: string | null = null;
      let billingStartDate: string | null = null;

      if (!customerId) {
        console.error("[fyp webhook] no customer on fyp_deposit session");
      } else if (!dueOrBirthMonth) {
        console.error(
          "[fyp webhook] missing due_or_birth_month in custom_fields",
        );
      } else {
        try {
          const trialEnd = billingStartTimestamp(dueOrBirthMonth);
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

      const { error: insertError } = await supabase.from("accounts").insert({
        email,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        stripe_subscription_id: subscriptionId,
        flow: "expecting_monthly",
        plan_type: "monthly",
        family_type: familyType,
        due_or_birth_month: dueOrBirthMonth,
        due_or_birth_year: dueOrBirthYear,
        billing_start_date: billingStartDate,
      });
      if (insertError)
        console.error(
          "[fyp webhook] insert error (expecting_monthly):",
          insertError,
        );
    }

    // ── expecting_bundle ───────────────────────────────────────────────────────
    if (product === "fyp_bundle_expecting") {
      const dueOrBirthMonth = getCustomField(
        customFields,
        "due_or_birth_month",
      );
      const dueOrBirthYear = getCustomField(customFields, "due_or_birth_year");

      let billingStartDate: string | null = null;
      let bundleExpiresAt: string | null = null;

      if (dueOrBirthMonth) {
        billingStartDate = toDateString(billingStartTimestamp(dueOrBirthMonth));
        bundleExpiresAt = addSixMonths(billingStartDate);
      }

      const { error: insertError } = await supabase.from("accounts").insert({
        email,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        flow: "expecting_bundle",
        plan_type: "bundle",
        family_type: familyType,
        due_or_birth_month: dueOrBirthMonth,
        due_or_birth_year: dueOrBirthYear,
        billing_start_date: billingStartDate,
        bundle_expires_at: bundleExpiresAt,
      });
      if (insertError)
        console.error(
          "[fyp webhook] insert error (expecting_bundle):",
          insertError,
        );
    }

    // ── baby_monthly ───────────────────────────────────────────────────────────
    if (product === "fyp_monthly_baby") {
      const dueOrBirthMonth = getCustomField(
        customFields,
        "due_or_birth_month",
      );
      const dueOrBirthYear = getCustomField(customFields, "due_or_birth_year");
      const subscriptionId = session.subscription as string | null;

      const { error: insertError } = await supabase.from("accounts").insert({
        email,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        stripe_subscription_id: subscriptionId,
        flow: "baby_monthly",
        plan_type: "monthly",
        family_type: familyType,
        due_or_birth_month: dueOrBirthMonth,
        due_or_birth_year: dueOrBirthYear,
      });
      if (insertError)
        console.error(
          "[fyp webhook] insert error (baby_monthly):",
          insertError,
        );
    }

    // ── baby_bundle ────────────────────────────────────────────────────────────
    if (product === "fyp_bundle_baby") {
      const dueOrBirthMonth = getCustomField(
        customFields,
        "due_or_birth_month",
      );
      const dueOrBirthYear = getCustomField(customFields, "due_or_birth_year");
      const today = new Date().toISOString().slice(0, 10);

      const { error: insertError } = await supabase.from("accounts").insert({
        email,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        flow: "baby_bundle",
        plan_type: "bundle",
        family_type: familyType,
        due_or_birth_month: dueOrBirthMonth,
        due_or_birth_year: dueOrBirthYear,
        billing_start_date: today,
        bundle_expires_at: addSixMonths(today),
      });
      if (insertError)
        console.error("[fyp webhook] insert error (baby_bundle):", insertError);
    }
  }

  return NextResponse.json({ received: true });
}

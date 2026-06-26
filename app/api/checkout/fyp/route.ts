import { stripe } from "@/lib/stripe-client";
import { NextResponse } from "next/server";

// FYP checkout flows:
//
//   expecting_monthly  — Step 1: €25 deposit (mode:payment, customer_creation:always)
//                        Step 2: webhook creates subscription with trial_end + APP_FYP_DEPOSIT coupon
//   expecting_bundle   — One-time payment: €305 (single) or €383 (multi)
//   baby_monthly       — Subscription starts immediately: €55 or €68/mo
//   baby_bundle        — One-time payment: €305 or €383
//
// Stripe setup required:
//   Recurring prices with lookup keys:
//     fyp_monthly_single  → €55/mo  (unit_amount: 5500)
//     fyp_monthly_multi   → €68/mo  (unit_amount: 6800)
//   Coupon:
//     ID: APP_FYP_DEPOSIT — €25 fixed amount off, duration "once"
//
// Webhook: /api/webhooks/stripe/fyp
//   Listens for checkout.session.completed where metadata.product === "fyp_deposit"
//   Creates the subscription, sets trial_end from due_month, applies APP_FYP_DEPOSIT coupon.

type Flow = "expecting_monthly" | "expecting_bundle" | "baby_monthly" | "baby_bundle";
type FamilyType = "single" | "multi";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "https://amsterdamparentproject.nl";

// Bundle prices in cents
const BUNDLE_AMOUNT: Record<FamilyType, number> = {
  single: 30500, // €305
  multi: 38300,  // €383
};

const MONTH_OPTIONS = [
  { label: "January", value: "jan" },
  { label: "February", value: "feb" },
  { label: "March", value: "mar" },
  { label: "April", value: "apr" },
  { label: "May", value: "may" },
  { label: "June", value: "jun" },
  { label: "July", value: "jul" },
  { label: "August", value: "aug" },
  { label: "September", value: "sep" },
  { label: "October", value: "oct" },
  { label: "November", value: "nov" },
  { label: "December", value: "dec" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { label: String(currentYear - 1), value: String(currentYear - 1) },
  { label: String(currentYear),     value: String(currentYear) },
  { label: String(currentYear + 1), value: String(currentYear + 1) },
];

const SHARED_FIELDS = (monthLabel: string, yearLabel: string) => [
  {
    key: "due_or_birth_month",
    label: { type: "custom" as const, custom: monthLabel },
    type: "dropdown" as const,
    dropdown: { options: MONTH_OPTIONS },
  },
  {
    key: "due_or_birth_year",
    label: { type: "custom" as const, custom: yearLabel },
    type: "dropdown" as const,
    dropdown: { options: YEAR_OPTIONS },
  },
];

const EXPECTING_CUSTOM_FIELDS = SHARED_FIELDS("Due month", "Due year");
const BABY_CUSTOM_FIELDS = SHARED_FIELDS("Birth month", "Birth year");

export async function POST(req: Request) {
  try {
    const { flow, familyType }: { flow: Flow; familyType: FamilyType } = await req.json();

    if (!flow || !familyType) {
      return NextResponse.json({ error: "Missing flow or familyType" }, { status: 400 });
    }

    const successUrl = `${DOMAIN}/programs/first-year/welcome?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${DOMAIN}/programs/first-year#join`;

    // ── Expecting, monthly ─────────────────────────────────────────────────────
    // Collects the €25 deposit as a one-time payment. customer_creation: "always"
    // ensures a Stripe Customer is created so the webhook can attach a deferred
    // subscription to them. Webhook reads due_month → computes trial_end → creates
    // subscription with APP_FYP_DEPOSIT coupon (€25 off first real invoice).
    if (flow === "expecting_monthly") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        customer_creation: "always",
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "First Year Program — Deposit",
                description:
                  "Reserve your spot in the First Year Program. The deposit is credited toward your first month of billing after your due date. Fully refundable if you cancel during pregnancy.",
              },
              unit_amount: 2500,
            },
            quantity: 1,
          },
        ],
        custom_fields: EXPECTING_CUSTOM_FIELDS,
        metadata: { product: "fyp_deposit", family_type: familyType },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return NextResponse.json({ url: session.url });
    }

    // ── Expecting, 6-month bundle ──────────────────────────────────────────────
    if (flow === "expecting_bundle") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        customer_creation: "always",
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `First Year Program — 6-month bundle (${familyType === "multi" ? "2+ parent family" : "single parent family"})`,
                description:
                  "6 months of the First Year Program, paid upfront. Program begins after your due date. Fully refundable if you cancel during pregnancy.",
              },
              unit_amount: BUNDLE_AMOUNT[familyType],
            },
            quantity: 1,
          },
        ],
        custom_fields: EXPECTING_CUSTOM_FIELDS,
        metadata: { product: "fyp_bundle_expecting", family_type: familyType },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return NextResponse.json({ url: session.url });
    }

    // ── Baby's here, monthly ───────────────────────────────────────────────────
    if (flow === "baby_monthly") {
      const prices = await stripe.prices.list({
        lookup_keys: [familyType === "multi" ? "fyp_monthly_multi" : "fyp_monthly_single"],
      });
      const price = prices.data[0];
      if (!price) throw new Error(`FYP monthly price not found for ${familyType}`);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        mode: "subscription",
        line_items: [{ price: price.id, quantity: 1 }],
        custom_fields: BABY_CUSTOM_FIELDS,
        metadata: { product: "fyp_monthly_baby", family_type: familyType },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return NextResponse.json({ url: session.url });
    }

    // ── Baby's here, 6-month bundle ────────────────────────────────────────────
    if (flow === "baby_bundle") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        customer_creation: "always",
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `First Year Program — 6-month bundle (${familyType === "multi" ? "2+ parent family" : "single parent family"})`,
                description: "6 months of the First Year Program, paid upfront. Program begins immediately.",
              },
              unit_amount: BUNDLE_AMOUNT[familyType],
            },
            quantity: 1,
          },
        ],
        custom_fields: BABY_CUSTOM_FIELDS,
        metadata: { product: "fyp_bundle_baby", family_type: familyType },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Unknown flow" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

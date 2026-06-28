import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";
import {
  PROGRAM_START,
  PROGRAM_START_UNIX,
  getBillingStartDate,
} from "@/lib/fyp/program";
import { NextResponse } from "next/server";

// FYP checkout flows:
//
//   expecting_monthly  — Step 1: €25 deposit (mode:payment, customer_creation:always)
//                        Step 2: webhook creates subscription with trial_end=due+1mo + APP_FYP_DEPOSIT coupon
//   expecting_bundle   — One-time payment: €305 (single) or €383 (multi)
//   baby_deposit       — €25 deposit; webhook creates subscription with trial_end=PROGRAM_START + coupon
//                        Used instead of baby_monthly while current date < PROGRAM_START
//   baby_monthly       — Subscription starts immediately: €55 or €68/mo (used after PROGRAM_START)
//   baby_bundle        — One-time payment: €305 or €383; billing_start_date=PROGRAM_START if before Sept 2026
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
//
// Month/year are collected via the on-page form and passed as metadata.
// A pending firstyear.accounts record is created here; the webhook activates it.

type Flow =
  | "expecting_monthly"
  | "expecting_bundle"
  | "baby_deposit"
  | "baby_monthly"
  | "baby_bundle";
type FamilyType = "single" | "multi";

// Re-export for consumers and tests
export { PROGRAM_START, PROGRAM_START_UNIX, getBillingStartDate };

const DOMAIN =
  process.env.NEXT_PUBLIC_DOMAIN ?? "https://amsterdamparentproject.nl";

const PRODUCT_IMAGES = [
  "https://amsterdamparentproject.nl/static/images/logo/square.png",
];

// Bundle prices in cents
const BUNDLE_AMOUNT: Record<FamilyType, number> = {
  single: 30500, // €305
  multi: 38300, // €383
};

// Maps client-side flow name → DB flow + plan_type
const FLOW_META: Record<Flow, { flow: string; plan_type: string }> = {
  expecting_monthly: { flow: "expecting_monthly", plan_type: "monthly" },
  expecting_bundle: { flow: "expecting_bundle", plan_type: "bundle" },
  baby_deposit: { flow: "baby_deposit", plan_type: "monthly" },
  baby_monthly: { flow: "baby_monthly", plan_type: "monthly" },
  baby_bundle: { flow: "baby_bundle", plan_type: "bundle" },
};

interface MemberInput {
  firstName: string;
  lastName: string;
  email: string;
}

export async function POST(req: Request) {
  try {
    const {
      flow,
      familyType,
      dueOrBirthMonth,
      dueOrBirthYear,
      members,
    }: {
      flow: Flow;
      familyType: FamilyType;
      dueOrBirthMonth?: string;
      dueOrBirthYear?: string;
      members?: MemberInput[];
    } = await req.json();

    if (!flow || !familyType) {
      return NextResponse.json(
        { error: "Missing flow or familyType" },
        { status: 400 },
      );
    }

    const successUrl = `${DOMAIN}/programs/first-year/welcome?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${DOMAIN}/programs/first-year#join`;

    // Shared metadata — month/year from on-page form replace Stripe custom fields
    const sharedMetadata = {
      family_type: familyType,
      ...(dueOrBirthMonth ? { due_or_birth_month: dueOrBirthMonth } : {}),
      ...(dueOrBirthYear ? { due_or_birth_year: dueOrBirthYear } : {}),
    };

    let session: Awaited<
      ReturnType<typeof stripe.checkout.sessions.create>
    > | null = null;

    // ── Expecting, monthly ─────────────────────────────────────────────────────
    if (flow === "expecting_monthly") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        allow_promotion_codes: true,
        customer_creation: "always",
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "First Year Program — Deposit",
                images: PRODUCT_IMAGES,
                description:
                  "Reserve your spot in the First Year Program. The deposit is credited toward your first month of billing after your due date. Fully refundable if you cancel during pregnancy.",
              },
              unit_amount: 2500,
            },
            quantity: 1,
          },
        ],
        metadata: { product: "fyp_deposit", ...sharedMetadata },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    }

    // ── Expecting, 6-month bundle ──────────────────────────────────────────────
    if (flow === "expecting_bundle") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        allow_promotion_codes: true,
        customer_creation: "always",
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `First Year Program — 6-month bundle (${familyType === "multi" ? "2+ parent family" : "single parent family"})`,
                images: PRODUCT_IMAGES,
                description:
                  "6 months of the First Year Program, paid upfront. Program begins after your due date. Fully refundable if you cancel during pregnancy.",
              },
              unit_amount: BUNDLE_AMOUNT[familyType],
            },
            quantity: 1,
          },
        ],
        metadata: { product: "fyp_bundle_expecting", ...sharedMetadata },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    }

    // ── Baby's here, deposit (before PROGRAM_START) ────────────────────────────
    // Same as expecting_monthly but trial_end is fixed at PROGRAM_START.
    // The webhook creates the subscription and applies the deposit coupon.
    if (flow === "baby_deposit") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        allow_promotion_codes: true,
        customer_creation: "always",
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "First Year Program — Deposit",
                images: PRODUCT_IMAGES,
                description:
                  "Reserve your spot in the First Year Program. The deposit is credited toward your first month of billing in September 2026. Refundable if you cancel before the program begins.",
              },
              unit_amount: 2500,
            },
            quantity: 1,
          },
        ],
        metadata: { product: "fyp_baby_deposit", ...sharedMetadata },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    }

    // ── Baby's here, monthly ───────────────────────────────────────────────────
    if (flow === "baby_monthly") {
      const prices = await stripe.prices.list({
        lookup_keys: [
          familyType === "multi" ? "fyp_monthly_multi" : "fyp_monthly_single",
        ],
      });
      const price = prices.data[0];
      if (!price)
        throw new Error(`FYP monthly price not found for ${familyType}`);

      session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        allow_promotion_codes: true,
        mode: "subscription",
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: { product: "fyp_monthly_baby", ...sharedMetadata },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    }

    // ── Baby's here, 6-month bundle ────────────────────────────────────────────
    if (flow === "baby_bundle") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        automatic_tax: { enabled: true },
        allow_promotion_codes: true,
        customer_creation: "always",
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `First Year Program — 6-month bundle (${familyType === "multi" ? "2+ parent family" : "single parent family"})`,
                images: PRODUCT_IMAGES,
                description: billingStartDate
                  ? "6 months of the First Year Program, paid upfront. Access period begins September 2026."
                  : "6 months of the First Year Program, paid upfront. Access begins immediately.",
              },
              unit_amount: BUNDLE_AMOUNT[familyType],
            },
            quantity: 1,
          },
        ],
        metadata: {
          product: "fyp_bundle_baby",
          ...(billingStartDate ? { billing_start_date: billingStartDate } : {}),
          ...sharedMetadata,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    }

    if (!session) {
      return NextResponse.json({ error: "Unknown flow" }, { status: 400 });
    }

    // Create pending account record — the webhook will activate it after payment
    const { flow: dbFlow, plan_type } = FLOW_META[flow];
    const supabase = createFirstYearClient();
    const { data: accountData, error: insertError } = await supabase
      .from("accounts")
      .insert({
        stripe_session_id: session.id,
        flow: dbFlow,
        plan_type,
        family_type: familyType,
        due_or_birth_month: dueOrBirthMonth ?? null,
        due_or_birth_year: dueOrBirthYear ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !accountData) {
      console.error(
        "[fyp checkout] failed to create pending account:",
        JSON.stringify(insertError),
      );
      // Non-fatal — proceed to checkout.
    } else if (members?.length) {
      // Insert pending member records (email lives here, not on the account)
      const { error: memberError } = await supabase.from("members").insert(
        members.map((m) => ({
          account_id: accountData.id,
          first_name: m.firstName,
          last_name: m.lastName,
          email: m.email.toLowerCase(),
          status: "pending",
        })),
      );
      if (memberError) {
        console.error(
          "[fyp checkout] failed to create pending members:",
          JSON.stringify(memberError),
        );
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { stripe } from "@/lib/stripe-client";
import { createFirstYearClient } from "@/lib/supabase/server";
import {
  findReusableCheckoutUrl,
  pruneExpiredPendingAccounts,
} from "@/lib/fyp/checkout-dedupe";
import { NextResponse } from "next/server";

// FYP checkout flows (bundle-only since October 2026):
//
//   expecting_bundle   — One-time payment: €305 (single) or €383 (multi)
//   baby_bundle        — One-time payment: €305 or €383, access begins immediately
//
// The monthly flows (expecting_monthly, baby_monthly) are retired; requests
// for them get a 400. Existing monthly families keep their Stripe
// subscriptions, and the webhook still handles those products so any checkout
// session opened before the cutover completes normally. Individual events are
// paid for on the Luma calendar, not here.
//
// Webhook: /api/webhooks/stripe/fyp activates the pending account created below.
//
// Month/year are collected via the on-page form and passed as metadata.
// A pending firstyear.accounts record is created here; the webhook activates it.

type Flow = "expecting_bundle" | "baby_bundle";
type FamilyType = "single" | "multi";

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
  expecting_bundle: { flow: "expecting_bundle", plan_type: "bundle" },
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

    // Monthly plans (expecting_monthly, baby_deposit, baby_monthly) were retired
    // in October 2026: only bundles can be bought now. Existing monthly
    // families are grandfathered — their subscriptions and the webhook's
    // handling of already-open sessions are untouched.
    if (!Object.prototype.hasOwnProperty.call(FLOW_META, flow)) {
      return NextResponse.json(
        { error: `Unsupported flow: ${flow}` },
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

    const customerEmail = members?.[0]?.email?.toLowerCase();

    const supabase = createFirstYearClient();

    // Every checkout used to insert a fresh pending account + member rows, so
    // a double-click or a retry left duplicate rows for one email (which broke
    // Hub sign-in). Hand back the still-open session from an identical earlier
    // attempt rather than creating another, and sweep out long-expired ones.
    if (members?.length) {
      const reusableUrl = await findReusableCheckoutUrl(supabase, {
        dbFlow: FLOW_META[flow].flow,
        familyType,
        dueOrBirthMonth,
        dueOrBirthYear,
        members,
      });
      if (reusableUrl) return NextResponse.json({ url: reusableUrl });

      await pruneExpiredPendingAccounts(
        supabase,
        members.map((m) => m.email),
      );
    }

    let session: Awaited<
      ReturnType<typeof stripe.checkout.sessions.create>
    > | null = null;

    // ── Expecting, 6-month bundle ──────────────────────────────────────────────
    if (flow === "expecting_bundle") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        // KOR (small-business VAT exemption) since 2026-07-01: no VAT on payments.
        automatic_tax: { enabled: false },
        allow_promotion_codes: true,
        customer_creation: "always",
        ...(customerEmail ? { customer_email: customerEmail } : {}),
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

    // ── Baby's here, 6-month bundle ────────────────────────────────────────────
    if (flow === "baby_bundle") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["ideal", "card"],
        // KOR (small-business VAT exemption) since 2026-07-01: no VAT on payments.
        automatic_tax: { enabled: false },
        allow_promotion_codes: true,
        customer_creation: "always",
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `First Year Program — 6-month bundle (${familyType === "multi" ? "2+ parent family" : "single parent family"})`,
                images: PRODUCT_IMAGES,
                description:
                  "6 months of the First Year Program, paid upfront. Access begins immediately.",
              },
              unit_amount: BUNDLE_AMOUNT[familyType],
            },
            quantity: 1,
          },
        ],
        metadata: { product: "fyp_bundle_baby", ...sharedMetadata },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    }

    if (!session) {
      return NextResponse.json({ error: "Unknown flow" }, { status: 400 });
    }

    // Create pending account record — the webhook will activate it after payment
    const { flow: dbFlow, plan_type } = FLOW_META[flow];
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

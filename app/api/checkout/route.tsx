import { stripe } from "@/lib/stripe-client";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { cohortSlug, cohortTitle } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["ideal", "card"],
      automatic_tax: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Fourth Trimester Program: ${cohortTitle} cohort deposit`,
              description:
                "Secure a spot for your whole family in APP's Fourth Trimester Program! This deposit will be deducted from your total program fee. It is 100% refundable if the cohort does not reach minimum capacity.",
              images: [
                `${process.env.NEXT_PUBLIC_DOMAIN}/static/images/programs/fourth-trimester-program/ftp-banner.png`,
              ],
            },
            unit_amount: 2500, // €25.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { cohortSlug },
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/programs/fourth-trimester`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

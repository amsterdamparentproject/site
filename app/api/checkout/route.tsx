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
              name: `${cohortTitle} cohort deposit`,
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
      custom_fields: [
        {
          key: "birthday_select",
          label: {
            type: "custom",
            custom: "Your baby's birth/due month",
          },
          type: "dropdown",
          dropdown: {
            options: [
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
            ],
          },
        },
        {
          key: "neighborhood_select",
          label: {
            type: "custom",
            custom: "Neighborhood",
          },
          type: "dropdown",
          dropdown: {
            options: [
              { label: "Centrum", value: "centrum" },
              { label: "West/Nieuw-West", value: "west" },
              { label: "Zuid", value: "zuid" },
              { label: "Oost", value: "oost" },
              { label: "Weesp", value: "weesp" },
              { label: "Noord", value: "noord" },
              { label: "Amstelveen/Buitenveldert", value: "amstelveen" },
            ],
          },
        },
        {
          key: "language_select",
          label: {
            type: "custom",
            custom: "Language",
          },
          type: "dropdown",
          dropdown: {
            options: [
              { label: "English", value: "english" },
              { label: "Dutch", value: "dutch" },
            ],
          },
        },
      ],
      mode: "payment",
      metadata: { cohortSlug },
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/programs/fourth-trimester/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/programs/fourth-trimester`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

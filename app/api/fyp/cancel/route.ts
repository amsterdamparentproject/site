import { createFirstYearClient } from "@/lib/supabase/server";
import { cancelFypAccount } from "@/lib/fyp/subscription";
import { NextRequest, NextResponse } from "next/server";

// Admin-only: cancels an FYP member's subscription (cancel_at_period_end).
//
// Auth: Bearer token via FYP_CANCEL_API_SECRET env var — mirrors the
// MATCHER_API_SECRET pattern already used on Postpartum Post's
// /api/run-matcher (a static per-route shared secret, checked with !==).
//
// Trigger, for now: manual. ProgramFAQ.tsx tells parents to email
// hello@amsterdamparentproject.nl to cancel; Alex calls this route with
// their email once the request comes in. No self-serve UI yet — the
// Hub's future /hub/account Cancel button (see fyp-hub-plan.md) will call
// the same cancelFypAccount() this route wraps, so wiring it up later is
// just adding a button, not new cancellation logic.
//
// Deposit-refund reminder: ProgramFAQ.tsx promises the €25 deposit is
// "fully refundable if you cancel during pregnancy." Nothing here (or in
// cancelFypAccount()) issues that refund automatically — it's a manual
// Stripe Dashboard action, and easy to miss since nothing else flags it.
// As a stopgap, the response includes a `note` whenever the account's flow
// is expecting_monthly or expecting_bundle (the two "still pregnant at
// signup" flows) — a flow-based heuristic, not a due-date check, so it
// fires even if the person has since given birth. See
// __claude__/fyp-improvements-plan.md § "Deposit refund on cancellation"
// for the real (due-date-aware, ideally automated) fix, deliberately
// deferred to after Hub.
//
// Request body: { email: string }
export async function POST(req: NextRequest) {
  const secret = process.env.FYP_CANCEL_API_SECRET;
  if (!secret) {
    console.error("[fyp cancel] FYP_CANCEL_API_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let email: string | undefined;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const supabase = createFirstYearClient();
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("account_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (memberError || !member) {
    return NextResponse.json(
      { error: `No FYP member found for email: ${email}` },
      { status: 404 },
    );
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("flow")
    .eq("id", member.account_id)
    .maybeSingle();

  try {
    await cancelFypAccount(member.account_id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[fyp cancel] failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.log("[fyp cancel] canceled account for", email);

  const isExpectingFlow =
    account?.flow === "expecting_monthly" ||
    account?.flow === "expecting_bundle";

  return NextResponse.json({
    canceled: true,
    ...(isExpectingFlow && {
      note: "This is an expecting-flow account (deposit-based). If the family is still pregnant, the €25 deposit is refundable per policy — issue that refund manually in the Stripe Dashboard; it is not handled automatically.",
    }),
  });
}

import { createFirstYearClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Monthly n8n sweep — finalizes bundle-plan cancellations only.
//
// Bundle accounts are a one-time payment with no Stripe subscription, so
// there's no webhook event to flip status "canceling" -> "canceled" when
// their term ends (unlike monthly plans, handled automatically by
// customer.subscription.deleted in app/api/webhooks/stripe/fyp/route.ts —
// see lib/fyp/subscription.ts for the full split). This route only ever
// touches plan_type: "bundle" rows — monthly cancellations never need it.
//
// Deliberately narrow: only touches accounts already in status "canceling".
// Never touches an "active" bundle account. Doesn't reopen the "no
// aging-out job" decision in __claude__/fyp-improvements-plan.md § Bundle
// term-end tracking — that decision is about not expiring bundle accounts
// that never asked to cancel (lifetime access is earned by the purchase);
// this only finalizes accounts that already explicitly canceled.
//
// Cutoff is "start of next month," not "today" — deliberately (fixed
// 2026-07-20, caught in review). This job only runs once a month, and
// bundle_expires_at is always the 1st of some month (addSixMonths in the
// FYP webhook always sets .setUTCDate(1)). Comparing against "today" would
// mean an account whose term ends on the 1st doesn't get finalized until
// the LAST day of that same month — a full extra month sitting in
// "canceling" while its term has already lapsed. That's exactly the
// window where a same-day PP comp-sync run (§ "Postpartum Post comp-sync
// job", which checks status IN ('active', 'canceling')) would hand out a
// free PP month nobody's entitled to. Comparing against the start of next
// month instead finalizes on the run immediately preceding the term's
// actual end — the same run that grants the member's last legitimately-
// earned comp — so by the time the account would next be read for
// comping, it's already "canceled".
//
// Scheduling: run on the same last-day-of-month n8n cadence as Postpartum
// Post's comp-sync job (fyp-improvements-plan.md § "Postpartum Post
// comp-sync job") and the existing WhatsApp removal list workflow — one
// n8n schedule trigger, one HTTP call per concern, matching the existing
// one-route-per-concern convention rather than a combined endpoint. The
// "start of next month" cutoff assumes this constraint holds (it's not
// enforced in code) — if this route were ever called mid-month instead,
// it would finalize accounts up to a month early.
//
// Auth: Bearer token via FYP_PROCESS_BUNDLE_CANCELLATIONS_API_SECRET (same
// per-route-secret convention as /api/fyp/cancel and PP's /api/run-matcher).
export async function POST(req: NextRequest) {
  const secret = process.env.FYP_PROCESS_BUNDLE_CANCELLATIONS_API_SECRET;
  if (!secret) {
    console.error(
      "[fyp process-bundle-cancellations] FYP_PROCESS_BUNDLE_CANCELLATIONS_API_SECRET is not set",
    );
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfNextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  )
    .toISOString()
    .slice(0, 10);
  const supabase = createFirstYearClient();

  const { data: processed, error } = await supabase
    .from("accounts")
    .update({ status: "canceled" })
    .eq("status", "canceling")
    .eq("plan_type", "bundle")
    .lte("bundle_expires_at", startOfNextMonth)
    .select("id");

  if (error) {
    console.error(
      "[fyp process-bundle-cancellations] update error:",
      JSON.stringify(error),
    );
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  const count = processed?.length ?? 0;
  console.log(
    `[fyp process-bundle-cancellations] processed ${count} bundle account(s)`,
  );
  return NextResponse.json({ processed: count });
}

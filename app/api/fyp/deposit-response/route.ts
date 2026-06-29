import { createFirstYearClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const DOMAIN = req.nextUrl.origin;
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  // Validate inputs
  if (!token || !action || !["transfer_fyp", "refund"].includes(action)) {
    return NextResponse.redirect(`${DOMAIN}/programs/first-year?error=invalid`);
  }

  const supabase = createFirstYearClient();

  // Look up the participant by token (row id)
  const { data: row, error } = await supabase
    .from("ftp_legacy")
    .select("id, email, cohort, status, expires_at")
    .eq("id", token)
    .single();

  if (error || !row) {
    console.error("[deposit-response] token not found:", token);
    return NextResponse.redirect(`${DOMAIN}/programs/first-year?error=invalid`);
  }

  // Check expiry
  if (new Date(row.expires_at) < new Date()) {
    console.warn("[deposit-response] token expired:", token);
    return NextResponse.redirect(`${DOMAIN}/programs/first-year?error=expired`);
  }

  // Check not already responded
  if (row.status !== "deposit") {
    return NextResponse.redirect(
      `${DOMAIN}/programs/first-year?deposit=${row.status}&already=true`,
    );
  }

  // Record the response
  const { error: updateError } = await supabase
    .from("ftp_legacy")
    .update({ status: action, responded_at: new Date().toISOString() })
    .eq("id", token);

  if (updateError) {
    console.error(
      "[deposit-response] update error:",
      JSON.stringify(updateError),
    );
    return NextResponse.redirect(`${DOMAIN}/programs/first-year?error=server`);
  }

  // Notify Alex via n8n (fire and forget — non-fatal if not configured)
  const notifyUrl = process.env.N8N_FYP_DEPOSIT_RESPONSE_WEBHOOK_URL;
  if (notifyUrl) {
    fetch(notifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        email: row.email,
        cohort: row.cohort,
        action,
      }),
    }).catch((err) =>
      console.error("[deposit-response] n8n notify failed:", err),
    );
  }

  const redirectDomain =
    action === "refund" ? "https://amsterdamparentproject.nl" : DOMAIN;

  return NextResponse.redirect(
    `${redirectDomain}/programs/first-year?deposit=${action}`,
  );
}

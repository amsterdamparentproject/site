"use server";

import { createFirstYearClient } from "@/lib/supabase/server";

// Drops a brand-new FYP signup straight into an authenticated /hub session
// from the welcome page, instead of sending them back through
// HubLoginForm's magic-link email flow. Reuses the same admin.generateLink
// SSO-hop mechanism as app/hub/account/actions.ts's
// getPostpartumPostSignInLink — see that file's docs for the full
// rationale.
//
// One real difference from the PP version: that one only ever runs for an
// email that's already signed in to Hub at least once (so its Supabase
// auth.users row already exists). This one runs for an email that, in the
// overwhelming majority of cases, has *never* signed in anywhere before —
// exactly the case where an earlier e2e investigation found
// admin.generateLink({type: "magiclink"}) can come back as a "signup"-type
// link instead for a brand-new address. That's handled gracefully rather
// than avoided: app/hub/auth/confirm/page.tsx's ConfirmHandler processes
// either link shape generically (token_hash+type via verifyOtp, or an
// access_token in the URL hash via onAuthStateChange), and falls back to
// showing the normal HubLoginForm if neither resolves — so a failure here
// just means a new member ends up doing the ordinary sign-in flow instead
// of a broken dead end. Worth a manual test with a fresh signup once
// deployed, since it wasn't exercised against a brand-new address before.
export async function getWelcomeHubSignInLink(
  stripeSessionId: string,
): Promise<{ success: true; url: string } | { success: false }> {
  const supabase = createFirstYearClient();

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  if (accountError || !account) {
    console.error(
      "[welcome] no account matched stripe_session_id:",
      stripeSessionId,
      accountError,
    );
    return { success: false };
  }

  // Oldest member on the account — the person who actually filled out
  // FYPJoinForm's own first-name/last-name/email fields (checkout only
  // ever inserts one member row at this point; see
  // app/api/checkout/fyp/route.ts).
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("email")
    .eq("account_id", account.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memberError || !member?.email) {
    console.error(
      "[welcome] no member found for account:",
      account.id,
      memberError,
    );
    return { success: false };
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_DOMAIN ?? "https://amsterdamparentproject.nl"}/hub/auth/confirm`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: member.email,
    options: { redirectTo },
  });

  if (error || !data.properties?.action_link) {
    console.error("[welcome] generateLink failed for", member.email, error);
    return { success: false };
  }

  return { success: true, url: data.properties.action_link };
}

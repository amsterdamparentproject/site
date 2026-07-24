import { createFirstYearClient } from "@/lib/supabase/server";

// Postpartum Post integration — "Activate" button backend, plus the
// deactivation call FYP's own cancellation webhook makes once access
// actually ends.
//
// Calls postpartum-post's own /api/fyp/activate and /api/fyp/deactivate
// routes directly — never touches PP's database or Stripe key from this
// codebase. See __claude__/fyp-improvements-plan.md § "Postpartum Post
// integration (backend)" / § 2a for why: mirrors how every existing n8n
// workflow in the PP repo already calls one of PP's own routes rather than
// PP's DB/Stripe key directly (e.g. /api/run-matcher, /api/send-optin-email).
//
// The returned postpartumpost_member_id is persisted on firstyear.members
// once and never re-derived from a live email join afterward — editing a
// parent's FYP profile email later has no effect on this link.

// Read fresh on every call rather than captured once at module load — a
// module-level constant would freeze in whatever value was set at import
// time (e.g. .env.test's own POSTPARTUM_POST_BASE_URL), making it impossible
// for tests to override per-case, and equally unable to pick up a changed
// value without a full process restart.
function postpartumPostBaseUrl(): string {
  return process.env.POSTPARTUM_POST_BASE_URL ?? "https://postpartumpost.com";
}

export type ActivateResult = {
  postpartumpostMemberId: string;
  created: boolean;
};

/**
 * Activates (or links to an existing) Postpartum Post membership for the
 * given firstyear.members row.
 *
 * Idempotent: if that member already has a postpartumpost_member_id
 * pinned, returns it immediately without calling postpartum-post again —
 * this is what makes it safe to call every time the Hub's "Activate"
 * button is clicked, not just the first time.
 *
 * Passes the linked account's plan_type and (for bundles) bundle_expires_at
 * across so PP can size its comp coupon correctly — § 2a's redesign: a
 * `forever` coupon for monthly plans (revoked later via deactivate, once
 * FYP access truly ends) or a coupon whose duration is computed from
 * bundle_expires_at for bundles (self-expiring, no revoke needed).
 */
export async function activatePostpartumPost(
  memberId: string,
): Promise<ActivateResult> {
  const supabase = createFirstYearClient();

  const { data: member, error } = await supabase
    .from("members")
    .select(
      "email, first_name, last_name, postpartumpost_member_id, account_id",
    )
    .eq("id", memberId)
    .single();

  if (error || !member) {
    throw new Error(
      `FYP member not found: ${memberId}${error ? ` (${error.code}: ${error.message})` : ""}`,
    );
  }

  if (member.postpartumpost_member_id) {
    return {
      postpartumpostMemberId: member.postpartumpost_member_id,
      created: false,
    };
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("plan_type, bundle_expires_at")
    .eq("id", member.account_id)
    .single();

  if (accountError || !account) {
    throw new Error(
      `FYP account not found for member ${memberId}${accountError ? ` (${accountError.code}: ${accountError.message})` : ""}`,
    );
  }

  const secret = process.env.FYP_ACTIVATE_API_SECRET;
  if (!secret) {
    throw new Error("FYP_ACTIVATE_API_SECRET is not set");
  }

  const res = await fetch(`${postpartumPostBaseUrl()}/api/fyp/activate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      planType: account.plan_type,
      ...(account.plan_type === "bundle" && {
        bundleExpiresAt: account.bundle_expires_at,
      }),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `postpartum-post /api/fyp/activate failed (${res.status}): ${body}`,
    );
  }

  const data = (await res.json()) as {
    postpartumpost_member_id: string;
    created: boolean;
  };

  const { error: updateError } = await supabase
    .from("members")
    .update({ postpartumpost_member_id: data.postpartumpost_member_id })
    .eq("id", memberId);

  if (updateError) {
    // The PP-side account already exists at this point — don't leave this silent.
    throw new Error(
      `Postpartum Post activated but failed to persist link for member ${memberId}: ${JSON.stringify(updateError)}`,
    );
  }

  return {
    postpartumpostMemberId: data.postpartumpost_member_id,
    created: data.created,
  };
}

/**
 * Deactivates a linked member's Postpartum Post comp — strips the discount
 * from their PP subscription. No-op if they were never linked
 * (postpartumpost_member_id never set).
 *
 * Called from app/api/webhooks/stripe/fyp/route.ts's
 * `customer.subscription.deleted` handler, once per linked member, when a
 * monthly FYP account's access has actually ended. Never needed for bundle
 * accounts — their PP comp is a fixed-duration coupon pinned to
 * bundle_expires_at at activation time, which self-expires without any
 * revoke call.
 */
export async function deactivatePostpartumPost(
  memberId: string,
): Promise<void> {
  const supabase = createFirstYearClient();

  const { data: member, error } = await supabase
    .from("members")
    .select("postpartumpost_member_id")
    .eq("id", memberId)
    .single();

  if (error || !member) {
    throw new Error(
      `FYP member not found: ${memberId}${error ? ` (${error.code}: ${error.message})` : ""}`,
    );
  }

  if (!member.postpartumpost_member_id) {
    return; // never activated on PP — nothing to deactivate
  }

  const secret = process.env.FYP_DEACTIVATE_API_SECRET;
  if (!secret) {
    throw new Error("FYP_DEACTIVATE_API_SECRET is not set");
  }

  const res = await fetch(`${postpartumPostBaseUrl()}/api/fyp/deactivate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      postpartumpostMemberId: member.postpartumpost_member_id,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `postpartum-post /api/fyp/deactivate failed (${res.status}): ${body}`,
    );
  }
}

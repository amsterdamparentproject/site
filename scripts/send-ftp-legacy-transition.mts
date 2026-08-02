/**
 * One-off script — FTP→FYP transition email for the legacy Fourth
 * Trimester Program deposit-holders. See
 * __claude__/fyp-onboarding-punchlist.md's Aug 7 row and "Key decisions on
 * record" section.
 *
 * Reads firstyear.ftp_legacy for cohort = '2026-09' OR status =
 * 'transfer_fyp' — confirmed with Alex 2026-08-01, should be 8 families.
 * Of those:
 *   - status IN ('deposit', 'transfer_fyp')  → 7 families, each gets a
 *     one-time Stripe promotion code (scoped to
 *     STRIPE_FYP_DEPOSIT_COUPON_ID, max_redemptions: 1) plus the
 *     transition email.
 *   - status = 'pending'                     → 1 family, transition email
 *     only, no promo code (registers at full price like any new signup).
 *
 * Dry-run by default — prints what it *would* do (no Stripe calls, no
 * emails sent). Pass --confirm to actually create promo codes and send.
 * Pass --only=<email> to target a single family (handy for testing one
 * real send before the full batch).
 *
 * Usage (mirrors update-fyp-guides.mjs's --test/--prod convention, but
 * target is selected via the env file passed to tsx --env-file, matching
 * send-preview-emails.mts's own pattern, so this file needs no env-parsing
 * logic of its own):
 *
 *   tsx --env-file=.env.local      scripts/send-ftp-legacy-transition.mts               # test, dry run
 *   tsx --env-file=.env.local      scripts/send-ftp-legacy-transition.mts --confirm      # test, for real
 *   tsx --env-file=.env.production scripts/send-ftp-legacy-transition.mts --confirm      # PROD, for real
 *
 * Or via the yarn scripts added to package.json:
 *   yarn ftp-legacy-transition:test [--confirm] [--only=<email>]
 *   yarn ftp-legacy-transition:prod [--confirm] [--only=<email>]
 *
 * No row is marked as "sent" anywhere — ftp_legacy's status column tracks
 * deposit outcome, not email-send state, and adding a new column for an
 * 8-row one-off send isn't worth a migration. Re-running with --confirm
 * will re-send and re-issue new promo codes for whichever rows still match
 * the filters above, so use --only to test and confirm the full family
 * list with Alex before the real batch run.
 */

// Reuses the app's own stripe client (lib/stripe-client.js) rather than
// instantiating a second one here — keeps apiVersion in exactly one place.
// It reads process.env.STRIPE_SECRET_KEY at import time, which tsx's
// --env-file already populates before any import runs, same as
// send-preview-emails.mts's reliance on RESEND_API_KEY being present by
// the time lib/emails/fyp-welcome.ts's getResend() is first called.
import { stripe } from "../lib/stripe-client.js";
import { createFirstYearClient } from "../lib/supabase/server.ts";
import { sendFtpLegacyTransitionEmail } from "../lib/emails/fyp-legacy-transition.ts";
import { splitName } from "../lib/fyp/split-name.ts";

const STATUSES_WITH_PROMO = ["deposit", "transfer_fyp"];

const args = process.argv.slice(2);
const confirm = args.includes("--confirm");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length).toLowerCase() : null;

if (!process.env.STRIPE_FYP_DEPOSIT_COUPON_ID) {
  console.error("STRIPE_FYP_DEPOSIT_COUPON_ID is not set.");
  process.exit(1);
}

interface LegacyRow {
  id: string;
  name: string;
  email: string;
  status: string;
  cohort: string | null;
}

async function main() {
  console.log(
    `Mode: ${confirm ? "LIVE — will create promo codes and send emails" : "DRY RUN — no Stripe/Resend calls"}${only ? ` (only: ${only})` : ""}`,
  );

  const supabase = createFirstYearClient();
  const { data, error } = await supabase
    .from("ftp_legacy")
    .select("id, name, email, status, cohort")
    .or(`cohort.eq.2026-09,status.eq.transfer_fyp`);

  if (error) {
    console.error("Failed to read firstyear.ftp_legacy:", error);
    process.exit(1);
  }

  let rows = (data ?? []) as LegacyRow[];
  if (only) {
    rows = rows.filter((r) => r.email.toLowerCase() === only);
    if (rows.length === 0) {
      console.error(`No ftp_legacy row found with email ${only}.`);
      process.exit(1);
    }
  }

  if (rows.length === 0) {
    console.log("No matching rows found — nothing to do.");
    return;
  }

  console.log(`Found ${rows.length} row(s):`);
  for (const row of rows) {
    const { firstName, lastName } = splitName(row.name);
    console.log(
      `  - firstName: ${firstName}, lastName: ${lastName}, email: ${row.email} (status: ${row.status}, cohort: ${row.cohort ?? "—"})`,
    );
  }

  const results: { email: string; ok: boolean; error?: string }[] = [];

  for (const row of rows) {
    // Only firstName is needed for the email's "Hi {firstName}," greeting
    // — the Register link now carries just row.id (see buildJoinUrl's
    // doc), not a split-out name, so lastName from here never reaches the
    // URL/logs/analytics. splitName() is still used above for the
    // listing print and here for firstName.
    const { firstName } = splitName(row.name);
    const needsPromo = STATUSES_WITH_PROMO.includes(row.status);

    try {
      let promoCode: string | undefined;

      if (needsPromo) {
        if (!confirm) {
          promoCode = "DRY-RUN-CODE";
        } else {
          const promotionCode = await stripe.promotionCodes.create({
            promotion: {
              type: "coupon",
              coupon: process.env.STRIPE_FYP_DEPOSIT_COUPON_ID!,
            },
            max_redemptions: 1,
            metadata: {
              source: "ftp_legacy_transition",
              ftp_legacy_id: row.id,
              email: row.email,
            },
          });
          promoCode = promotionCode.code;
        }
      }

      console.log(
        `${confirm ? "Sending" : "[dry run] would send"} to ${row.email}${promoCode ? ` with promo code ${promoCode}` : " (no promo — full price)"}`,
      );

      if (confirm) {
        await sendFtpLegacyTransitionEmail(
          row.email,
          firstName,
          row.id,
          promoCode,
        );
      }

      results.push({ email: row.email, ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`✗ ${row.email}:`, message);
      results.push({ email: row.email, ok: false, error: message });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  console.log(
    `\nDone: ${okCount}/${results.length} succeeded${confirm ? "" : " (dry run — nothing was actually sent or created)"}.`,
  );
  if (okCount < results.length) process.exit(1);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});

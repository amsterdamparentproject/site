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
 * Prints the eligible family list (firstName, lastName, email, status,
 * cohort) and asks for a Y/N confirmation before sending anything.
 *
 * Follows the same <test|prod> [--dry-run] convention as
 * postpartum-post's one-off scripts (e.g. send-meetup-reminder.mts), with
 * one adaptation: since a real send here also creates a real Stripe promo
 * code, `test`/`--dry-run` send exactly ONE email rather than redirecting
 * every eligible row — using a row actually associated with
 * amsterdamparentproject@gmail.com if one exists in the queried data,
 * otherwise the first real row with its email swapped out. No real promo
 * codes are created in either mode (promo-eligible rows render with the
 * "DRY-RUN-CODE" placeholder instead).
 *
 *   yarn ftp-legacy-transition:test              # .env.test — TEST Supabase project + test-mode Stripe. One email, forced to amsterdamparentproject@gmail.com.
 *   yarn ftp-legacy-transition:prod              # .env.production — sends to every real matching family, creates real Stripe promo codes.
 *   yarn ftp-legacy-transition:prod --dry-run    # same real prod query, but ONE email is sent to amsterdamparentproject@gmail.com and no real Stripe promo codes are created.
 *
 * --dry-run does NOT change which database is queried — that's controlled
 * solely by the <test|prod> positional arg. It only changes what happens
 * once you say Y: recipient redirection and promo-code creation. (Corrected
 * 2026-08-02 — an earlier version of this script made --dry-run itself
 * switch to the TEST project, which doesn't match how the rest of this
 * codebase's one-off scripts work.)
 *
 * Pass --only=<email>[,<email>...] to scope any of the above to specific
 * rows (handy for confirming one real family's content/eligibility before
 * the full batch, or for re-running just the rows that failed partway
 * through a batch without re-sending to ones that already succeeded).
 *
 * No row is marked as "sent" anywhere — ftp_legacy's status column tracks
 * deposit outcome, not email-send state, and adding a new column for an
 * 8-row one-off send isn't worth a migration. Re-running :prod will
 * re-send and re-issue new promo codes for whichever rows still match the
 * filters above, so use :prod --dry-run (and --only) to confirm the full
 * family list with Alex before the real batch run.
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { createInterface } from "readline/promises";
import { createFirstYearClient } from "../lib/supabase/server.ts";
import { sendFtpLegacyTransitionEmail } from "../lib/emails/fyp-legacy-transition.ts";
import { splitName } from "../lib/fyp/split-name.ts";

const STATUSES_WITH_PROMO = ["deposit", "transfer_fyp"];
const TEST_EMAIL = "amsterdamparentproject@gmail.com";

const env = process.argv[2];
if (env !== "test" && env !== "prod") {
  console.error(
    "Usage: tsx scripts/send-ftp-legacy-transition.mts <test|prod> [--dry-run] [--only=<email>[,<email>...]]",
  );
  process.exit(1);
}

const args = process.argv.slice(3);
const dryRun = args.includes("--dry-run");
const onlyArg = args.find((a) => a.startsWith("--only="));
// Comma-separated so a partial-failure re-run (e.g. after fixing a Stripe
// key permission mid-batch) can target exactly the rows still needing a
// send without re-touching ones that already succeeded.
const only = onlyArg
  ? onlyArg
      .slice("--only=".length)
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  : null;

if (env === "test") {
  // .env.test doesn't define RESEND_API_KEY — load .env.local first to
  // backfill it. Mirrors postpartum-post/scripts/send-meetup-reminder.mts's
  // own comment. Safe to layer: .env.local and .env.test point at the same
  // TEST Supabase project, so this can't accidentally pull in prod.
  dotenv.config({ path: resolve(process.cwd(), ".env.local") });
}
const envFile = env === "prod" ? ".env.production" : ".env.test";
dotenv.config({ path: resolve(process.cwd(), envFile) });

if (env === "prod") {
  // .env.production never defines these two (see lib/supabase/server.ts)
  // — but if they're already sitting in the calling shell (e.g. left over
  // from an earlier .env.local-sourcing session in the same terminal),
  // createFirstYearClient()'s `??` fallback would silently prefer them
  // over prod. Diagnosed 2026-08-01 when a live run only turned up 1
  // (real, but TEST-project) row instead of the ~8 real families.
  delete process.env.NEXT_PUBLIC_TEST_SUPABASE_URL;
  delete process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
  // Self-contained rather than relying on an external
  // `cross-env NODE_ENV=production` wrapper — controls
  // lib/emails/base.ts's subjectPrefix(), so :prod (with or without
  // --dry-run) never carries the "TEST:" prefix, matching that this is a
  // genuine prod run either way.
  process.env.NODE_ENV = "production";
}

console.log(`Env file: ${envFile}`);
console.log(
  `Target Supabase project: ${process.env.NEXT_PUBLIC_TEST_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL}`,
);

// Dynamic import: lib/stripe-client.js reads process.env.STRIPE_SECRET_KEY
// at module-evaluation time and throws if it's missing, so it must load
// only after the dotenv.config() calls above have run.
const { stripe } = await import("../lib/stripe-client.js");

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

/** Creates a real, single-redemption Stripe promo code, or returns the
 * dry-run placeholder. */
async function resolvePromoCode(row: LegacyRow): Promise<string | undefined> {
  if (!STATUSES_WITH_PROMO.includes(row.status)) return undefined;
  if (dryRun) return "DRY-RUN-CODE";

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
  return promotionCode.code;
}

async function main() {
  // `test` mode and --dry-run both force every send to TEST_EMAIL —
  // belt-and-suspenders regardless of what's actually in the queried data,
  // mirroring send-meetup-reminder.mts's own `env === "test" || dryRun`
  // override.
  const redirectSends = env === "test" || dryRun;

  console.log(
    `Mode: ${env.toUpperCase()}${dryRun ? " --dry-run" : ""} — ${
      redirectSends
        ? `sends ONE email to ${TEST_EMAIL}, no real promo codes created`
        : "will create real promo codes and send to real families"
    }${only ? ` (only: ${only.join(", ")})` : ""}`,
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
    rows = rows.filter((r) => only.includes(r.email.toLowerCase()));
    const missing = only.filter(
      (e) => !rows.some((r) => r.email.toLowerCase() === e),
    );
    if (missing.length > 0) {
      console.error(`No ftp_legacy row found for: ${missing.join(", ")}`);
      process.exit(1);
    }
  }

  if (rows.length === 0) {
    console.log("No matching rows found — nothing to do.");
    return;
  }

  // -------------------------------------------------------------------------
  // Show who's eligible and get explicit confirmation before sending anything.
  // -------------------------------------------------------------------------
  console.log(`\nFound ${rows.length} row(s):\n`);
  for (const row of rows) {
    const { firstName, lastName } = splitName(row.name);
    console.log(
      `  - firstName: ${firstName}, lastName: ${lastName}, email: ${row.email} (status: ${row.status}, cohort: ${row.cohort ?? "—"})`,
    );
  }

  // redirectSends only ever sends ONE email — using a row actually
  // associated with TEST_EMAIL if one exists in the queried data,
  // otherwise the first real row with its email swapped out. This is
  // deliberately lighter than redirecting every eligible row's send: the
  // point is a quick, safe read of the actual rendered content (real
  // name/status/promo-eligibility), not a full-volume rehearsal.
  const rowToSend = redirectSends
    ? (rows.find((r) => r.email.toLowerCase() === TEST_EMAIL) ?? rows[0])
    : null;

  const confirmPrompt = redirectSends
    ? `\nSend ONE email (using ${rowToSend!.email}'s real data) to ${TEST_EMAIL}? No real families will be emailed, no real Stripe codes created. (Y/N) `
    : `\nSend the transition email to these ${rows.length} real famil${rows.length === 1 ? "y" : "ies"}? Real Stripe promo codes will be created for eligible ones. (Y/N) `;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(confirmPrompt);
  rl.close();

  if (answer.trim().toLowerCase() !== "y") {
    console.log("Aborted — no emails sent.");
    process.exit(0);
  }

  const rowsToSend = redirectSends ? [rowToSend!] : rows;

  console.log(
    `\n${redirectSends ? `Sending 1 email to ${TEST_EMAIL}...` : `Sending to ${rowsToSend.length} real famil${rowsToSend.length === 1 ? "y" : "ies"}...`}`,
  );

  const results: { email: string; ok: boolean; error?: string }[] = [];

  for (const row of rowsToSend) {
    // Only firstName is needed for the email's "Hi {firstName}," greeting
    // — the Register link now carries just row.id (see buildJoinUrl's
    // doc), not a split-out name, so lastName from here never reaches the
    // URL/logs/analytics.
    const { firstName } = splitName(row.name);
    const recipient = redirectSends ? TEST_EMAIL : row.email;

    try {
      const promoCode = await resolvePromoCode(row);
      await sendFtpLegacyTransitionEmail(
        recipient,
        firstName,
        row.id,
        promoCode,
      );
      console.log(
        `✓ ${row.email}${redirectSends ? ` → sent to ${TEST_EMAIL}` : ""}${promoCode ? ` (promo code ${promoCode})` : " (no promo — full price)"}`,
      );
      results.push({ email: row.email, ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`✗ ${row.email}:`, message);
      results.push({ email: row.email, ok: false, error: message });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  console.log(`\nDone: ${okCount}/${results.length} succeeded.`);
  if (okCount < results.length) process.exit(1);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});

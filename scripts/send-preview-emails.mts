/**
 * Preview script — sends transactional emails to a given address.
 * Usage: yarn emails:preview [email] [name]
 * Default recipient: amsterdamparentproject@gmail.com
 * Pass an email name to send just that one (e.g. yarn emails:preview fyp-welcome)
 * Pass an email address first if you also want to filter (e.g. yarn emails:preview you@example.com fyp-welcome)
 *
 * Mirrors postpartum-post/scripts/send-preview-emails.mts — same pattern,
 * one entry per function in lib/emails/.
 */

import { sendFypWelcomeEmail } from "../lib/emails/fyp-welcome.ts";
import {
  sendFtpLegacyTransitionEmail,
  buildJoinUrl,
} from "../lib/emails/fyp-legacy-transition.ts";
import { createFirstYearClient } from "../lib/supabase/server.ts";

const args = process.argv.slice(2);
const isEmail = (s: string) => s.includes("@");

const TO = isEmail(args[0] ?? "")
  ? args[0]
  : "amsterdamparentproject@gmail.com";
const filter = isEmail(args[0] ?? "") ? args[1] : args[0];

const results: { name: string; ok: boolean; error?: string }[] = [];

async function send(name: string, fn: () => Promise<void>) {
  if (filter && name !== filter) return;
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    results.push({ name, ok: false, error: message });
    console.error(`✗ ${name}:`, message);
  }
}

await send("fyp-welcome", () =>
  sendFypWelcomeEmail(
    TO,
    "Alex",
    "https://amsterdamparentproject.nl/hub",
    "6-month bundle",
  ),
);

// Two variants of the same template — one with a promo code (families
// crediting a deposit), one without (full-price). Separate names so a
// preview run only ever sends one email, not both — each real send counts
// against Resend's daily test-account limit.
//
// The Register link's ?legacyId= needs a real firstyear.ftp_legacy row id
// to demonstrate real prefill behavior (name/email/due date) — it carries
// no PII itself (see buildJoinUrl's doc: an earlier version put firstName/
// lastName/email directly in the URL, which Alex flagged as a privacy
// problem), so there's nothing meaningful to fabricate locally. Looks up
// whatever row happens to exist against the target env's DB (test or prod,
// whichever .env file this script is run with); falls back to a random,
// deliberately non-existent uuid — which the page resolves to a blank,
// unprefilled form (see app/programs/first-year/page.tsx's
// resolveLegacyPrefill) rather than an error — if the table is empty or
// unreachable, so the send/preview itself never fails on this.
async function getPreviewLegacyId(): Promise<{
  id: string;
  isRealRow: boolean;
}> {
  try {
    const supabase = createFirstYearClient();
    const { data } = await supabase
      .from("ftp_legacy")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (data?.id) return { id: data.id, isRealRow: true };
  } catch {
    // DB unreachable — fall through to the placeholder below.
  }
  return { id: "00000000-0000-0000-0000-000000000000", isRealRow: false };
}

const previewLegacy = await getPreviewLegacyId();
console.log(
  `\nfyp-legacy-transition Register link (both variants): ${buildJoinUrl(previewLegacy.id)}` +
    (previewLegacy.isRealRow
      ? " — resolves to a real ftp_legacy row, click it to confirm real prefill."
      : " — no ftp_legacy row found/reachable, this id won't resolve to anything; the form will just come up blank, which is still correct behavior, just not a prefill demo.") +
    "\n",
);

await send("fyp-legacy-transition-promo", () =>
  sendFtpLegacyTransitionEmail(TO, "Alex", previewLegacy.id, "APPWELCOME25"),
);
await send("fyp-legacy-transition-full-price", () =>
  sendFtpLegacyTransitionEmail(TO, "Alex", previewLegacy.id, undefined),
);

if (results.length === 0 && filter) {
  console.error(
    `Unknown email name: "${filter}". Valid names: fyp-welcome, fyp-legacy-transition-promo, fyp-legacy-transition-full-price`,
  );
  process.exit(1);
}

console.log(
  `\nDone: ${results.filter((r) => r.ok).length} sent, ${results.filter((r) => !r.ok).length} failed`,
);

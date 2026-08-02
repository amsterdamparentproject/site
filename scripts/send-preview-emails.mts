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
import { sendFtpLegacyTransitionEmail } from "../lib/emails/fyp-legacy-transition.ts";

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
    "First Year Program — 6-month bundle",
  ),
);

// Two variants of the same template — one with a promo code (families
// crediting a deposit), one without (full-price). Separate names so a
// preview run only ever sends one email, not both — each real send counts
// against Resend's daily test-account limit.
await send("fyp-legacy-transition-promo", () =>
  sendFtpLegacyTransitionEmail(TO, "Alex", "APPWELCOME25"),
);
await send("fyp-legacy-transition-full-price", () =>
  sendFtpLegacyTransitionEmail(TO, "Alex", undefined),
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

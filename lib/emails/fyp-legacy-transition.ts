import {
  FROM,
  getResend,
  bodySection,
  ctaButton,
  emailHeader,
  baseEmail,
  subjectPrefix,
  BRAND,
} from "./base";

// One-off FTP→FYP transition email — sent to the 8 legacy Fourth Trimester
// Program September-cohort deposit-holders (firstyear.ftp_legacy, cohort =
// '2026-09' OR status = 'transfer_fyp' — confirmed with Alex 2026-08-01).
// See __claude__/fyp-onboarding-punchlist.md's Aug 7 row and "Key decisions
// on record" for the coupon/promo-code approach this mirrors, and
// scripts/send-ftp-legacy-transition.mts for exactly who gets a promo code.
//
// Not part of the general Resend infra (unlike fyp-welcome.ts) — this is a
// single-send script for a fixed, one-time family list, run manually via
// scripts/send-ftp-legacy-transition.mts. Structure otherwise copied
// straight from fyp-welcome.ts (same emailHeader()/bodySection()/ctaButton()
// composition), since both are FYP-branded transactional mail.
//
// promoCode is undefined for families with no deposit credit to apply — the
// copy below branches on its presence rather than taking two separate
// template functions, since everything else about the email is identical.

const JOIN_URL = "https://amsterdamparentproject.nl/programs/first-year#join";

// Bulleted feature list — plain <ul>/<li> with every style spelled out
// inline (margin/padding/list-style reset), since emailHead()'s global
// reset only covers p/span/h1-h6, not lists. Shared by both variants.
const FEATURES = [
  "<b>6 months</b> of support instead of 3",
  "<b>1:1 monthly parent matching</b> alongside group support for deeper connections",
  "Same <b>base curriculum, plus a sleep Q&amp;A</b> and two new socials",
  "A personalized <b>First Year Hub</b>, where you can sign up for live events, find resources, manage family access, and more.",
  "<b>Support while you wait</b>: 1:1 matching and the Hub right now, after sign up",
  "<b>Lower monthly rate</b>: €68/month — cheaper per month than FTP's old €295 one-time fee for 3 months, or even lower (~€64/month) if you pay for the 6-month bundle upfront",
];

// Rendered inline inside the shared "opening" bodySection() below (rather
// than its own bodySection() call) — bodySection() wraps every call in its
// own 26px padding on all sides, so a standalone section just for the list
// stacked an extra ~26px of empty space above and below it. Folding
// everything (greeting, cohort update, feature list, excitement line) into
// one section keeps it as a single continuous block of copy, matching how
// it reads.
const featureListMarkup = `
                                      <ul style="margin:0;padding:0 0 0 20px;text-align:left;color:${BRAND.softGreen}">
                                        ${FEATURES.map(
                                          (f) =>
                                            `<li style="font-size:14px;line-height:1.5;padding-bottom:6px">${f}</li>`,
                                        ).join(
                                          "\n                                        ",
                                        )}
                                      </ul>`;

export function legacyTransitionHtml(
  firstName: string,
  promoCode: string | undefined,
): string {
  // Everything through "Next steps" lives in one bodySection() call —
  // splitting the feature list or the next-steps line into their own
  // bodySection() calls stacked an extra 26px-per-side gap on top of the
  // normal paragraph spacing, which read as a much bigger jump than the
  // rest of the copy's paragraph breaks. Folding it all in means every gap
  // in this block is controlled by the same 16px padding-bottom used
  // between every other paragraph.
  const promoNextSteps = `
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>❗️👉🏼 </span><span style="font-weight:700;text-decoration:underline">Next steps: Register by 5 August</span><span> using the promo code (your €25 deposit credited) via the button below:</span>
                                    </td></tr>`;

  const noPromoNextSteps = `
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 16px;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>We'd love to have your family join for September! You can sign up for the monthly plan or the 6-month bundle whenever works best for you.</span>
                                    </td></tr>
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>❗️👉🏼 </span><span style="font-weight:700;text-decoration:underline">Next steps: Register by 5 August</span><span> via the button below to join this month's 1:1 parent match and start the live program in September.</span>
                                    </td></tr>`;

  // Deposit-paying families (promo variant) vs. interest-only families (no
  // promo, status='pending' — never paid a deposit, so "You put down a
  // deposit" would be false for them).
  const cohortUpdate = promoCode
    ? `You put down a deposit for APP's Fourth Trimester Program September cohort, and we have an update — 8 families are already interested, enough to go ahead!`
    : `You indicated interest in APP's Fourth Trimester Program September cohort, and we have an update — we have 7 other families also interested, enough to go ahead!`;

  const opening = bodySection(`
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 16px;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>Hi ${firstName},</span>
                                    </td></tr>
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 16px;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>${cohortUpdate} </span><span style="font-weight:700">We're excited to run our newborn family support program this September</span><span> with Miriam, Danielle, and myself as your facilitators.</span>
                                    </td></tr>
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 16px;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>Over the last few months, Fourth Trimester Program has evolved into the </span><span style="font-weight:700">First Year Program</span><span> 🌱 — and we couldn't be more proud of how we've worked with past cohorts to make the experience even better. Here's what changed (all additive!):</span>
                                    </td></tr>
                                    <tr><td dir="ltr" style="padding:0 0 16px">${featureListMarkup}
                                    </td></tr>
                                    ${promoCode ? promoNextSteps : noPromoNextSteps}`);

  // Deliberately not a bodySection() call — bodySection() bakes in 26px of
  // padding on every side, which (stacked right after ctaButton()'s own
  // 16px bottom margin) read as an awkward gap between the button and the
  // code sitting right below it. This mirrors bodySection()'s width
  // constraint (552px, centered) so it still lines up with the rest of the
  // copy, but with much tighter vertical padding since it's meant to read
  // as part of the same visual unit as the button above it.
  const promoBlock = promoCode
    ? `
                  <tr><td style="padding:0 24px 16px">
                    <table border="0" cellpadding="0" cellspacing="0" align="center"
                      style="display:table;width:100%;max-width:100%;table-layout:fixed;margin:0 auto">
                      <tbody><tr><td>
                        <table border="0" cellpadding="0" cellspacing="0"
                          style="width:100%;max-width:552px;table-layout:fixed;margin:0 auto">
                          <tbody><tr><td style="width:100%;box-sizing:border-box;vertical-align:top">
                            <table border="0" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed">
                              <tbody><tr><td style="padding:4px 26px">
                                <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                                  style="color:#000;font-size:16px;line-height:1.4;text-align:left;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;word-wrap:break-word;word-break:break-word">
                                  <tbody>
                                    <tr><td dir="ltr" align="center" style="font-size:16px;text-align:center;padding:0 0 4px;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>Your promo code:</span>
                                    </td></tr>
                                    <tr><td dir="ltr" align="center" style="font-size:24px;font-weight:700;text-align:center;letter-spacing:0.08em;padding:0 0 4px;line-height:1.3">
                                      <span>${promoCode}</span>
                                    </td></tr>
                                    <tr><td dir="ltr" align="center" style="font-size:13px;color:#555;text-align:center;line-height:1.4">
                                      <span>Enter under "Add promotion code" at checkout.</span>
                                    </td></tr>
                                  </tbody>
                                </table>
                              </td></tr>
                            </table>
                          </td></tr>
                        </table>
                      </td></tr>
                    </table>
                  </td></tr>`
    : "";

  // Merged into one bodySection() (same reasoning as opening's feature list
  // and the promo code block above) — kept separate this used to leave a
  // ~52px stacked gap between the bonus paragraph and the note.
  const bonusAndNote = bodySection(`
                                    <tr><td dir="ltr" style="font-size:13px;color:#555;text-align:left;padding:0 0 16px;line-height:1.4">
                                      <span style="font-weight:700">Why 5 August?</span>
                                      <span> If you sign up by then, you'll have time to join our 1:1 parent match this month! Activate your Postpartum Post subscription from the Hub by the 5th to be included in this month's match round. If you need more time, please take it — there will be more matches to come.</span>
                                    </td></tr>
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>Any questions at all — just reply to this email, we're happy to help.</span>
                                    </td></tr>`);

  return baseEmail(
    emailHeader() +
      opening +
      ctaButton("Register for First Year Program", JOIN_URL) +
      promoBlock +
      bonusAndNote,
  );
}

export async function sendFtpLegacyTransitionEmail(
  email: string,
  firstName: string,
  promoCode: string | undefined,
) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${subjectPrefix()}It's time to register for the September cohort`,
    html: legacyTransitionHtml(firstName, promoCode),
  });
  if (error) {
    console.error("[resend] sendFtpLegacyTransitionEmail error:", error);
    throw error;
  }
}

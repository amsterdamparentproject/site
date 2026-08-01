import {
  FROM,
  FYP_LOGO,
  getResend,
  bodySection,
  ctaButton,
  emailHeader,
  baseEmail,
  subjectPrefix,
} from "./base";

// Routine First Year Program welcome email — sent once per checkout
// completion (see app/api/webhooks/stripe/fyp/route.ts), same trigger point
// and non-fatal try/catch pattern as Postpartum Post's
// lib/emails/welcome.ts + sendWelcomeEmail call in its own Stripe webhook.
//
// hubLink is a plain /hub URL, not a magic-link sign-in URL (changed
// 2026-08-01) — it used to reuse generateMagicLinkWithRetry, the same
// mechanism app/programs/first-year/welcome/actions.ts's AutoHubRedirect
// uses for the in-browser post-checkout redirect, but both call sites mint
// a link for the same email around the same time and Supabase only keeps
// one such token live per user, so the second call silently invalidated
// the first — the email's link could be dead on arrival. Reverted to a
// plain link (family signs in normally via HubLoginForm) until that
// collision is actually resolved — see the webhook's own comment.
//
// Copy rewritten 2026-07-31 per Alex — reuses PP's welcome.ts structure
// (emailHeader() + bodySection blocks + a single ctaButton, composed into
// `content` explicitly rather than baked into baseEmail() — see base.ts's
// emailHeader doc) with FYP-specific copy. Note: Alex's draft said 'under
// the "profile" tab' — the Hub's tab is actually labeled "Account" (see
// app/hub/account/HubAccountTabNav.tsx), so that's used here instead.
//
// Header logo added 2026-07-31 (FYP_LOGO, public/email-images/fyp-logo.png)
// — Alex's own FYP wordmark, cropped/resized from her source file.

export function welcomeHtml(
  firstName: string,
  hubLink: string,
  planLabel: string,
): string {
  const intro = bodySection(`
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 16px;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span style="font-weight:700">Welcome, ${firstName}!</span>
                                      <span> We're so glad your family is joining the First Year Program — when our community grows, our heart grows ❤️</span>
                                    </td></tr>
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span>You've signed up your family for the </span><span style="font-weight:700">${planLabel}</span><span> plan, which gives you access to the First Year Hub. There you'll find the WhatsApp group, events calendar, resource guides, and more. You can also activate your Postpartum Post subscription — 1:1 parent matching — right now from the Hub.</span>
                                    </td></tr>`);

  const note = bodySection(`
                                    <tr><td dir="ltr" style="font-size:16px;text-align:left;line-height:1.4;mso-line-height-alt:22.4px">
                                      <span style="font-weight:700">Good to know:</span>
                                      <span> Your subscription is for your <b>whole family</b>, partners included! Add them under the "Account" tab in the Hub so they can access everything they need, too.</span>
                                    </td></tr>`);

  return baseEmail(
    emailHeader() +
      intro +
      ctaButton("Go to your First Year Hub", hubLink) +
      note,
    `<link rel="preload" as="image" href="${FYP_LOGO}">`,
  );
}

export async function sendFypWelcomeEmail(
  email: string,
  firstName: string,
  hubLink: string,
  planLabel: string,
) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${subjectPrefix()}Welcome to the First Year Program! ❤️`,
    html: welcomeHtml(firstName, hubLink, planLabel),
  });
  if (error) {
    console.error("[resend] sendFypWelcomeEmail error:", error);
    throw error;
  }
}

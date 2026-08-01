/**
 * Shared email constants, helpers, and layout components.
 * All transactional emails are built from these primitives.
 *
 * Reuses postpartum-post/lib/emails/base.ts's structure verbatim — the
 * bulletproof (Outlook/mso-safe) nested-table architecture, the
 * bodySection/ctaButton/emailFooter helpers, all copied over rather than
 * reinvented, per Alex's ask (2026-07-31) to reuse PP's template rather
 * than site's original lighter-weight one. Only the branding differs:
 * FROM/colors/copy are Amsterdam Parent Project's own (not "Postpartum
 * Post"), since site's welcome email is sent from its own identity, not
 * PP's. The Instagram/email footer icons are still hosted on
 * postpartumpost.com/email-images/* rather than duplicated onto site's own
 * domain — same reuse call already made for the shared Hub/PP sign-in
 * template (see project-fyp-hub-auth memory's "Branding conflict" entry).
 * Header banner (2026-07-31) is the actual FYP logo (see FYP_LOGO,
 * public/email-images/fyp-logo.png) — PP's own banner is a "postpartum
 * post" wordmark PNG, wrong brand for FYP mail, so this is a distinct
 * asset rather than a reuse of PP's.
 */

import { getResend } from "@/lib/resend";

export const FROM =
  "Amsterdam Parent Project <hello@amsterdamparentproject.nl>";
export const SITE_URL =
  process.env.NEXT_PUBLIC_DOMAIN ?? "https://amsterdamparentproject.nl";
// Reused from Postpartum Post's own hosted assets (see file doc) — site has
// no icon assets of its own uploaded.
export const ASSETS_URL = "https://postpartumpost.com";
export const INSTAGRAM_ICON = `${ASSETS_URL}/email-images/instagram.png`;
export const EMAIL_ICON = `${ASSETS_URL}/email-images/email.png`;
// site's own hosted email images (public/email-images/*) — hardcoded to
// production, deliberately NOT built from SITE_URL: SITE_URL follows
// NEXT_PUBLIC_DOMAIN, which is localhost:3000 in .env.local, and localhost
// image URLs are unreachable by real email clients (same reasoning as PP's
// ASSETS_URL comment). fyp-logo.png cropped/resized to a 2x-ready 680x221
// PNG (transparent bg) from Alex's source logo, 2026-07-31.
export const SITE_ASSETS_URL = "https://amsterdamparentproject.nl";
export const FYP_LOGO = `${SITE_ASSETS_URL}/email-images/fyp-logo.png`;

// Hex equivalents of the brand tokens in css/tailwind.css's source comment
// (goldenrod #E1AD37, charcoal #303633, soft-green #3F6455, sand #D7C3AC,
// cream #F7EEE6) — email clients can't read CSS custom properties/oklch(),
// so these are spelled out directly wherever color is needed below.
export const BRAND = {
  cream: "#F7EEE6",
  goldenrod: "#E1AD37",
  charcoal: "#303633",
  softGreen: "#3F6455",
  sand: "#D7C3AC",
};

/** Returns "TEST: " when running locally, empty string in production. */
export function subjectPrefix(): string {
  return process.env.NODE_ENV !== "production" ? "TEST: " : "";
}

export { getResend };

// ---------------------------------------------------------------------------
// Base template helpers
// ---------------------------------------------------------------------------

/** <head> block shared by all emails — copied from PP's base.ts verbatim (brand-agnostic). */
export function emailHead(extraPreloads = ""): string {
  return `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${extraPreloads}
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    body{margin:0;padding:0}
    table{mso-table-lspace:0;mso-table-rspace:0}
    p,span,h1,h2,h3,h4,h5,h6{margin:0;padding:0}
    p{line-height:inherit}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}
    #MessageViewBody a{color:inherit;text-decoration:none}
    img+div{display:none}
    .ecw{width:100%!important;min-width:0!important}
  </style>
  <!--[if mso]><div>
    <noscript>
      <xml>
        <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
          <w:DontUseAdvancedTypographyReadingMail/>
        </w:WordDocument>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
  </div><![endif]-->
  <!--[if !mso]><!-->
  <style>
    @media (max-width:100px) {
      .l3-c0,.l3-c1{display:block!important;width:100%!important}
      .l3-s0{display:block!important;width:auto!important;height:3px;font-size:0}
    }
  </style>
  <!--<![endif]-->
</head>`;
}

/**
 * Brand header — FYP logo image (see FYP_LOGO) on a cream field, same
 * bulletproof single-image row PP uses for its own header banner/welcome
 * illustration (MSO table-width fallback + intrinsic width/height +
 * display:block so it can't be treated as a link-preview thumbnail).
 * Not auto-inserted by baseEmail() — each email composes it into `content`
 * explicitly (mirrors PP's own emails, e.g. auto-pause.ts's
 * `emailHeader() + bodySection(...) + ctaButton(...)`), so a future
 * non-FYP email in this file isn't stuck with FYP's logo.
 */
export function emailHeader(): string {
  return `
                  <!-- Brand header -->
                  <tr><td style="background-color:${BRAND.cream};padding:24px 24px">
                    <table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr>
                      <td align="center">
                        <!--[if mso]><table cellpadding="0" cellspacing="0" border="0" width="340" style="width:340px"><tbody><tr><td><![endif]-->
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:340px"><tbody><tr>
                          <td style="width:100%">
                            <img src="${FYP_LOGO}" width="340" height="111"
                              alt="First Year Program"
                              style="display:block;width:100%;height:auto;max-width:100%">
                          </td>
                        </tr></tbody></table>
                        <!--[if mso]></td></tr></tbody></table><![endif]-->
                      </td>
                    </tr></tbody></table>
                  </td></tr>`;
}

/** Shared footer: signature, org callout, social icons, copyright — mirrors PP's structure. */
export function emailFooter(): string {
  return `
                  <!-- Signature -->
                  <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 48px 16px;line-height:1.4;mso-line-height-alt:22.4px">
                    Warmly,
                  </td></tr>
                  <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 48px 24px;line-height:1.4;mso-line-height-alt:22.4px">
                    Alex from Amsterdam Parent Project
                  </td></tr>
                  <tr><td style="padding:0 36px 16px">
                    <table border="0" cellpadding="0" cellspacing="0" align="center"
                      style="display:table;width:100%;max-width:100%;table-layout:fixed;margin:0 auto;background-color:${BRAND.cream};border-radius:15px">
                      <tbody><tr><td style="padding:36px">
                        <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                          style="color:#000;font-size:16px;line-height:1.4;text-align:left;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;word-wrap:break-word;word-break:break-word">
                          <tbody>
                            <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 16px;line-height:1.4;mso-line-height-alt:22.4px">
                              <span style="font-weight:700">Amsterdam Parent Project</span> is a <a href="https://amsterdamparentproject.nl/about" target="_blank" rel="noopener noreferrer" style="color:#000000;text-decoration:underline;">nonprofit community organization</a> helping parents with babies and toddlers thrive in Amsterdam.
                            </td></tr>
                            <tr><td dir="ltr" style="font-size:16px;text-align:left;line-height:1.4;mso-line-height-alt:22.4px">
                              We'd love to hear from you — send us any questions, concerns, or feedback via <a href="mailto:hello@amsterdamparentproject.nl" style="color:#000000;text-decoration:underline;">hello@amsterdamparentproject.nl</a>.
                            </td></tr>
                          </tbody>
                        </table>
                      </td></tr>
                    </table>
                  </td></tr>

                  <!-- Social icons -->
                  <tr><td style="padding:0 24px 16px">
                    <table border="0" cellpadding="0" cellspacing="0" align="center"
                      style="display:table;width:100%;max-width:100%;table-layout:fixed;margin:0 auto">
                      <tbody><tr><td style="text-align:center">
                        <table border="0" cellpadding="0" cellspacing="0"
                          style="width:100%;max-width:171px;table-layout:fixed;margin:0 auto">
                          <tbody><tr>
                            <td width="50.62%" class="l3-c0" style="width:50.62%;box-sizing:border-box;vertical-align:middle">
                              <table border="0" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed">
                                <tbody><tr><td style="padding:10px">
                                  <a href="http://amsterdamparentproject.nl/instagram" target="_blank" rel="noopener nofollow"
                                    style="display:block;text-decoration:none;border:none;outline:none" aria-label="Instagram">
                                    <table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr>
                                      <td align="center">
                                        <!--[if mso]><table cellpadding="0" cellspacing="0" border="0" width="24" style="width:24px"><tbody><tr><td><![endif]-->
                                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:24px"><tbody><tr>
                                          <td style="width:100%">
                                            <img src="${INSTAGRAM_ICON}" width="24" height="24"
                                              alt="Instagram" style="display:block;width:100%;height:auto;max-width:100%">
                                          </td>
                                        </tr></tbody></table>
                                        <!--[if mso]></td></tr></tbody></table><![endif]-->
                                      </td>
                                    </tr></tbody></table>
                                  </a>
                                </td></tr>
                              </table>
                            </td>
                            <td width="3" class="l3-s0" style="width:3px;box-sizing:border-box;font-size:0">&nbsp;</td>
                            <td width="47.62%" class="l3-c1" style="width:47.62%;box-sizing:border-box;vertical-align:middle">
                              <table border="0" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed">
                                <tbody><tr><td style="padding:10px">
                                  <a href="mailto:hello@amsterdamparentproject.nl" target="_blank" rel="noopener nofollow"
                                    style="display:block;text-decoration:none;border:none;outline:none" aria-label="Email us">
                                    <table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr>
                                      <td align="center">
                                        <!--[if mso]><table cellpadding="0" cellspacing="0" border="0" width="23" style="width:23px"><tbody><tr><td><![endif]-->
                                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:23px"><tbody><tr>
                                          <td style="width:100%">
                                            <img src="${EMAIL_ICON}" width="23" height="18"
                                              alt="Email" style="display:block;width:100%;height:auto;max-width:100%">
                                          </td>
                                        </tr></tbody></table>
                                        <!--[if mso]></td></tr></tbody></table><![endif]-->
                                      </td>
                                    </tr></tbody></table>
                                  </a>
                                </td></tr>
                              </table>
                            </td>
                          </tr></tbody>
                        </table>
                      </td></tr>
                    </table>
                  </td></tr>

                  <!-- Copyright -->
                  <tr><td dir="ltr" style="font-size:13.3px;text-align:center;padding:0 24px 24px;line-height:18.2px;mso-line-height-alt:18.2px">
                    &copy; 2026 Amsterdam Parent Project. All rights reserved.
                    You're receiving this email because you joined the First Year Program.
                    &middot; <a href="${SITE_URL}/hub/billing?utm_source=email&utm_campaign=transactional&utm_content=manage-subscription" style="color:#000000;">Manage subscription</a>
                  </td></tr>`;
}

/**
 * Purple-pill-equivalent CTA button, APP-colored — same bulletproof
 * MSO/VML fallback structure as PP's ctaButton, recolored to
 * BRAND.softGreen with white label text (matching site's existing button
 * convention) instead of PP's black-on-lavender.
 * Returns a full <tr> ready to drop into the email body.
 */
export function ctaButton(label: string, url: string): string {
  return `
                  <!-- CTA button -->
                  <tr><td style="padding:0 24px 16px">
                    <table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tbody><tr>
                      <td align="center">
                        <!--[if mso]><table cellpadding="0" cellspacing="0" border="0" width="317" style="width:317px"><tbody><tr><td><![endif]-->
                        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:317px"><tbody><tr>
                          <td style="width:100%">
                            <a href="${url}" target="_blank" rel="noopener" style="color:#ffffff;text-decoration:none">
                              <!--[if mso]>
                              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="${url}" style="height:52px;width:317px;v-text-anchor:middle;" arcsize="100%" fillcolor="${BRAND.softGreen}">
                                <v:stroke dashstyle="Solid" weight="0px" color="${BRAND.softGreen}"/>
                                <w:anchorlock/>
                                <v:textbox inset="0px,0px,0px,0px">
                                  <center dir="false" style="color:#ffffff;font-family:sans-serif;font-size:17.8px">
                              <![endif]-->
                              <span style="background-color:${BRAND.softGreen};border-radius:134px;color:#ffffff;display:table;font-family:Arial,Helvetica,sans-serif;font-size:17.8px;font-weight:700;height:52px;text-align:center;width:100%;box-sizing:border-box;letter-spacing:0.047em;line-height:24.9px">
                                <span style="padding-left:8px;padding-right:8px;display:table-cell;height:100%;vertical-align:middle">
                                  ${label}
                                </span>
                              </span>
                              <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                            </a>
                          </td>
                        </tr></tbody></table>
                        <!--[if mso]></td></tr></tbody></table><![endif]-->
                      </td>
                    </tr></tbody></table>
                  </td></tr>`;
}

/**
 * Body copy section — pass inner <tr><td>...</td></tr> rows.
 * Handles all the email-table nesting boilerplate. Copied from PP's base.ts
 * (brand-agnostic layout logic).
 *
 * @param tightBottom  Drop this section's own trailing 16px spacer row.
 *   Use when a ctaButton() immediately follows.
 */
export function bodySection(rows: string, tightBottom = false): string {
  return `
                  <tr><td style="padding:0 24px ${tightBottom ? 0 : 16}px">
                    <table border="0" cellpadding="0" cellspacing="0" align="center"
                      style="display:table;width:100%;max-width:100%;table-layout:fixed;margin:0 auto">
                      <tbody><tr><td>
                        <table border="0" cellpadding="0" cellspacing="0"
                          style="width:100%;max-width:552px;table-layout:fixed;margin:0 auto">
                          <tbody><tr><td style="width:100%;box-sizing:border-box;vertical-align:top">
                            <table border="0" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed">
                              <tbody><tr><td style="padding:26px">
                                <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                                  style="color:#000;font-size:16px;line-height:1.4;text-align:left;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;word-wrap:break-word;word-break:break-word">
                                  <tbody>
                                    ${rows}
                                  </tbody>
                                </table>
                              </td></tr>
                            </table>
                          </td></tr>
                        </table>
                      </td></tr>
                    </table>
                  </td></tr>`;
}

/**
 * Full email wrapper — bulletproof nested-table layout (copied from PP's
 * base.ts), APP-branded header, wraps content rows and appends the shared
 * footer.
 * @param content  One or more <tr> rows (use bodySection / ctaButton helpers)
 * @param extraPreloads  Optional <link rel="preload"> tags for email-specific images
 */
export function baseEmail(content: string, extraPreloads = ""): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
${emailHead(extraPreloads)}
<body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f0f1f5;margin:0;padding:0">

<table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color:#f0f1f5">
  <tbody><tr><td style="background-color:#f0f1f5">

    <!--[if mso]><center>
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600"><tbody><tr><td>
    <![endif]-->

    <table align="center" width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" class="ecw"
      style="max-width:600px;min-height:600px;margin:0 auto;background-color:#ffffff;width:600px;min-width:600px">
      <tbody>
        <tr><td style="vertical-align:top"></td></tr>
        <tr><td style="vertical-align:top;padding:0">
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
            <tbody><tr><td style="padding:24px 0 24px 0;vertical-align:top">
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
                style="color:#000;font-size:16px;line-height:1.4;text-align:left;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse;word-wrap:break-word;word-break:break-word">
                <tbody>
                  ${content}
                  ${emailFooter()}
                </tbody>
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td height="100%" style="height:100%;font-size:0;line-height:0" aria-hidden="true">&nbsp;</td></tr>
      </tbody>
    </table>

    <!--[if mso]></td></tr></tbody></table></center><![endif]-->

  </td></tr></tbody>
</table>

</body>
</html>`;
}

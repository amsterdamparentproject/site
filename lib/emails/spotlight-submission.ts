/**
 * Internal notification email for Expert & Community Spotlight submissions
 * (app/contribute + components/SpotlightSubmitForm). Sent to Alex,
 * not the submitter — so this deliberately does NOT use baseEmail()/
 * emailFooter() (those bake in FYP subscriber-facing copy — "you're
 * receiving this because you joined the First Year Program", a "Manage
 * subscription" link — which would be confusing/wrong on an internal ops
 * email). wrapEmail() below is a minimal local equivalent: same bulletproof
 * table skeleton and bodySection()/ctaButton() helpers, its own one-line
 * footer instead.
 *
 * Two things this builds, from the same payload:
 * - A readable HTML summary (bio + interview Q&A, or a link to their doc).
 * - For the "answer here" method, a copy-paste-ready block formatted like
 *   data/advice/templates/{expert,community}-spotlight.mdx's Bio/Interview
 *   sections, so turning a submission into a real post is close to
 *   paste-and-go rather than reformatting from scratch.
 */

import {
  FROM,
  getResend,
  bodySection,
  ctaButton,
  emailHead,
  subjectPrefix,
  BRAND,
} from "./base";
import type { SpotlightType } from "@/data/spotlights/questions";
import {
  spotlightTypeCopy,
  spotlightOneAskIntro,
} from "@/data/spotlights/questions";

export type SpotlightBioAnswer = { label: string; answer: string };
export type SpotlightQA = { question: string; answer: string };

export type SpotlightProfile = {
  occupation: string;
  company: string;
  website: string;
  instagram: string;
  linkedin: string;
};

export type SpotlightSubmissionPayload = {
  type: SpotlightType;
  method: "doc" | "form";
  name: string;
  email: string;
  docLink?: string;
  bio: SpotlightBioAnswer[];
  interview: SpotlightQA[];
  photoCount: number;
  profile: SpotlightProfile;
  oneAsk?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function yamlString(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

// data/authors/*.mdx files are named in camelCase (claudiaCarter.mdx) —
// mirror that so the attached file matches the convention it's dropped into.
function slugifyAuthorKey(name: string): string {
  const words = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "contributor";
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("")
  );
}

// Published posts (data/stories/*.mdx) use kebab-case filenames — used for
// both the spotlight name and, for Dear Dr. Mom, the question-as-title.
function slugifyArticle(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "spotlight";
}

// Bio labels that are already questions ("How long have you lived in
// Amsterdam?") read their answer right after the "?" — no extra colon —
// while statement labels ("Originally from") need one to separate label
// from answer. Matches the real published posts, e.g.
// data/stories/malu-bermudez.mdx's "- **How long have you lived in
// Amsterdam?** 11 years" vs. "- **Originally from:** Bogotá, Colombia".
function bioBulletLine(label: string, answer: string): string {
  const sep = label.trim().endsWith("?") ? "" : ":";
  return `- **${label}${sep}** ${answer || ""}`;
}

// The two files Alex drops straight into the repo: the post itself
// (data/stories/ for Expert & Community, data/advice/ for Dear Dr. Mom) and
// its author profile (data/authors/), pre-filled from the submission so
// turning it into a real post is close to paste-and-go rather than
// reformatting from scratch. Mirrors data/advice/templates/*.mdx and a
// real data/authors/*.mdx respectively — see e.g. data/stories/selina-haria.mdx.
export function spotlightArticleMdx(
  payload: SpotlightSubmissionPayload,
  authorSlug: string,
): { filename: string; content: string } {
  const today = new Date().toISOString().slice(0, 10);
  const typeLabel = spotlightTypeCopy[payload.type].label;

  if (payload.type === "dearDrMom") {
    const qa = payload.interview[0];
    const title = qa?.question || `Dear Dr. Mom: ${payload.name}`;
    const frontmatter = [
      "---",
      `title: ${yamlString(title)}`,
      `date: "${today}"`,
      `authors: [${authorSlug}]`,
      "tags: []",
      "draft: true",
      "---",
    ].join("\n");
    const body = [
      `# ${title}`,
      "",
      "# Their answer",
      "",
      qa?.answer || "",
    ].join("\n");
    return {
      filename: `${slugifyArticle(title)}.mdx`,
      content: `${frontmatter}\n\n${body}\n`,
    };
  }

  const series =
    payload.type === "expert" ? "expert-spotlight" : "community-spotlight";
  const frontmatter = [
    "---",
    `title: ${yamlString(`${typeLabel}: ${payload.name}`)}`,
    `date: "${today}"`,
    `authors: [${authorSlug}]`,
    "tags: []",
    `series: ${series}`,
    "draft: true",
    "---",
  ].join("\n");

  const bodyLines: string[] = [];

  // Expert Spotlight only — see e.g. data/stories/danielle-bensky.mdx's
  // "### The One Ask", which sits before Bio in the published post.
  if (payload.type === "expert" && payload.oneAsk) {
    const firstName = payload.name.trim().split(/\s+/)[0] || payload.name;
    bodyLines.push(
      "### The One Ask",
      "",
      `_${spotlightOneAskIntro}_ ❤️`,
      "",
      `> **${firstName}'s One Ask**: ${payload.oneAsk}`,
      "",
    );
  }

  bodyLines.push("# Bio", "", `- **Name:** ${payload.name}`);
  payload.bio.forEach((b) => bodyLines.push(bioBulletLine(b.label, b.answer)));
  // Only Expert Spotlight shows Company in the bio — it's the site/link for
  // their practice, which Community contributors don't have.
  if (payload.type === "expert") {
    const { company, website } = payload.profile;
    if (company && website) {
      bodyLines.push(`- **Company:** [${company}](${website})`);
    } else if (company) {
      bodyLines.push(`- **Company:** ${company}`);
    } else if (website) {
      bodyLines.push(`- **Company:** [${website}](${website})`);
    }
  }
  bodyLines.push("", "# Interview", "");
  payload.interview.forEach((qa) => {
    bodyLines.push(`## ${qa.question}`, "", qa.answer || "", "");
  });

  return {
    filename: `${slugifyArticle(payload.name)}.mdx`,
    content: `${frontmatter}\n\n${bodyLines.join("\n").trim()}\n`,
  };
}

export function spotlightAuthorMdx(
  payload: SpotlightSubmissionPayload,
  authorSlug: string,
): { filename: string; content: string } {
  const { occupation, company, website, instagram, linkedin } = payload.profile;
  const lines = ["---", `name: ${payload.name}`];
  if (occupation) lines.push(`occupation: ${occupation}`);
  if (company) lines.push(`company: ${company}`);
  if (website) lines.push(`website: ${website}`);
  if (instagram) lines.push(`instagram: ${instagram}`);
  if (linkedin) lines.push(`linkedin: ${linkedin}`);
  lines.push(
    "# avatar: add the photo path once it's placed under /public/static/images",
    "---",
  );
  return { filename: `${authorSlug}.mdx`, content: lines.join("\n") + "\n" };
}

function bioRowsHtml(payload: SpotlightSubmissionPayload): string {
  const rows = [
    `<tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 8px;line-height:1.4"><b>Name:</b> ${escapeHtml(payload.name)}</td></tr>`,
    ...payload.bio.map(
      (b) =>
        `<tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 8px;line-height:1.4"><b>${escapeHtml(b.label)}:</b> ${escapeHtml(b.answer || "—")}</td></tr>`,
    ),
  ];
  return rows.join("\n");
}

function interviewRowsHtml(payload: SpotlightSubmissionPayload): string {
  if (payload.interview.length === 0) {
    return `<tr><td dir="ltr" style="font-size:16px;padding:0 0 8px;line-height:1.4;font-style:italic">No interview questions answered.</td></tr>`;
  }
  return payload.interview
    .map(
      (qa) => `
      <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:16px 0 4px;line-height:1.4"><b>${escapeHtml(qa.question)}</b></td></tr>
      <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 4px;line-height:1.4;white-space:pre-wrap">${escapeHtml(qa.answer)}</td></tr>`,
    )
    .join("\n");
}

function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html>
${emailHead()}
<body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f0f1f5;margin:0;padding:0">
<table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f0f1f5" style="background-color:#f0f1f5">
  <tbody><tr><td style="background-color:#f0f1f5">
    <table align="center" width="600" border="0" cellpadding="0" cellspacing="0" role="presentation"
      style="max-width:600px;margin:0 auto;background-color:#ffffff;width:600px;min-width:600px">
      <tbody>
        <tr><td style="padding:24px 0;vertical-align:top">
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
            style="color:#000;font-size:16px;line-height:1.4;text-align:left;font-family:Arial,Helvetica,sans-serif;border-collapse:collapse">
            <tbody>
              ${content}
              <tr><td style="font-size:13px;color:${BRAND.softGreen};text-align:center;padding:24px 24px 0">
                Sent from the Spotlight submission form on amsterdamparentproject.nl
              </td></tr>
            </tbody>
          </table>
        </td></tr>
      </tbody>
    </table>
  </td></tr></tbody>
</table>
</body>
</html>`;
}

export function spotlightSubmissionHtml(
  payload: SpotlightSubmissionPayload,
): string {
  const typeLabel = spotlightTypeCopy[payload.type].label;

  const intro = bodySection(`
    <tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 16px;line-height:1.4">
      <span style="font-weight:700">New ${typeLabel} submission from ${escapeHtml(payload.name)}</span>
    </td></tr>
    <tr><td dir="ltr" style="font-size:14px;text-align:left;padding:0 0 4px;line-height:1.4">
      <b>Reply-to:</b> ${escapeHtml(payload.email)}
    </td></tr>
    <tr><td dir="ltr" style="font-size:14px;text-align:left;line-height:1.4">
      <b>Photos attached:</b> ${payload.photoCount || "none"}
    </td></tr>
  `);

  const docSection = payload.docLink
    ? bodySection(
        `<tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 8px;line-height:1.4">They wrote their answers in their own doc:</td></tr>`,
        true,
      ) + ctaButton("Open their doc", payload.docLink)
    : "";

  const bioSection = bodySection(`
    <tr><td dir="ltr" style="font-size:18px;font-weight:700;text-align:left;padding:0 0 8px;line-height:1.4">Bio</td></tr>
    ${bioRowsHtml(payload)}
  `);

  const profileRows = (
    [
      ["Occupation/title", payload.profile.occupation],
      ["Company/practice", payload.profile.company],
      ["Website", payload.profile.website],
      ["Instagram", payload.profile.instagram],
      ["LinkedIn", payload.profile.linkedin],
    ] as const
  ).filter(([, value]) => value.trim() !== "");
  const profileSection =
    profileRows.length > 0
      ? bodySection(`
          <tr><td dir="ltr" style="font-size:18px;font-weight:700;text-align:left;padding:0 0 8px;line-height:1.4">Profile</td></tr>
          ${profileRows
            .map(
              ([label, value]) =>
                `<tr><td dir="ltr" style="font-size:16px;text-align:left;padding:0 0 8px;line-height:1.4"><b>${escapeHtml(label)}:</b> ${escapeHtml(value)}</td></tr>`,
            )
            .join("\n")}
        `)
      : "";

  const oneAskSection = payload.oneAsk
    ? bodySection(`
        <tr><td dir="ltr" style="font-size:18px;font-weight:700;text-align:left;padding:0 0 8px;line-height:1.4">The One Ask</td></tr>
        <tr><td dir="ltr" style="font-size:16px;text-align:left;line-height:1.4;white-space:pre-wrap">${escapeHtml(payload.oneAsk)}</td></tr>
      `)
    : "";

  const interviewSection =
    payload.method === "form"
      ? bodySection(`
          <tr><td dir="ltr" style="font-size:18px;font-weight:700;text-align:left;padding:0 0 8px;line-height:1.4">Interview</td></tr>
          ${interviewRowsHtml(payload)}
        `)
      : "";

  const articleDir =
    payload.type === "dearDrMom" ? "data/advice" : "data/stories";
  const attachmentsNote = bodySection(`
    <tr><td dir="ltr" style="font-size:14px;text-align:left;line-height:1.4">
      Two .mdx files are attached — drop the article into <code>${articleDir}/</code> and the author profile into <code>data/authors/</code>.
    </td></tr>
  `);

  return wrapEmail(
    intro +
      docSection +
      bioSection +
      profileSection +
      oneAskSection +
      interviewSection +
      attachmentsNote,
  );
}

export async function sendSpotlightSubmissionEmail(
  payload: SpotlightSubmissionPayload,
  photoAttachments: { filename: string; content: Buffer }[],
): Promise<void> {
  const resend = getResend();
  const typeLabel = spotlightTypeCopy[payload.type].label;
  const to =
    process.env.SPOTLIGHT_SUBMISSION_EMAIL || "hello@amsterdamparentproject.nl";

  const authorSlug = slugifyAuthorKey(payload.name);
  const article = spotlightArticleMdx(payload, authorSlug);
  const author = spotlightAuthorMdx(payload, authorSlug);
  const mdxAttachments = [
    {
      filename: article.filename,
      content: Buffer.from(article.content, "utf-8"),
    },
    {
      filename: author.filename,
      content: Buffer.from(author.content, "utf-8"),
    },
  ];

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    replyTo: payload.email,
    subject: `${subjectPrefix()}New ${typeLabel} submission: ${payload.name}`,
    html: spotlightSubmissionHtml(payload),
    attachments: [...mdxAttachments, ...photoAttachments],
  });

  if (error) {
    console.error("[resend] sendSpotlightSubmissionEmail error:", error);
    throw error;
  }
}

// Shared source of truth for the newsletter contribution page
// (app/contribute) and its form (components/SpotlightSubmitForm).
// Three tracks: Expert Spotlight / Community Spotlight mirror
// data/advice/templates/expert-spotlight.mdx and community-spotlight.mdx
// exactly — if those templates change, update here too so the on-page form
// and the emailed .mdx templates stay in sync. Dear Dr. Mom Article is the
// expert-answers-a-question side of the advice column (the parent-submits-
// a-question side is the separate Google Form behind /advice/submit — this
// is deliberately not that; don't merge them).

export type SpotlightType = "expert" | "community" | "dearDrMom";

// Order drives every listing on the contribute page — the type picker
// grid, and the "See example posts" section. Dear Dr. Mom goes first and
// is the default selected type.
export const spotlightTypes: SpotlightType[] = [
  "dearDrMom",
  "expert",
  "community",
];

export type SpotlightBioField = {
  key: string;
  label: string;
  placeholder?: string;
  // Only enforced for the "I'll answer here" method — doc submitters
  // write everything in their own doc instead of these fields.
  required?: boolean;
};

// The last bio field(s) differ by type — everything before it is shared.
export const spotlightBioFields: Record<SpotlightType, SpotlightBioField[]> = {
  expert: [
    {
      key: "originallyFrom",
      label: "Originally from",
      required: true,
      placeholder: "Boston, USA",
    },
    {
      key: "children",
      label: "Age and gender of your child(ren)",
      required: true,
      placeholder: "1 son (4.5 years old) and 1 daughter (2.5 years old)",
    },
    {
      key: "expertise",
      label: "Service/expertise",
      placeholder: "Building community infrastructure for Amsterdam parents",
    },
  ],
  community: [
    {
      key: "originallyFrom",
      label: "Originally from",
      required: true,
      placeholder: "Boston, USA",
    },
    {
      key: "children",
      label: "Age and gender of your child(ren)",
      required: true,
      placeholder: "1 son (4.5 years old) and 1 daughter (2.5 years old)",
    },
    {
      key: "yearsInAmsterdam",
      label: "How long have you lived in Amsterdam?",
      required: true,
      placeholder: "2 years",
    },
  ],
  dearDrMom: [
    {
      key: "originallyFrom",
      label: "Originally from",
      required: true,
      placeholder: "Boston, USA",
    },
    { key: "credentials", label: "Your credentials & expertise" },
  ],
};

export const spotlightInterviewQuestions: Record<SpotlightType, string[]> = {
  expert: [
    "Tell us about what you do for the postpartum community!",
    "What inspired you to start your postpartum business and/or deepen your expertise?",
    "What has your work as a postpartum expert taught you about yourself, as a parent and professional?",
    "What has been easier about postpartum (for yourself or for your clients) than you thought it would be?",
    "What has been more challenging?",
    "What's a postpartum belief you find yourself talking about (and perhaps correcting) often with new parents?",
    "Why have you chosen to practice here in Amsterdam?",
    'What is one area of postpartum support in Amsterdam that you believe is currently underserved or needs more public "spotlight" and development?',
    "What was a recent parenting-related win? (Personal or professional!)",
    "What is one current goal you have for yourself: as a parent, expert, or business owner?",
    "What is one thing we can do as community parents to support you?",
    "What's your best piece of advice for parents-to-be or new parents?",
  ],
  community: [
    "What was your most recent parenting win?",
    "What's been easier about having a kid than you thought it would be?",
    "What's been more challenging?",
    "What have you been surprised to learn about your kid?",
    "What's the last kid-related thing you've looked up on Google or asked AI about?",
    "What has being a parent taught you about yourself?",
    "I'm now an 'armchair expert' in…",
    "What do you love about having a kid in the Netherlands?",
    "What do you wish you had known before becoming a parent?",
    "What's your best piece of advice for parents-to-be or new parents?",
  ],
  // Dear Dr. Mom doesn't use this list — its "question" and "answer" are
  // two dedicated fields in SpotlightSubmitForm, not a generic Q&A pair.
  dearDrMom: [],
};

// Section heading + guidance copy above the question list, and how tall the
// answer textareas start — Dear Dr. Mom is one full-length article answer,
// not a dozen short optional ones, so it gets its own copy and more room.
export const spotlightSectionLabel: Record<SpotlightType, string> = {
  expert: "Interview",
  community: "Interview",
  dearDrMom: "Your Article",
};

export const spotlightInterviewIntro: Record<SpotlightType, string> = {
  expert:
    "Answer at least one of these questions — skip the rest. You're also welcome to write your own below.",
  community:
    "Answer at least one of these questions — skip the rest. You're also welcome to write your own below.",
  dearDrMom:
    "Write your full answer below — as much detail as you'd like. Answering more than one question in this submission? Add another below.",
};

export const spotlightInterviewRows: Record<SpotlightType, number> = {
  expert: 3,
  community: 3,
  dearDrMom: 10,
};

// Expert Spotlight only — a dedicated section after Bio (see e.g. the
// published data/stories/danielle-bensky.mdx's "### The One Ask"). Kept as
// its own field rather than folded into the generic interview list since
// the article renders it as its own section, not a Q&A entry.
export const spotlightOneAskIntro =
  "So many community parents have one cause or action that could really help shift the needle on something they care about. Let's celebrate both asking for help and small acts of community service";
export const spotlightOneAskQuestion = "What's your one ask?";

export const spotlightTypeCopy: Record<
  SpotlightType,
  { label: string; blurb: string }
> = {
  expert: {
    label: "Expert Spotlight",
    blurb:
      "For the postpartum & parenting professionals working with our community — doulas, therapists, coaches, and more.",
  },
  community: {
    label: "Community Spotlight",
    blurb:
      "For the parents in our community sharing their own honest, in-the-trenches parenting journey in Amsterdam.",
  },
  dearDrMom: {
    label: "Dear Dr. Mom",
    blurb:
      'Expert-written advice answering a real parent question, for our "you ask, a local expert answers" column.',
  },
};

// Where "See previous articles/posts" links to from each picker card on
// the contribute page. Dear Dr. Mom articles live under /advice; Expert
// and Community Spotlights are /stories filtered by their series tag
// (see the `series:` frontmatter on data/stories/*.mdx).
export const spotlightArchiveHref: Record<SpotlightType, string> = {
  dearDrMom: "/advice",
  expert: "/stories?series=expert-spotlight",
  community: "/stories?series=community-spotlight",
};

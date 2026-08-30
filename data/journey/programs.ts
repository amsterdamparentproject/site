// ---------------------------------------------------------------------------
// Shared data for the /journey page — both the narrative (JourneyStory) and
// the program×stage matrix (SupportGrid) read from this single source so the
// two can never drift out of sync with each other.
//
// Accent classNames are written out in full (not built with template
// literals) so Tailwind's source scanner can find them — see JourneyStory/
// SupportGrid for where they're used.
// ---------------------------------------------------------------------------

export type Stage = "pregnancy" | "newborn" | "baby" | "toddler";

export interface StageInfo {
  key: Stage;
  label: string;
  subtitle: string;
}

export const stages: StageInfo[] = [
  {
    key: "pregnancy",
    label: "Pregnancy",
    subtitle: "Before your baby arrives",
  },
  {
    key: "newborn",
    label: "Newborn",
    subtitle: "When midwife & kraamzorg step back",
  },
  { key: "baby", label: "Baby", subtitle: "Your baby's first year" },
  { key: "toddler", label: "Toddler", subtitle: "Beyond the first year" },
];

export type Pricing = "Free" | "Paid";

export interface JourneyProgram {
  name: string;
  href: string;
  description: string;
  cta: string;
  stages: Stage[];
  pricing: Pricing;
  accentDot: string;
  accentBorder: string;
  accentSoftBg: string;
  accentText: string;
}

// Ordered to match the sequence programs enter the /journey narrative
// (JourneyStory.tsx): Season Group, Postpartum Post, First Year Program,
// Newsletter, Amsterdam Parent Groups Directory. SupportGrid renders rows in
// this same order, so the story and the matrix read consistently.
export const journeyPrograms: JourneyProgram[] = [
  {
    name: "Season Group",
    href: "/season-groups",
    description:
      "A free, private WhatsApp community for expecting families due around the same time as you.",
    cta: "Join your Season Group",
    stages: ["pregnancy", "newborn", "baby"],
    pricing: "Free",
    accentDot: "bg-brand-charcoal dark:bg-brand-white",
    accentBorder: "border-brand-charcoal dark:border-brand-white",
    accentSoftBg: "bg-brand-charcoal/10 dark:bg-brand-white/10",
    accentText: "text-brand-charcoal dark:text-brand-white",
  },
  {
    name: "Postpartum Post",
    href: "https://postpartumpost.com",
    description:
      "Meet a new or expecting parent each month, plus local things to do together.",
    cta: "Get introduced",
    stages: ["pregnancy", "newborn", "baby", "toddler"],
    pricing: "Paid",
    accentDot: "bg-brand-violet",
    accentBorder: "border-brand-violet",
    accentSoftBg: "bg-brand-violet/10",
    accentText: "text-brand-violet",
  },
  {
    name: "First Year Program",
    href: "/programs/first-year",
    description:
      "Expert-led guidance, a matched local parent friend, and a moderated community.",
    cta: "Join the program",
    stages: ["pregnancy", "newborn", "baby"],
    pricing: "Paid",
    accentDot: "bg-brand-soft-green",
    accentBorder: "border-brand-soft-green",
    accentSoftBg: "bg-brand-soft-green/10",
    accentText: "text-brand-soft-green dark:text-brand-goldenrod",
  },
  {
    name: "Newsletter",
    href: "/newsletter",
    description:
      "A regular digest of local resources, events, and expert advice.",
    cta: "Subscribe",
    stages: ["newborn", "baby", "toddler"],
    pricing: "Free",
    accentDot: "bg-brand-dark-sand",
    accentBorder: "border-brand-dark-sand",
    accentSoftBg: "bg-brand-dark-sand/10",
    accentText: "text-brand-dark-sand",
  },
  {
    name: "Amsterdam Parent Groups Directory",
    href: "/groups-directory",
    description:
      "Discover your local parent communities: 80+ groups and counting.",
    cta: "Find your groups",
    stages: ["pregnancy", "newborn", "baby", "toddler"],
    pricing: "Free",
    accentDot: "bg-brand-goldenrod",
    accentBorder: "border-brand-goldenrod",
    accentSoftBg: "bg-brand-goldenrod/10",
    accentText: "text-brand-goldenrod",
  },
];

export function programsForStage(stage: Stage): JourneyProgram[] {
  return journeyPrograms.filter((program) => program.stages.includes(stage));
}

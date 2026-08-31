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
  // Same color/opacity as accentSoftBg, as a border-color utility instead
  // of a background one — used by StageRecommender's card border.
  accentSoftBorder: string;
  accentText: string;
  // Contrasting body-text color for when accentDot is used as a *solid*
  // card fill (StageRecommender) rather than a small dot/badge — the
  // opposite contrast direction from accentText (which is this program's
  // color used as text on a neutral background).
  cardText: string;
  // Each program has its own real photo (or, for Newsletter and Groups
  // Directory — neither of which is a photographable place or event — a
  // native 2:1 branded graphic instead of a staged lifestyle shot).
  photo: string;
  photoAlt: string;
}

// Ordered to match the sequence programs enter the /journey narrative
// (JourneyStory.tsx): Season Group, Postpartum Post, First Year Program,
// Newsletter, Parent Groups Directory. SupportGrid renders rows in this
// same order, so the story and the matrix read consistently.
export const journeyPrograms: JourneyProgram[] = [
  {
    name: "Season Groups",
    href: "/season-groups",
    description:
      "A free WhatsApp community for expecting families due around the same time as you.",
    cta: "Join your group",
    stages: ["pregnancy", "newborn", "baby"],
    pricing: "Free",
    accentDot: "bg-brand-charcoal dark:bg-brand-white",
    accentBorder: "border-brand-charcoal dark:border-brand-white",
    accentSoftBg: "bg-brand-charcoal/10 dark:bg-brand-white/10",
    accentSoftBorder: "border-brand-charcoal/10 dark:border-brand-white/10",
    accentText: "text-brand-charcoal dark:text-brand-white",
    cardText: "text-brand-white dark:text-brand-charcoal",
    photo: "/static/images/programs/season-groups/cafe-table.webp",
    photoAlt:
      "A Season Group of parents chatting around a long café table, one holding a baby",
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
    accentSoftBorder: "border-brand-violet/10",
    accentText: "text-brand-violet",
    cardText: "text-brand-charcoal",
    photo: "/static/images/programs/postpartum-post/papote.png",
    photoAlt:
      "Two parents getting to know each other in a cozy play space, one holding her baby",
  },
  {
    name: "First Year Program",
    href: "/programs/first-year",
    description:
      "Expert-led guidance, a matched local parent friend, and a moderated community.",
    cta: "Join the program",
    stages: ["pregnancy", "newborn", "baby"],
    pricing: "Paid",
    accentDot: "bg-program-burnout-blue",
    accentBorder: "border-program-burnout-blue",
    accentSoftBg: "bg-program-burnout-blue/10",
    accentSoftBorder: "border-program-burnout-blue/10",
    accentText: "text-program-burnout-blue",
    cardText: "text-brand-charcoal",
    photo:
      "/static/images/programs/first-year-program/gallery/museum-group.webp",
    photoAlt:
      "A group of parents and babies posing together at the Rijksmuseum",
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
    accentSoftBorder: "border-brand-dark-sand/10",
    accentText: "text-brand-dark-sand",
    cardText: "text-brand-charcoal",
    photo: "/static/images/programs/newsletter/logo.webp",
    photoAlt:
      "Just a Phase — a biweekly newsletter for new parents in Amsterdam",
  },
  {
    name: "Groups Directory",
    href: "/groups-directory",
    description:
      "Discover your local parent communities: 100+ groups and counting.",
    cta: "Find your groups",
    stages: ["pregnancy", "newborn", "baby", "toddler"],
    pricing: "Free",
    accentDot: "bg-brand-goldenrod",
    accentBorder: "border-brand-goldenrod",
    accentSoftBg: "bg-brand-goldenrod/10",
    accentSoftBorder: "border-brand-goldenrod/10",
    accentText: "text-brand-goldenrod",
    cardText: "text-brand-charcoal",
    photo: "/static/images/programs/groups-directory/logo-2x1.webp",
    photoAlt: "The Amsterdam Parent Project logo",
  },
];

export function programsForStage(stage: Stage): JourneyProgram[] {
  return journeyPrograms.filter((program) => program.stages.includes(stage));
}

// Curated 3-program picks per stage for the homepage's StageRecommender —
// deliberately narrower than programsForStage() (which returns every
// program that applies to a stage, 3-5 of them): the homepage only has room
// for three cards, so this hand-picks the most relevant trio per stage
// rather than mechanically taking the first three matches. "newborn" is the
// default state and intentionally matches the site's pre-existing static
// homepage highlights (Postpartum Post, First Year Program, Groups
// Directory) so nothing changes for a visitor who never touches the picker.
const homepageRecommendationNames: Record<Stage, string[]> = {
  pregnancy: ["Season Groups", "Postpartum Post", "First Year Program"],
  newborn: ["Postpartum Post", "First Year Program", "Groups Directory"],
  baby: ["Postpartum Post", "Newsletter", "First Year Program"],
  toddler: ["Postpartum Post", "Newsletter", "Groups Directory"],
};

export function homepageRecommendationsForStage(
  stage: Stage,
): JourneyProgram[] {
  return homepageRecommendationNames[stage].map(
    (name) => journeyPrograms.find((p) => p.name === name)!,
  );
}

interface Session {
  title: string;
  subtitle: string;
  description: string;
  components?: string[];
  experts: string[];
}

const firstYearProgramData: Session[] = [
  {
    title: "Building the Village",
    subtitle: "Creating your support system in the Netherlands",
    description: `
      We've all heard the phrase "It takes a village." For new parents — especially expats becoming parents abroad — the village doesn't come without effort.
      But where to start? We cover local Dutch postpartum care and end with an exercise on finding and filling gaps in support, so you're not starting from scratch when you need it most.
    `,
    experts: ["alexSiega", "irenaDomachowska"],
    components: [
      "Overview of local Dutch systems: baby care, medical, and mental health",
      "How to navigate the English-speaking network in Amsterdam",
      "Experiential exercise on how to build a support network that actually works for your family",
    ],
  },
  {
    title: "Newborn Feeding",
    subtitle: "A whole-family approach from newborn through first foods",
    description: `
      Feeding is one of the most consuming parts of new parenthood — and it evolves constantly through the first year.
      We cover the full arc from newborn feeding to introducing solids, with a whole-family lens that keeps both parents in the picture and reduces the mental load on one person.
    `,
    experts: ["heatherBerry", "irenaDomachowska"],
    components: [
      "Actionable feeding strategies focused on health and wellness for the whole family",
      "Evidence-based insight into common newborn feeding scenarios",
      "Introduction to starting solids: timing, approach, and what to expect",
      "Short, impactful exercises for you and your partner",
    ],
  },
  {
    title: "Physical & Emotional Transformation",
    subtitle: "How becoming a parent changes you — permanently",
    description: `
      Birth and the first year reshape both parents' bodies and minds in ways that go far beyond "bouncing back."
      We explore the permanent physical changes after birth alongside the emotional and identity shifts of new parenthood — including matrescence and patrescence — and offer practical ways to navigate your evolving self with compassion.
    `,
    experts: ["heatherBerry", "irenaDomachowska"],
    components: [
      "Overview of permanent physical changes that can happen after birth",
      "Matrescence and patrescence: understanding your new identity as a parent",
      "How to navigate your new body and mind — for both partners",
      "Resources to help within the English-speaking Dutch system",
    ],
  },
  {
    title: "Postpartum Relationships: Culture",
    subtitle: "Raising a baby across cultures",
    description: `
      When two people with different backgrounds become parents together, their childhoods show up — often unexpectedly.
      From food and sleep to discipline and family roles, cultural differences surface in the day-to-day of new parenthood. We help you identify where they come from and how to build a shared parenting culture that works for your family.
    `,
    experts: ["angelaVitiello", "naomiGibson"],
    components: [
      "How cultural backgrounds shape parenting instincts and expectations",
      "Common friction points for multicultural families with young babies",
      "Exercises to help partners align on values and build a shared approach",
      "Navigating extended family expectations across cultures",
    ],
  },
  {
    title: "Postpartum Relationships: Partner",
    subtitle: "Staying connected when everything has changed",
    description: `
      No relationship is unchanged by a baby. Intimacy, communication, equal parenting, and emotional connection all shift — and often in ways that feel surprising or isolating.
      We identify what's normal, what's worth addressing, and how to build a stronger partnership through one of life's biggest transitions.
    `,
    experts: ["naomiGibson", "irenaDomachowska"],
    components: [
      "Common postpartum partner relationship challenges: communication, intimacy, emotional connection",
      "Equal parenting: identifying imbalance and addressing it constructively",
      "Nonviolent communication techniques for new parents",
      "Expert exercises to help you and your partner get on the same page",
    ],
  },
  {
    title: "Return to Work & Life",
    subtitle: "Transitioning from parental leave to working parenthood",
    description: `
      The return to work is one of the most emotionally complex moments of the first year — and it's rarely talked about honestly.
      We cover the mental load, boundary-setting, re-entry emotions, and what it actually takes to feel capable and confident as a working parent, without burning out.
    `,
    experts: ["karlaCalinawan", "alexSiega"],
    components: [
      "Mental load: what it is, why it matters, and how to reduce it",
      "Setting workplace boundaries as a new parent",
      "Navigating re-entry emotions: perfectionism, comparison, and guilt",
      "Early signs of burnout and where to find support in Amsterdam",
    ],
  },
];

export default firstYearProgramData;

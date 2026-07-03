interface Session {
  theme: string;
  title: string;
  subtitle: string;
  description: string;
  components?: string[];
  experts: string[];
}

const firstYearProgramData: Session[] = [
  {
    theme: "Local parenting",
    title: "Building the Village",
    subtitle: "Dutch postpartum care and building your support network",
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
    theme: "Baby basics",
    title: "Newborn Feeding Strategies",
    subtitle: "A whole-family approach to feeding",
    description: `
       You've got the basics of breastfeeding and/or bottle-feeding down. Now you're wondering: "How can we possibly keep doing this for the next 6 months?" Learn our inclusive approach to feeding that grows with you and your baby — so that mom, dad/partner, and baby all get what they need in this special yet intense time.
    `,
    experts: ["heatherBerry", "irenaDomachowska"],
    components: [
      "Actionable feeding strategies focused on health and wellness for the whole family",
      "Evidence-based insight into common newborn feeding scenarios",
      "Exercises to improve the mental and physical load for you and your partner",
    ],
  },
  {
    theme: "Matrescence & patrescence",
    title: "Postpartum Transformation",
    subtitle:
      "How becoming a parent changes you — physically, emotionally, permanently",
    description: `
      Birth and the first year reshape both parents' bodies and minds in ways that go far beyond "bouncing back."
      We explore the permanent physical changes after birth alongside the emotional and identity shifts of new parenthood — including matrescence and patrescence — and offer practical ways to navigate your evolving self with compassion.
    `,
    experts: ["heatherBerry", "irenaDomachowska"],
    components: [
      "Overview of permanent physical changes that can happen after birth",
      "Matrescence and patrescence: understanding your new identity as a parent",
      "How to navigate your new body and mind — for both partners",
      "Resources for postpartum mental health and physical recovery in Amsterdam",
    ],
  },
  {
    theme: "Third culture parenting",
    title: "Cross-Cultural Parenting",
    subtitle: "Raising a child in a multicultural family",
    description: `
      When two people with different backgrounds become parents together, their childhoods show up — often unexpectedly.
      From language and sleep to discipline and family roles, cultural differences surface in the day-to-day of new parenthood. 
      We help you identify where they come from and how to build a shared parenting culture that works for your new family.
    `,
    experts: ["angelaVitiello", "alexSiega"],
    components: [
      "How cultural backgrounds shape parenting instincts and expectations",
      "Common friction points for multicultural families: values, language, and more",
      "Help with the in-laws: Navigating extended family expectations across cultures",
      "Exercises to help partners align on values and build a shared approach",
    ],
  },
  {
    theme: "Relationships",
    title: "Partners in Postpartum",
    subtitle: "Staying connected when everything has changed",
    description: `
      No relationship is unchanged by a baby. Intimacy, communication, equal parenting, and emotional connection all shift — and often in ways that feel surprising or isolating.
      We identify what's normal, what's worth addressing, and how to build a stronger partnership through one of life's biggest transitions.
    `,
    experts: ["naomiGibson", "irenaDomachowska"],
    components: [
      "Common postpartum partner relationship challenges: communication, intimacy, emotional connection",
      "Nonviolent communication techniques for new parents",
      "Expert exercises to help you and your partner get on the same page in your new role as parents",
    ],
  },
  {
    theme: "Shifting back",
    title: "Return to Work & Life",
    subtitle: "Transitioning from parental leave to working parenthood",
    description: `
      Let's talk about what happens when the newborn bubble pops. We cover the transition back to work and life post-newborn: joys, challenges, and techniques to manage mental load and reduce parental/professional burnout — so you can feel confident and capable growing as a parent alongside your growing baby. 
    `,
    experts: ["karlaCalinawan", "alexSiega"],
    components: [
      "Mental load: what it is, why it matters, and how to reduce it",
      "Setting workplace boundaries as a new parent",
      "Navigating re-entry emotions: perfectionism, comparison, and guilt",
      "Equal parenting: identifying imbalance and addressing it constructively",
      "Early signs of burnout and where to find support in Amsterdam",
    ],
  },
];

export default firstYearProgramData;

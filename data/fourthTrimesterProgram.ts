interface Session {
  title: string;
  subtitle: string;
  description: string;
  components?: string[];
  experts?: string[];
}

const fourthTrimesterData: Session[] = [
  {
    title: "Newborn Feeding Strategies",
    subtitle: "A whole-family approach to feeding your newborn",
    description: `
        You've got the basics of breastfeeding and/or bottle-feeding down. Now you're wondering: "How can we possibly keep doing this for the next 6 months?"
        Learn about our inclusive, four-pillar approach to newborn feeding that grows with you and your baby — so that mom, dad/partner, and baby all get what they need in this special yet intense time.`,
    experts: ["heatherBerry", "irenaDomachowska"],
    components: [
      "Actionable feeding strategies focused on health and wellness for you and your baby",
      "Evidence-based insight into common feeding scenarios",
      "Short, impactful exercises for you and your partner",
      "Easy-to-digest local resource reference sheet",
    ],
  },
  {
    title: "Postpartum Transformation",
    subtitle: "How new parents’ bodies and minds change",
    description: `
        It's time we got rid of "return to your pre-birth self" — birth and postpartum change both parents' bodies and minds forever.
        We'll learn precisely why "get back to the way things were before the baby" isn't possible, and ways to handle the melting pot of changes to your new self, using psychotherapy techniques.`,
    experts: ["heatherBerry", "irenaDomachowska"],
    components: [
      "Overview of permanent physical changes that can happen after birth",
      "How to navigate your new body and mind: for both partners",
      "Resources to help within the English-speaking Dutch system",
    ],
  },
  {
    title: "Postpartum Relationships",
    subtitle: "Navigating romance and cultures with a new baby",
    description: `
      Learning to parent with the person you love is more difficult than many couples anticipate. From intimacy changes to discovering that 
      childhood cultures lead to different parenting practices, there's a lot to figure out between you two as you're evolving your (shared) identities as parents.
      We identify common challenges and practice psychotherapy-informed exercises that help new parents navigate them together.
        `,
    experts: ["angelaVitiello", "naomiGibson"],
    components: [
      "Common postpartum partner relationship challenges: like communication, sex drive, emotional intimacy, and more",
      "Raising a baby with two, three, or more different cultures",
      "Expert exercises to help you and your partner get on the same page as new parents",
    ],
  },
  {
    title: "What Makes a Village",
    subtitle: "Building community in new parenthood",
    description: `
      We've all heard the phrase "It takes a village;" but for expats becoming parents abroad, the village doesn't come without effort.
      But where to start? We go over why support is so important — so many health benefits — and what help is already be out there in the local Dutch system. 
      We end with a group exercise on identifying gaps in support and leave having a clearer picture of where to go for help.
        `,
    experts: ["alexSiega", "irenaDomachowska"],
    components: [
      "Overview of local Dutch systems: baby care, medical, and mental health",
      "Experiental exercise on to build a supportive network that actually works for your family's needs",
    ],
  },
  {
    title: "Return to a New Reality",
    subtitle: "Going back to work and life after the newborn phase",
    description: `
      Let's talk about what happens when the newborn bubble pops. We cover the transition back to work and life post-newborn: joys, challenges, and
      techniques to manage mental load and reduce parental/professional burnout — so you can feel confident and capable growing as a parent alongside your growing baby. 
        `,
    experts: ["karlaCalinawan", "alexSiega"],
    components: [
      "Mental load: what it is, why it matters",
      "Review equal parenting and how to address imbalance",
      "Learn to identify early signs of burnout and where to find help",
    ],
  },
];

export default fourthTrimesterData;

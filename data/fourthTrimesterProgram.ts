interface Session {
  title: string;
  description: string;
  components?: string[];
}

const fourthTrimesterData: Session[] = [
  {
    title: "Newborn Feeding Strategies for the Whole Family",
    description: `
        You've got the basics of breastfeeding and/or bottle-feeding down. Now you're wondering: "How can we possibly keep doing this for the next 6 months?"
        Learn about our inclusive, four-pillar approach to newborn feeding that grows with you and your baby — so that mom, dad/partner, and baby all get what they need in this special yet intense time.`,
    components: [
      "Actionable feeding strategies focused on health and wellness for you and your baby",
      "Evidence-based insight into common feeding scenarios",
      "Short, impactful exercises for you and your partner",
      "Easy-to-digest local resource reference sheet",
    ],
  },
  {
    title: "Postpartum Soup: How parents’ bodies and minds change after baby",
    description: `
        It's time we got rid of "return to your pre-birth self" — birth and postpartum change parents' bodies and minds forever.
        In this module, we'll learn precisely why "get back to the way things were before the baby" isn't possible, and ways to handle the melting pot of changes to your new self, using psychotherapy techniques.`,
    components: [
      "Overview of permanent physical changes that can happen after birth",
      "Actionable strategies for navigating your new body and mind: for both partners",
      "Resources to help within the English-speaking Dutch system",
    ],
  },
];

export default fourthTrimesterData;

interface Session {
  title: string;
  description: string;
  components?: string[];
  date?: Date;
  until?: Date;
  href?: string;
  imgSrc?: string;
  bannerSrc?: string;
  comingSoon?: boolean;
  hostName?: string;
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
      "Ask the expert about your specific situation",
      "Short, impactful exercises for you and your partner",
      "Easy-to-digest local resource reference sheet",
      "A new peer support group facing similar feeding joys and challenges as you are",
    ],
    comingSoon: true,
    hostName: "heatherBerry",
    imgSrc:
      "/static/images/programs/fourth-trimester-program/feeding-strategies-card.png",
    bannerSrc:
      "/static/images/programs/fourth-trimester-program/feeding-strategies-banner.png",
  },
];

export default fourthTrimesterData;

interface Event {
  title: string;
  description: string;
  date?: Date;
  href?: string;
  imgSrc?: string;
  comingSoon?: boolean;
}

const eventsData: Event[] = [
  {
    title: "Wellness Walk",
    description: `Taking a walk is one of the simplest acts of self-care and 
      community building you can do. So come do it with us! 
      You're welcome to come alone, or with your baby, partner, friend, dog. 
      The more the merrier ❤️`,
    date: new Date("17 March 2025"),
    href: "https://www.eventbrite.nl/e/app-wellness-walk-tickets-1245241574069?aff=oddtdtcreator",
    imgSrc: "/static/images/calendar/wellness-walk.png",
  },
  {
    title: "Online Circle: Finding Support Beyond Family",
    description: `Learn how to build a virtual or local support network when family isn’t nearby. In partnership with Hey Momie.`,
    comingSoon: true,
  },
  {
    title: "Panel: Navigating Career Transitions in Tech",
    description: `APP founder Alex Siega is speaking on this panel about reintegration, reskilling, and resilience as parent professionals in the tech industry. In partnership with SheSharp and Uber.`,
    date: new Date("6 March 2025"),
    href: "https://pages.beamery.com/uber/page/uber-tech-x-shesharp-panel",
    imgSrc:
      "/static/images/calendar/shesharp/navigating-career-transitions.png",
  },
  {
    title: "Burnout Support Program",
    description: `A 2 month program to navigate parental burnout with peer and professional support. Designed and facilitated by a psychotherapist.`,
    date: new Date("1 April 2025"),
    imgSrc: "/static/images/programs/burnout-support-flyer.png",
    href: `./programs/burnout`,
  },
  {
    title: "Community €2 Sale",
    description: `Buy, sell, and donate children's clothes, toys, and books — most for €2 and all for €10 or less — at this community sale hosted by APP.`,
    date: new Date("16 February 2025"),
    imgSrc: "/static/images/calendar/2-euro-sale.jpg",
    href: `https://www.eventbrite.nl/e/2-sale-winter-edition-tickets-1147869631969`,
  },
  {
    title: "Burnout Brunch",
    description: `An expert panel followed by small peer support group discussion about identifying and navigating stress and burnout as a working parent.`,
    date: new Date("25 January 2025"),
    imgSrc: "/static/images/calendar/burnout-brunch-jan-2025.png",
    href: `https://www.eventbrite.nl/e/burnout-brunch-how-to-navigate-stress-and-burnout-as-a-working-parent-tickets-1124433543999`,
  },
];

export default eventsData;

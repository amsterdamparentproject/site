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
    description: `Let's discuss reintegration, reskilling, and resilience as parent professionals. In partnership with SheSharp.`,
    date: new Date("1 April 2025"),
    imgSrc: "/static/images/programs/burnout-support-flyer.png",
    href: `./programs/burnout`,
  },
];

export default eventsData;

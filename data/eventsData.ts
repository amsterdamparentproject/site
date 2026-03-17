export interface CalendarEvent {
  title: string;
  description: string;
  date: string; // Changed to string
  until?: string; // Changed to string
  href: string;
  imgSrc?: string;
  comingSoon?: boolean;
}

const eventsData: CalendarEvent[] = [
  {
    title: "Wellness Walk",
    description: `Taking a walk is one of the simplest acts of self-care and community building you can do. So come do it with us!`,
    date: "2025-03-17",
    href: "https://www.eventbrite.nl/e/app-wellness-walk-tickets-1245241574069?aff=oddtdtcreator",
    imgSrc: "/static/images/calendar/wellness-walk.png",
  },
  {
    title: "Panel: Navigating Career Transitions in Tech",
    description: `APP founder Alex Siega is speaking on this panel about reintegration, reskilling, and resilience as parent professionals in the tech industry.`,
    date: "2025-03-06",
    href: "https://pages.beamery.com/uber/page/uber-tech-x-shesharp-panel",
    imgSrc:
      "/static/images/calendar/shesharp/navigating-career-transitions.png",
  },
  {
    title: "Burnout Support Program: Spring 2025",
    description: `A 2 month program to navigate parental burnout with peer and professional support. Designed and facilitated by a psychotherapist.`,
    date: "2025-04-01",
    until: "2025-05-31",
    imgSrc: "/static/images/programs/burnout-support-flyer.png",
    href: `./programs/burnout`,
  },
  {
    title: "Community €2 Sale",
    description: `Buy, sell, and donate children's clothes, toys, and books — most for €2 and all for €10 or less.`,
    date: "2025-02-16",
    imgSrc: "/static/images/calendar/2-euro-sale.jpg",
    href: `https://www.eventbrite.nl/e/2-sale-winter-edition-tickets-1147869631969`,
  },
  {
    title: "Burnout Brunch",
    description: `An expert panel followed by small peer support group discussion about identifying and navigating stress and burnout.`,
    date: "2025-01-25",
    imgSrc: "/static/images/calendar/burnout-brunch-jan-2025.png",
    href: `https://www.eventbrite.nl/e/burnout-brunch-how-to-navigate-stress-and-burnout-as-a-working-parent-tickets-1124433543999`,
  },
  {
    title: "Co-Work with Kids",
    description: `APP is partnering with Hola Nanny to bring the magic of childcare to our monthly co-working.`,
    date: "2025-04-08",
    imgSrc: "/static/images/calendar/co-work-with-kids.png",
    href: `https://www.eventbrite.nl/e/co-work-with-kids-in-partnership-with-hola-nanny-registration-1288101719919?aff=oddtdtcreator`,
  },
  {
    title: "Wellness Walk",
    description: `Taking a walk is one of the simplest acts of self-care and community building you can do.`,
    date: "2025-04-14",
    href: "https://www.eventbrite.nl/e/app-wellness-walk-tickets-1245241574069",
    imgSrc: "/static/images/calendar/wellness-walk.png",
  },
  {
    title: "BBABBY Fair",
    description: `Over 50 birth and postpartum professionals are gathering at the BBABBY Fair to share their expertise ranging from conception to early parenting.`,
    href: "https://www.eventbrite.nl/e/tickets-bbabby-fair-1218084747269?aff=oddtdtcreator",
    imgSrc: "/static/images/calendar/bbabby-fair.png",
    date: "2025-10-11",
  },
  {
    title: "Fourth Trimester Program: Pilot cohort",
    imgSrc: "/static/images/programs/fourth-trimester-program/ftp-banner.png",
    href: "./programs/fourth-trimester",
    description: `Your whole-family support system in the first months postpartum.`,
    date: "2025-10-01",
    until: "2025-12-21",
  },
  {
    title: "Burnout Support Meetup in the Park",
    imgSrc: "/static/images/calendar/burnout-support-meetup.png",
    href: "https://www.eventbrite.nl/e/burnout-support-meetup-in-the-park-tickets-1505966770149?aff=oddtdtcreator",
    description: `A cozy, safe environment to meet other local parents with experiences in parental burnout.`,
    date: "2025-07-27",
  },
  {
    title: "Pumping Party: Summer 2025",
    imgSrc: "/static/images/calendar/pumping-party-summer-2025.png",
    href: "https://www.instagram.com/p/DL-bm_BtTNv/",
    description: `A casual meet up with fellow mums where we can try out different pumps and gadgets.`,
    date: "2025-07-13",
  },
  {
    title: "Burnout Support Meetup in the Park",
    imgSrc: "/static/images/calendar/burnout-support-meetup.png",
    href: "https://www.eventbrite.nl/e/burnout-support-meetup-in-the-park-tickets-1772509887789?aff=oddtdtcreator",
    description: `Extension of APP's Burnout Support Program for local parents.`,
    date: "2025-10-25",
  },
  {
    title: "Vote for us in West Begroot",
    imgSrc: "/static/images/calendar/west-begroot-2025.png",
    href: "https://westbegroot.amsterdam.nl",
    description: `Vote for APP's West Begroot submission: Kring voor Ouderwelzijn.`,
    date: "2025-10-31",
    until: "2025-12-01",
  },
  {
    title: "Family Tour at the Rijksmuseum",
    imgSrc: "/static/images/calendar/rijksmuseum.jpg",
    href: "https://www.eventbrite.nl/e/family-tour-at-the-rijksmuseum-parents-children-from-0-4-years-old-tickets-1976387211352?aff=oddtdtcreator",
    description: `Meet fellow local parents and learn about the museum's most famous pieces.`,
    date: "2026-01-22",
  },
  {
    title: "Fourth Trimester Program: March cohort",
    imgSrc: "/static/images/programs/fourth-trimester-program/ftp-banner.png",
    href: "/programs/fourth-trimester/join?cohort=mar-2026",
    description: `3 months of peer and professional support for your whole family.`,
    date: "2026-03-01",
    until: "2026-05-31",
  },
  {
    title: "Fourth Trimester Meetup",
    imgSrc: "/static/images/calendar/fourth-trimester-meetup.png",
    href: "https://www.eventbrite.nl/e/fourth-trimester-meetup-tickets-1981518996660?aff=oddtdtcreator",
    date: "2026-02-12",
    description:
      "Bring your newborn (or your belly!) to chat about all things pregnancy and postpartum.",
  },
  {
    title: "Rijksmuseum Family Tour",
    imgSrc: "/static/images/calendar/rijksmuseum.jpg",
    href: "https://www.eventbrite.nl/e/rijksmuseum-family-tour-tickets-1982609593665",
    description: `Learn about Rembrandt and Vermeer in the Gallery of Honor.`,
    date: "2026-03-15",
  },
  {
    title: "Van Gogh Museum Parent & Baby Tour",
    // imgSrc: "/static/images/calendar/vangogh.jpg",
    href: "https://www.eventbrite.nl/e/van-gogh-museum-parent-baby-tour-tickets-1984753296538",
    description: `Designed for parents with pre-walking babies (0-1 year old).`,
    date: "2026-04-14",
  },
];

export default eventsData;

interface Event {
  title: string;
  description: string;
  date?: Date;
  until?: Date;
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
    title: "Panel: Navigating Career Transitions in Tech",
    description: `APP founder Alex Siega is speaking on this panel about reintegration, reskilling, and resilience as parent professionals in the tech industry. In partnership with SheSharp and Uber.`,
    date: new Date("6 March 2025"),
    href: "https://pages.beamery.com/uber/page/uber-tech-x-shesharp-panel",
    imgSrc:
      "/static/images/calendar/shesharp/navigating-career-transitions.png",
  },
  {
    title: "Burnout Support Program: Spring 2025",
    description: `A 2 month program to navigate parental burnout with peer and professional support. Designed and facilitated by a psychotherapist.`,
    date: new Date("1 April 2025"),
    until: new Date("31 May 2025"),
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
  {
    title: "Co-Work with Kids",
    description: `Are you struggling to get work done while your little one is at home? Us too. APP is partnering with Hola Nanny to bring the magic of childcare to our monthly co-working.`,
    date: new Date("8 April 2025"),
    imgSrc: "/static/images/calendar/co-work-with-kids.png",
    href: `https://www.eventbrite.nl/e/co-work-with-kids-in-partnership-with-hola-nanny-registration-1288101719919?aff=oddtdtcreator`,
  },
  {
    title: "Wellness Walk",
    description: `Taking a walk is one of the simplest acts of self-care and 
      community building you can do. So come do it with us! 
      You're welcome to come alone, or with your baby, partner, friend, dog. 
      The more the merrier ❤️`,
    date: new Date("14 April 2025"),
    href: "https://www.eventbrite.nl/e/app-wellness-walk-tickets-1245241574069",
    imgSrc: "/static/images/calendar/wellness-walk.png",
  },
  {
    title: "BBABBY Fair",
    description: `Over 50 birth and postpartum professionals are gathering at the BBABBY Fair to share their expertise ranging from conception to early parenting: Before, Belly, Birth and Beyond. Come listen to the panels, participate in workshops, meet experts, and browse the booths while your little one plays in the special kid’s corner — nannies included. APP will be at the Beyond panel in the afternoon: to talk about burnout, postpartum identity, and community building.`,
    href: "https://www.eventbrite.nl/e/tickets-bbabby-fair-1218084747269?aff=oddtdtcreator",
    imgSrc: "/static/images/calendar/bbabby-fair.png",
    date: new Date("11 October 2025"),
  },
  {
    title: "Fourth Trimester Program: Pilot cohort",
    imgSrc: "/static/images/programs/fourth-trimester-program/ftp-banner.png",
    href: "./programs/fourth-trimester",
    description: `Your whole-family support system in the first months psotpartum. For babies born in Amsterdam in August-October 2025.`,
    date: new Date("1 October 2025"),
    until: new Date("21 December 2025"),
  },
  {
    title: "Burnout Support Meetup in the Park",
    imgSrc: "/static/images/calendar/burnout-support-meetup.png",
    href: "https://www.eventbrite.nl/e/burnout-support-meetup-in-the-park-tickets-1505966770149?aff=oddtdtcreator",
    description: `This meetup in the park is an extension of APP's Burnout Support Program, providing a cozy, safe environment to meet other local parents with past or present experiences in parental burnout. Bring yourself, your partner, and/or your child(ren) — all are welcome for this open meetup.`,
    date: new Date("27 July 2025"),
  },
  {
    title: "Pumping Party: Summer 2025",
    imgSrc: "/static/images/calendar/pumping-party-summer-2025.png",
    href: "https://www.instagram.com/p/DL-bm_BtTNv/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    description: `A casual meet up with fellow mums where we can try out different pumps and gadgets, exchange experiences, and support each other on this journey.`,
    date: new Date("13 July 2025"),
  },
  {
    title: "Burnout Support Meetup in the Park",
    imgSrc: "/static/images/calendar/burnout-support-meetup.png",
    href: "https://www.eventbrite.nl/e/burnout-support-meetup-in-the-park-tickets-1772509887789?aff=oddtdtcreator",
    description: `This meetup in the park is an extension of APP's Burnout Support Program, providing a cozy, safe environment to meet other local parents with past or present experiences in parental burnout. Bring yourself, your partner, and/or your child(ren) — all are welcome for this open meetup.`,
    date: new Date("25 October 2025"),
  },
  {
    title: "Vote for us in West Begroot",
    imgSrc: "/static/images/calendar/west-begroot-2025.png",
    href: "https://westbegroot.amsterdam.nl",
    description: `Vote for APP's West Begroot submission: Kring voor Ouderwelzijn, a monthly support group (with childcare!) for parents experiencing overwhelm and burnout. With enough votes, we'll be able to facilitate the group completely free for Amsterdam West residents!`,
    date: new Date("31 October 2025"),
    until: new Date("1 December 2025"),
  },
  {
    title: "Family Tour at the Rijksmuseum",
    imgSrc: "/static/images/calendar/rijksmuseum.jpg",
    href: "https://www.eventbrite.nl/e/family-tour-at-the-rijksmuseum-parents-children-from-0-4-years-old-tickets-1976387211352?aff=oddtdtcreator",
    description: `Meet fellow local parents and learn about the museum's most famous pieces — including those by Rembrandt and Vermeer — in the Gallery of Honor. The 1 hour tour is designed to flexibly meet your family's needs; step out to feed or change your baby at the museum's facilities and join back up with us when you're ready. After the tour, we'll likely head to the museum cafe to learn more from our expert guide and connect with the group.`,
    date: new Date("22 January 2026"),
  },
];

export default eventsData;

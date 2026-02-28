interface ScheduledSession {
  name: string;
  date?: Date;
  time?: string;
  location?: string;
}

export interface Schedule {
  title: string;
  slug?: string;
  dueDates?: string;
  start?: Date;
  end?: Date;
  discussions?: ScheduledSession[];
  socials?: ScheduledSession[];
  draft?: boolean;
}

const ftpCohortSchedules: Schedule[] = [
  {
    title: "Mar-May 2026",
    slug: "mar-2026",
    dueDates: "Jan-Feb 2026",
    start: new Date("1 Mar 2026"),
    end: new Date("31 May 2026"),
    draft: false,
    discussions: [
      {
        name: "Intro Call: Building Your Village",
        date: new Date("7 March 2026"),
        time: "10:00-11:15",
        location: "Online",
      },
      {
        name: "Newborn Feeding Strategies",
        date: new Date("21 March 2026"),
        time: "10:00-11:15",
        location: "Online",
      },
      {
        name: "Postpartum Identity",
        date: new Date("11 April 2026"),
        time: "10:00-11:15",
        location: "Online",
      },
      {
        name: "Postpartum Relationships",
        date: new Date("18 April 2026"),
        time: "10:00-11:15",
        location: "Online",
      },
      {
        name: "Postpartum Return",
        date: new Date("16 May 2026"),
        time: "10:00-11:15",
        location: "Online",
      },
    ],
    socials: [
      {
        name: "Walk in Vondelpark",
        date: new Date("12 March 2026"),
        time: "10:00-11:30",
        location: "Groot Melkhuis",
      },
      {
        name: "Newborn Play at Papote Cafe",
        date: new Date("26 March 2026"),
        time: "10:00-11:30",
        location: "Papote Cafe",
      },
      {
        name: "Family Reading Time",
        date: new Date("9 April 2026"),
        time: "10:00-11:30",
        location: "OBA",
      },
      {
        name: "Private Rijksmuseum Family Tour",
        location: "Rijksmuseum",
        time: "10:00-11:30",
        date: new Date("21 May 2026"),
      },
      {
        name: "Closing Reflections",
        date: new Date("30 May 2026"),
        time: "10:00-11:15",
        location: "Online",
      },
    ],
  },
  {
    title: "May-July 2026",
    slug: "may-2026",
    dueDates: "Mar-Apr 2026",
    start: new Date("1 May 2026"),
    end: new Date("31 July 2026"),
    draft: true,
    discussions: [
      {
        name: "Intro Call: Building Your Village",
        date: new Date("9 May 2026"),
      },
      { name: "Newborn Feeding Strategies", date: new Date("23 May 2026") },
      { name: "Postpartum Identity", date: new Date("13 June 2026") },
      { name: "Postpartum Relationships", date: new Date("4 July 2026") },
      { name: "Postpartum Return", date: new Date("18 July 2026") },
    ],
    socials: [
      { name: "Walk in Vondelpark", date: new Date("13 May 2026") },
      { name: "Newborn Play at Papote Cafe", date: new Date("4 June 2026") },
      {
        name: "Private Rijksmuseum Family Tour",
        date: new Date("25 June 2026"),
      },
      { name: "Family Reading Time", date: new Date("9 July 2026") },
      { name: "Closing Reflections", date: new Date("25 July 2026") },
    ],
  },
];

export default ftpCohortSchedules;

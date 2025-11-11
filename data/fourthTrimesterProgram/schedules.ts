interface ScheduledSession {
  name: string;
  date: Date;
}

interface Schedule {
  title: string;
  joinLink?: string;
  dueDates: string;
  start?: Date;
  end?: Date;
  discussions?: ScheduledSession[];
  socials?: ScheduledSession[];
}

const ftpCohortSchedules: Schedule[] = [
  {
    title: "Jan-Mar 2026",
    joinLink: "/jan-2026",
    dueDates: "Nov-Dec 2025",
    start: new Date("5 January 2026"),
    end: new Date("31 March 2026"),
    discussions: [
      { name: "Newborn Feeding Strategies", date: new Date("24 January 2026") },
      { name: "Postpartum Transformation", date: new Date("7 February 2026") },
      { name: "Postpartum Relationships", date: new Date("28 Feburary 2026") },
      { name: "Postpartum Return", date: new Date("21 March 2026") },
    ],
    socials: [
      { name: "Intros (online)", date: new Date("14 January 2026") },
      { name: "Walk in Vondelpark", date: new Date("29 January 2026") },
      { name: "Library & café chat", date: new Date("12 Feburary 2026") },
      { name: "Guided musueum tour", date: new Date("5 March 2026") },
      { name: "Closing reflections", date: new Date("26 March 2026") },
    ],
  },
  {
    title: "Mar-May 2026",
    joinLink: "/mar-2026",
    dueDates: "Jan-Feb 2026",
    start: new Date("1 Mar 2026"),
    end: new Date("31 May 2026"),
  },
];

export default ftpCohortSchedules;

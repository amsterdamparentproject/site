interface ScheduledSession {
  [topicTitle: string]: Date;
}

interface Schedule {
  title: string;
  dueDates: string;
  start?: Date;
  end?: Date;
  discussions?: ScheduledSession[];
  socials?: ScheduledSession[];
}

const ftpCohortSchedules: Schedule[] = [
  {
    title: "Jan-Mar 2026",
    dueDates: "Nov-Dec 2025",
    start: new Date("5 January 2026"),
    end: new Date("31 March 2026"),
    discussions: [
      { "Newborn Feeding Strategies": new Date("24 January 2026") },
      { "Postpartum Transformation": new Date("7 February 2026") },
      { "Postpartum Relationships & Community": new Date("28 Feburary 2026") },
      { "Postpartum Return": new Date("21 March 2026") },
    ],
    socials: [
      { "Intros (online)": new Date("14 January 2026") },
      { "Walk in Vondelpark": new Date("29 January 2026") },
      { "Library & café chat": new Date("12 Feburary 2026") },
      { "Guided musueum tour": new Date("5 March 2026") },
      { "Closing reflections (online)": new Date("26 March 2026") },
    ],
  },
  {
    title: "Mar-May 2026",
    dueDates: "Jan-Feb 2026",
    start: new Date("1 Mar 2026"),
    end: new Date("31 May 2026"),
  },
];

export default ftpCohortSchedules;

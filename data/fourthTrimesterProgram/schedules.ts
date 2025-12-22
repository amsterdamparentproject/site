interface ScheduledSession {
  name: string;
  date?: Date;
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
    draft: true,
    discussions: [
      { name: "Newborn Feeding Strategies" },
      { name: "Postpartum Transformation" },
      { name: "Postpartum Relationships" },
      { name: "Postpartum Return" },
    ],
    socials: [
      { name: "Intros (online)" },
      { name: "Walk in Vondelpark" },
      { name: "Library & café chat" },
      { name: "Guided musueum tour" },
      { name: "Closing reflections" },
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
      { name: "Newborn Feeding Strategies" },
      { name: "Postpartum Transformation" },
      { name: "Postpartum Relationships" },
      { name: "Postpartum Return" },
    ],
    socials: [
      { name: "Intros (online)" },
      { name: "Walk in Vondelpark" },
      { name: "Library & café chat" },
      { name: "Guided musueum tour" },
      { name: "Closing reflections" },
    ],
  },
];

export default ftpCohortSchedules;

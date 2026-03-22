interface Session {
  name: string;
  type: "Social" | "Discussion";
  date?: Date;
  time?: string;
  location?: string;
}

export interface Cohort {
  title: string;
  slug?: string;
  dueDates?: string;
  start?: Date;
  end?: Date;
  sessions?: Session[];
  draft?: boolean;
  groupStatus?: "Open" | "Last spots" | "Full";
}

const FTPCohorts: Cohort[] = [
  {
    title: "March-May 2026",
    slug: "mar-2026",
    dueDates: "Jan-Feb 2026",
    start: new Date("1 Mar 2026"),
    end: new Date("31 May 2026"),
    draft: false,
    groupStatus: "Full",
    sessions: [
      {
        name: "Intro Call: Building Your Village",
        date: new Date("7 March 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Newborn Feeding Strategies",
        date: new Date("21 March 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Postpartum Transformation",
        date: new Date("11 April 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Parenting with your People",
        date: new Date("18 April 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Postpartum Return",
        date: new Date("23 May 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Walk in Vondelpark",
        date: new Date("12 March 2026"),
        time: "10:00-11:30",
        location: "Groot Melkhuis",
        type: "Social",
      },
      {
        name: "Newborn Play at Papote Cafe",
        date: new Date("26 March 2026"),
        time: "10:00-11:30",
        location: "Papote Cafe",
        type: "Social",
      },
      {
        name: "Family Reading Time",
        date: new Date("9 April 2026"),
        time: "10:00-11:30",
        location: "OBA",
        type: "Social",
      },
      {
        name: "Private Rijksmuseum Family Tour",
        location: "Rijksmuseum",
        time: "10:00-11:30",
        date: new Date("21 May 2026"),
        type: "Social",
      },
      {
        name: "Closing Reflections",
        date: new Date("30 May 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Social",
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
    groupStatus: "Open",
    sessions: [
      {
        name: "Intro Call: Building Your Village",
        date: new Date("9 May 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Walk in Vondelpark",
        date: new Date("13 May 2026"),
        time: "10:00-11:30",
        location: "Groot Melkhuis",
        type: "Social",
      },
      {
        name: "Newborn Feeding Strategies",
        date: new Date("23 May 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Newborn Play at Papote Cafe",
        date: new Date("4 June 2026"),
        time: "10:00-11:30",
        location: "Papote Cafe",
        type: "Social",
      },
      {
        name: "Postpartum Transformation",
        date: new Date("13 June 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Private Rijksmuseum Family Tour",
        date: new Date("25 June 2026"),
        time: "10:00-11:30",
        location: "Rijksmuseum",
        type: "Social",
      },
      {
        name: "Parenting with your People",
        date: new Date("4 July 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Family Reading Time",
        date: new Date("9 July 2026"),
        time: "10:00-11:30",
        location: "OBA",
        type: "Social",
      },
      {
        name: "Postpartum Return",
        date: new Date("18 July 2026"),
        time: "10:00-11:15",
        location: "Online",
        type: "Discussion",
      },
      {
        name: "Closing Reflections",
        date: new Date("25 July 2026"),
        time: "10:00-11:30",
        location: "Online", // Or local cafe depending on group preference
        type: "Social",
      },
    ],
  },
  {
    title: "July-September 2026",
    slug: "jul-2026",
    dueDates: "May-Jun 2026",
    start: new Date("1 July 2026"),
    end: new Date("30 September 2026"),
    groupStatus: "Last spots",
    draft: true,
  },
  {
    title: "September-November 2026",
    slug: "sept-2026",
    dueDates: "Jul-Aug 2026",
    start: new Date("1 September 2026"),
    end: new Date("30 November 2026"),
    draft: true,
  },
];

export default FTPCohorts;

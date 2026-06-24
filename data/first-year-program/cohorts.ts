export interface FYPCohort {
  title: string;
  slug?: string;
  dueDates?: string;
  start?: Date;
  end?: Date;
  draft?: boolean;
  groupStatus?: "Open" | "Last spots" | "Full";
}

const FYPCohorts: FYPCohort[] = [
  {
    title: "Autumn/Winter 2026–2027",
    slug: "sept-2026",
    dueDates: "Jul–Dec 2026",
    start: new Date("1 Sep 2026"),
    end: new Date("28 Feb 2027"),
    draft: false,
    groupStatus: "Open",
  },
  {
    title: "Spring/Summer 2027",
    slug: "mar-2027",
    dueDates: "Jan–Jun 2027",
    start: new Date("1 Mar 2027"),
    end: new Date("31 Aug 2027"),
    draft: true,
    groupStatus: "Open",
  },
];

export default FYPCohorts;

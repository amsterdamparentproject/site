export const GROUP_CATEGORIES = [
  "Parenting",
  "Mom",
  "Dad",
  "Twin",
  "Neighborhood",
  "Age/due date",
  "Activities",
  "Language & country",
  "Buy & sell",
] as const;

export type GroupCategory = (typeof GROUP_CATEGORIES)[number];

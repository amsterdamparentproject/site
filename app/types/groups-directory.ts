// CATEGORIES

export const GROUP_CATEGORIES = [
  "Parenting",
  "Mom",
  "Dad",
  "Twin",
  "Neighborhood",
  "Age/Due date",
  "Activities",
  "Language & country",
  "Buy & sell",
  "Season",
] as string[];

export type GroupCategory = (typeof GROUP_CATEGORIES)[number];

// SEASON GROUPS
//
// Season Groups are ordinary directory.groups rows tagged with the "Season"
// category, plus a due_start/due_end date range (added directly in the db —
// see lib/supabase/migrations/013_season_groups.sql and
// __claude__/season-groups-join-flow.md for how rows get created and why
// the stored category is "Season" rather than "Season Groups"). "Season
// Groups" remains the product name used in all UI copy; "Season" is just
// the tag stored/matched in categories arrays.
export interface SeasonGroup {
  id: string;
  name: string;
  description: string | null;
  categories: string[];
  platform: string | null;
  due_start: string | null; // ISO date, e.g. "2026-06-01"
  due_end: string | null; // ISO date, e.g. "2026-07-31"
}

// A visitor's existing Directory profile, when /season-groups finds a
// valid app_uid cookie. Presence of this (vs. null) is what tells
// SeasonGroupSignupForm whether to merge into an existing account
// (updateUserProfile, instant) or request a new one (postRequestDirectory,
// emailed link) — see __claude__/season-groups-join-flow.md.
export interface SeasonGroupExistingProfile {
  uid: string;
  name: string;
  email: string;
  categories: string[];
}

// FORMS

// The common user fields shared by both modes
export interface UserInfo {
  userName?: string;
  userEmail?: string;
  userId?: string;
}

// Fields required ONLY when editing
export interface GroupDetails {
  name: string;
  link: string;
  categories: string;
  description: string;
}

// The specific "shapes" for info
export type AddFormInfo = UserInfo;
export type EditFormInfo = UserInfo & GroupDetails;
export type AddFormInfoNoAuth = Omit<AddFormInfo, "userName" | "userEmail">;

export interface ReportFormInfo {
  name: string;
  link: string;
}

// The union
export type AdminGroupsDirectoryFormProps =
  | {
      mode: "add";
      info: AddFormInfo | AddFormInfoNoAuth;
      onClose?: () => void;
    }
  | {
      mode: "edit";
      info: EditFormInfo;
      onClose?: () => void;
    };

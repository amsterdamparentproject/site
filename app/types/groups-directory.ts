// CATEGORIES

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

// FORMS

// The common user fields shared by both modes
export interface UserInfo {
  userName?: string;
  userEmail?: string;
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

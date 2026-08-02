import { splitName } from "./split-name";
import { monthYearFromDate } from "./months";

// Shapes a firstyear.ftp_legacy row into FYPJoinForm's prefill props.
// Deliberately takes only the three columns it needs (not the whole row)
// so the server-side lookup in app/programs/first-year/page.tsx has to be
// explicit about exactly what it selects and passes down — see that file's
// comment on why the lookup happens server-side rather than exposing these
// fields to the client via the URL (a privacy issue Alex flagged in an
// earlier version of this feature: PII in query strings ends up in browser
// history, server/CDN logs, and analytics tools).
export interface LegacyRowForPrefill {
  name: string;
  email: string;
  due_birth_date: string | null;
}

export interface LegacyPrefill {
  firstName: string;
  lastName: string;
  email: string;
  month?: string;
  year?: string;
}

export function toLegacyPrefill(row: LegacyRowForPrefill): LegacyPrefill {
  const { firstName, lastName } = splitName(row.name);
  const dueDate = row.due_birth_date
    ? monthYearFromDate(row.due_birth_date)
    : null;
  return {
    firstName,
    lastName,
    email: row.email,
    ...(dueDate ? { month: dueDate.month, year: dueDate.year } : {}),
  };
}

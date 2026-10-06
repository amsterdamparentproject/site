import { createServiceClient } from "@/lib/supabase/server";
import { CalendarEvent } from "@/lib/calendar";

export type { CalendarEvent } from "@/lib/calendar";
export { getEventDescription } from "@/lib/calendar";

type EventRow = {
  description: string | null;
  newsletter_description: string | null;
  title: string;
  tagline: string | null;
  url: string | null;
  start_date: string;
  end_date: string | null;
  file_url: string | null;
};

const toCalendarEvent = (row: EventRow): CalendarEvent => ({
  title: row.title,
  newsletter_description: row.newsletter_description,
  description: row.description,
  tagline: row.tagline,
  href: row.url ?? "/calendar",
  date: row.start_date,
  until: row.end_date ?? undefined,
  imgSrc: row.file_url ?? undefined,
});

const SELECT =
  "title, newsletter_description, description, tagline, url, start_date, end_date, file_url";

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = createServiceClient("activities");
  const { data, error } = await supabase
    .from("app_events")
    .select(SELECT)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch calendar events:", error.message);
    return [];
  }

  return (data ?? []).map(toCalendarEvent);
}

// MVP-style filter: "counts" as a First Year Program event if the title
// contains "First Year Program" (case-insensitive). No services/tags
// column yet — see the lib/fyp/ area for the more durable version of
// this once Desk grows a real FYP service flag. Deliberately narrow (title
// only, next 5, upcoming only) since this is a quick test of whether
// showing real dates actually helps the "what's happening now" problem
// before investing further.
export async function getFirstYearProgramEvents(): Promise<CalendarEvent[]> {
  const supabase = createServiceClient("activities");
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("app_events")
    .select(SELECT)
    .ilike("title", "%First Year Program%")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(5);

  if (error) {
    console.error("Failed to fetch First Year Program events:", error.message);
    return [];
  }

  return (data ?? []).map(toCalendarEvent);
}

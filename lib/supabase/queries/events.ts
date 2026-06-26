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

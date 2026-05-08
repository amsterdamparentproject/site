import { createServiceClient } from "@/lib/supabase/server";
import { CalendarEvent } from "@/data/eventsData";

type EventRow = {
  title: string;
  description: string;
  url: string | null;
  start_date: string;
  end_date: string | null;
  file_url: string | null;
};

const toCalendarEvent = (row: EventRow): CalendarEvent => ({
  title: row.title,
  description: row.description,
  href: row.url ?? "/calendar",
  date: row.start_date,
  until: row.end_date ?? undefined,
  imgSrc: row.file_url ?? undefined,
});

const SELECT = "title, description, url, start_date, end_date, file_url";

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = createServiceClient("activities");
  const { data, error } = await supabase
    .from("events")
    .select(SELECT)
    .eq("calendar_skip", false)
    .eq("organization", "Amsterdam Parent Project")
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch calendar events:", error.message);
    return [];
  }

  return (data ?? []).map(toCalendarEvent);
}

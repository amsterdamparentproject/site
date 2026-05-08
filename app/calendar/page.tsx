import { genPageMetadata } from "app/seo";
import CalendarClient from "./CalendarClient";
import { getCalendarEvents } from "@/lib/supabase/queries/events";

export const revalidate = 3600;

export const metadata = genPageMetadata({
  title: "Calendar",
  description: "Upcoming and past APP events and programs",
});

export default async function CalendarPage() {
  const events = await getCalendarEvents();
  return <CalendarClient events={events} />;
}

import { genPageMetadata } from "app/seo";
import CalendarClient from "./CalendarClient";

export const metadata = genPageMetadata({
  title: "Calendar",
  description: "Upcoming and past APP events and programs",
});

export default function CalendarPage() {
  return <CalendarClient />;
}

import { genPageMetadata } from "app/seo";
import CalendarClient from "./CalendarClient";

export const metadata = genPageMetadata({ title: "Events & Programs" });

export default function CalendarPage() {
  return <CalendarClient />;
}

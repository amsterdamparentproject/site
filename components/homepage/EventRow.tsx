import { Calendar } from "lucide-react";
import { formatDate } from "pliny/utils/formatDate";
import Link from "../Link";
import { getEventDescription } from "@/lib/calendar";

export const EventRow = ({ event, locale }) => {
  return (
    <Link
      href={event.href || "/calendar"}
      className="flex gap-4 group"
      data-umami-event={`Home: Event - ${event.title}`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-soft-green dark:bg-brand-soft-charcoal dark:text-brand-goldenrod flex items-center justify-center text-brand-white group-hover:text-brand-goldenrod dark:group-hover:text-brand-violet transition-colors">
        <Calendar className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-brand-soft-green dark:text-brand-goldenrod group-hover:text-brand-goldenrod dark:group-hover:text-brand-violet transition-colors">
          {event.title}
        </p>
        <p className="text-sm italic text-brand-soft-charcoal dark:text-brand-white">
          {event.comingSoon ? "Coming Soon" : formatDate(event.date, locale)}
          {event.until && ` — ${formatDate(event.until, locale)}`}
        </p>
        <p className="text-sm text-brand-soft-charcoal dark:text-brand-white line-clamp-2">
          {getEventDescription(event)}
        </p>
      </div>
    </Link>
  );
};

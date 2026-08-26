import type { CalendarEvent } from "@/lib/calendar";
import { getEventDescription } from "@/lib/calendar";

// MVP "what's happening now" strip — deliberately simple (no accordion, no
// interactivity) so it's fast to build and easy to rip out if it doesn't
// actually help. Filter logic lives in
// lib/supabase/queries/events.ts's getFirstYearProgramEvents(): a plain
// title match against app_events, nothing fancier yet.
//
// Renders nothing if there are no upcoming matches (e.g. before any events
// have been tagged/titled correctly) rather than showing an empty section.

interface UpcomingNowProps {
  events: CalendarEvent[];
}

function formatEventDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function UpcomingNow({ events }: UpcomingNowProps) {
  if (events.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto mb-10 px-4">
      <div className="flex items-center gap-2 mb-4 justify-center">
        <span className="w-2 h-2 rounded-full bg-brand-soft-green animate-pulse" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-soft-green dark:text-brand-goldenrod">
          Happening soon in the program
        </h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 md:justify-center md:flex-wrap">
        {events.map((event, i) => {
          const description = getEventDescription(event);
          return (
            <a
              key={i}
              href={event.href}
              target={event.href.startsWith("http") ? "_blank" : undefined}
              rel={
                event.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="shrink-0 w-64 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal p-4 hover:border-brand-soft-green transition-colors"
            >
              <p className="text-xs font-bold text-brand-goldenrod mb-1">
                {formatEventDate(event.date)}
              </p>
              <p className="text-sm font-bold text-brand-charcoal dark:text-brand-white leading-snug">
                {event.title}
              </p>
              {description && (
                <p className="text-xs text-brand-soft-charcoal/70 dark:text-brand-white/60 mt-2 leading-relaxed line-clamp-2">
                  {description}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

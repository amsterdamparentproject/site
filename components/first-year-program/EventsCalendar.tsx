import type { CalendarEvent } from "@/lib/calendar";
import { ExternalLink } from "lucide-react";

// ---------------------------------------------------------------------------
// EventsCalendar
//
// Real month-grid calendar for "what's happening" — replaces the earlier
// UpcomingNow horizontal card strip inside the new AccessToday section for
// baby-here visitors. Groups the (already server-fetched, upcoming-only,
// max 5) First Year Program events by calendar month and renders one grid
// per month that actually has an event, marking those days. A short list of
// the events themselves sits under each grid (date, title, blurb) — the
// grid alone can't carry a title, and the list alone doesn't read as "a
// calendar" the way the proposal asked for.
// ---------------------------------------------------------------------------

interface EventsCalendarProps {
  events: CalendarEvent[];
}

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// A "Go to event" link only makes sense for a real, dated event. The
// standing Postpartum Post reminder below links out to a general info page
// instead, so it needs its own link text — hence this local extension
// rather than adding an APP-Desk-only field to the shared CalendarEvent
// type.
interface DisplayEvent extends CalendarEvent {
  linkLabel?: string;
}

// Standing reminder shown on the 7th of every displayed month — not a real
// APP Desk event (easier to hardcode this recurring one than add it there
// every month), just a nudge toward the 1:1 parent-matching platform that's
// included with the program.
const STANDING_DAY = 7;

function buildStandingEvent(year: number, monthIdx: number): DisplayEvent {
  const month = String(monthIdx + 1).padStart(2, "0");
  const day = String(STANDING_DAY).padStart(2, "0");
  return {
    title: "Get your local parent match",
    newsletter_description: null,
    description: null,
    tagline: null,
    date: `${year}-${month}-${day}`,
    href: "https://postpartumpost.com",
    linkLabel: "Learn more about Postpartum Post",
  };
}

interface MonthGroup {
  year: number;
  monthIdx: number; // 0-11
  events: CalendarEvent[];
}

// Event dates come from a Postgres `date` column ("YYYY-MM-DD") — parse at
// local midnight (not UTC) since we only ever read local getters
// (getDate/getDay/getMonth) back off it here.
function parseDateOnly(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

function groupEventsByMonth(events: CalendarEvent[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const event of events) {
    const d = parseDateOnly(event.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = groups.get(key);
    if (existing) {
      existing.events.push(event);
    } else {
      groups.set(key, {
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        events: [event],
      });
    }
  }
  return Array.from(groups.values()).sort(
    (a, b) => a.year - b.year || a.monthIdx - b.monthIdx,
  );
}

function formatEventDate(dateStr: string): string {
  return parseDateOnly(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function MonthGrid({ group }: { group: MonthGroup }) {
  const { year, monthIdx, events } = group;
  const monthName = new Date(year, monthIdx, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const displayEvents: DisplayEvent[] = [
    ...events,
    buildStandingEvent(year, monthIdx),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const eventsByDay = new Map<number, DisplayEvent[]>();
  for (const event of displayEvents) {
    const day = parseDateOnly(event.date).getDate();
    const existing = eventsByDay.get(day);
    if (existing) existing.push(event);
    else eventsByDay.set(day, [event]);
  }

  const firstOfMonth = new Date(year, monthIdx, 1);
  // getDay(): 0=Sun..6=Sat — shift to a Monday-first grid (0=Mon..6=Sun).
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal p-5 md:p-6 w-full max-w-sm md:max-w-2xl">
      {/* Calendar grid on the left, event list on the right on desktop —
          there's plenty of horizontal room and stacking them wasted it.
          Stays stacked (grid on top, list below a horizontal divider) on
          mobile, where there isn't room for two columns. */}
      <div className="flex flex-col md:flex-row md:items-start gap-5 md:gap-8">
        <div className="md:w-60 md:shrink-0">
          <h4 className="text-center text-sm font-bold text-brand-charcoal dark:text-brand-white mb-4">
            {monthName}
          </h4>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="text-[10px] font-bold text-brand-charcoal/40 dark:text-brand-white/30"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const hasEvent = day !== null && eventsByDay.has(day);
              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center rounded-full text-xs ${
                    day === null
                      ? ""
                      : hasEvent
                        ? "bg-brand-soft-green text-white font-bold"
                        : "text-brand-charcoal/60 dark:text-brand-white/50"
                  }`}
                >
                  {day ?? ""}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2 border-t md:border-t-0 md:border-l border-brand-sand/30 pt-4 md:pt-0 md:pl-8">
          {displayEvents.map((event, i) => (
            <a
              key={i}
              href={event.href}
              target={event.href.startsWith("http") ? "_blank" : undefined}
              rel={
                event.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="block rounded-lg hover:bg-brand-soft-green/5 -mx-2 px-2 py-1.5 transition-colors"
            >
              <p className="text-[11px] font-bold text-brand-goldenrod">
                {formatEventDate(event.date)}
              </p>
              <p className="text-xs font-medium text-brand-charcoal dark:text-brand-white leading-snug">
                {event.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-brand-soft-green dark:text-brand-goldenrod">
                {event.linkLabel ?? "Go to event"}
                <ExternalLink size={11} className="shrink-0" />
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventsCalendar({ events }: EventsCalendarProps) {
  if (events.length === 0) return null;
  const groups = groupEventsByMonth(events);

  return (
    <div className="w-full">
      <h3 className="text-center text-md font-bold text-brand-goldenrod mb-4">
        Here's what's coming next
      </h3>
      <div className="flex flex-col items-center gap-6">
        {groups.map((group) => (
          <MonthGrid key={`${group.year}-${group.monthIdx}`} group={group} />
        ))}
      </div>
    </div>
  );
}

import type { CalendarEvent } from "@/lib/calendar";
import type { Situation } from "@/lib/fyp/situation";
import EventsCalendar from "@/components/first-year-program/EventsCalendar";

// ---------------------------------------------------------------------------
// AccessToday
//
// "You immediately get" — a plain checklist rather than the card grid this
// used to be (Alex asked for something simpler here). Everyone gets the
// same three things regardless of situation — see IMMEDIATE_FEATURES in
// FYPJoinForm.tsx, which this mirrors.
//
// The events calendar used to only show for baby-here visitors; it now
// always shows (when there are events to show), with the header copy
// adapting instead — expecting visitors get a "once your baby arrives"
// framing rather than losing the calendar entirely, so they can see what's
// coming.
// ---------------------------------------------------------------------------

interface AccessTodayProps {
  situation: Situation;
  events: CalendarEvent[];
}

const IMMEDIATE_ITEMS = [
  "💬 Private chat with local families similarly committed to building community",
  "🩺 Ask our expert facilitators anything, anytime",
  "👋🏻 A social 1:1 match with a parent nearby at the start of each month",
  "📚 Our 7 evidence- and Amsterdam-based guides on feeding, sleep, back to work, and more",
];

function Checkmark() {
  return (
    <svg
      className="w-4 h-4 text-brand-soft-green dark:text-brand-goldenrod shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AccessToday({ situation, events }: AccessTodayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-brand-soft-green dark:text-brand-goldenrod mb-3">
          You and your partner both immediately get:
        </h3>
        <ul className="inline-flex flex-col items-start gap-2 mx-auto text-left">
          {IMMEDIATE_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-brand-charcoal dark:text-brand-white/80"
            >
              <Checkmark />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {events.length > 0 && (
        <div className="mt-10">
          <h3 className="text-center text-lg font-bold text-brand-soft-green dark:text-brand-goldenrod mb-3">
            {situation === "baby_here"
              ? "Join our upcoming events:"
              : "After your baby arrives, join us for events:"}
          </h3>
          <EventsCalendar events={events} />
        </div>
      )}
    </div>
  );
}

"use client";

import eventsData, { CalendarEvent } from "@/data/eventsData";
import Card from "@/components/Card";
import { genPageMetadata } from "app/seo";
import ShowcaseButton from "@/components/ShowcaseButton";
import siteMetadata from "@/data/siteMetadata";
import Link from "@/components/Link";

import { useMemo } from "react";

export const metadata = genPageMetadata({ title: "Events & Programs" });

// --- Types & Interfaces ---
type EnhancedEvent = CalendarEvent & { dateObj: Date };

// --- Logic Helpers ---
const processEvents = (events: CalendarEvent[]) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const current: CalendarEvent[] = [];
  const past: CalendarEvent[] = [];

  events.forEach((event) => {
    // Current if it's today/future OR marked as comingSoon
    if (event.date >= todayStr || event.comingSoon) {
      current.push(event);
    } else {
      past.push(event);
    }
  });

  return {
    // Sort current ascending (soonest first)
    current: current.sort((a, b) => a.date.localeCompare(b.date)),
    // Sort past descending (most recent first)
    past: past.sort((a, b) => b.date.localeCompare(a.date)),
  };
};

const groupEventsByMonth = (events: CalendarEvent[]) => {
  const groups: { [key: string]: CalendarEvent[] } = {};

  events.forEach((event) => {
    const date = new Date(event.date);
    const monthYear = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(event);
  });

  return groups;
};

const PastEventsList = ({ events }: { events: CalendarEvent[] }) => {
  if (events.length === 0) return null;
  const groupedEvents = groupEventsByMonth(events);

  return (
    <section className="w-full mt-6 px-4">
      {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
        <div key={monthYear} className="mb-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-soft-green dark:text-brand-sand">
            {monthYear}
          </h3>
          <ul className="space-y-3 ml-1 pl-6">
            {monthEvents.map((event, idx) => (
              <li
                key={idx}
                className="relative text-brand-charcoal dark:text-brand-soft-charcoal"
              >
                <span className="absolute -left-[27px] top-2 h-2 w-2 rounded-full bg-brand-sand"></span>
                <b>
                  <Link
                    href={event.href}
                    className="text-brand-charcoal hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green"
                  >
                    {event.title}
                  </Link>
                </b>
                <span className="text-brand-soft-charcoal dark:text-brand-white">
                  : {event.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};

export default function Events() {
  const { current, past, groupedPast } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // 1. Single-pass Filter
    const currentList: CalendarEvent[] = [];
    const pastList: CalendarEvent[] = [];

    eventsData.forEach((event) => {
      if (event.date >= todayStr || event.comingSoon) {
        currentList.push(event);
      } else {
        pastList.push(event);
      }
    });

    // 2. Sort
    currentList.sort((a, b) => a.date.localeCompare(b.date));
    pastList.sort((a, b) => b.date.localeCompare(a.date));

    // 3. Efficient Grouping (using a Month Array to avoid heavy Intl calls)
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const groups: { [key: string]: CalendarEvent[] } = {};
    pastList.forEach((event) => {
      const [year, month] = event.date.split("-"); // Fast string split
      const monthName = months[parseInt(month) - 1];
      const key = `${monthName} ${year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });

    return { current: currentList, past: pastList, groupedPast: groups };
  }, []);

  return (
    <>
      <div>
        <div className="pt-6 pb-6 flex flex-col items-center">
          <h1 className="text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
            Calendar
          </h1>
        </div>
        <div className="flex flex-col items-center space-y-2 pt-4 pb-8 md:space-y-5">
          <h2 className="text-3xl text-center font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod">
            Community Calendar
          </h2>
          <p className="max-w-sm text-center mb-4">
            Your daily calendar reference for local events, activities, and
            programs happening for babies, toddlers, and their parents in
            Amsterdam.
          </p>
          <ShowcaseButton
            key="community-calendar-google"
            href={siteMetadata.communityCalendar.google}
            title="Add to Google Calendar"
            fill={true}
            umamiName="Calendar: Add to Google Calendar"
          />
          <ShowcaseButton
            key="community-calendar-iCal"
            href={siteMetadata.communityCalendar.iCal}
            title="Add to iCal"
            fill={true}
            umamiName="Calendar: Add to iCal"
          />
          <p className="text-sm italic text-center mt-2 mb-6">
            Maintained for free by the Amsterdam Parent Project
          </p>
          <ShowcaseButton
            key="community-calendar-submit"
            href="/calendar/submit-event"
            title="Submit your own event"
            background="highlight"
            umamiName="Calendar: Submit event"
          />
        </div>
        <div className="container pt-4 pb-6">
          <h2 className="text-3xl text-center font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod mb-6">
            Upcoming @ APP
          </h2>
          <div className="-m-4 flex flex-wrap">
            {current.map((event) => (
              <Card
                key={event.title + event.date}
                title={event.title}
                description={event.description}
                date={event.date}
                until={event.until}
                imgSrc={event.imgSrc || "/static/images/web-share.png"}
                href={event.href}
                comingSoon={event.comingSoon}
              />
            ))}
          </div>
          <h2 className="mt-12 text-3xl text-center font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod mb-6">
            Past @ APP
          </h2>
          <div className="-m-4 flex flex-wrap">
            <PastEventsList events={past} />
          </div>
        </div>
      </div>
    </>
  );
}

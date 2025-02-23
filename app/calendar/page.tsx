import eventsData from "@/data/eventsData";
import Card from "@/components/Card";
import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "Events & Programs" });

const sortEvents = (events) => {
  return events.sort((a, b) => {
    if (a.date < b.date) {
      return -1;
    }
    if (a.date > b.date) {
      return 1;
    }
    return 0;
  });
};

const getEventsByType = (events) => {
  return {
    current: sortEvents(
      events.filter((event) => {
        const today = new Date();
        return event.date > today;
      }),
    ),
    past: sortEvents(
      events.filter((event) => {
        const today = new Date();
        return event.date < today;
      }),
    ),
    comingSoon: events.filter((event) => event.comingSoon),
  };
};

const allEvents = getEventsByType(eventsData);

export default function Events() {
  return (
    <>
      <div>
        <div className="space-y-2 pt-6 pb-8 md:space-y-5 flex flex-col items-center">
          <h1 className="text-brand-charcoal dark:text-brand-white text-4xl font-extrabold tracking-tight md:text-6xl md:leading-14">
            Calendar
          </h1>
          <p className="text-lg leading-7 text-brand-soft-charcoal dark:text-brand-white">
            APP events and programs
          </p>
        </div>
        <div className="container pt-4 pb-6">
          <h2 className="text-3xl font-bold leading-7 text-brand-soft-charcoal dark:text-brand-white mb-6">
            Upcoming
          </h2>
          <div className="-m-4 flex flex-wrap">
            {allEvents.current.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.description}
                date={d.date}
                imgSrc={d.imgSrc ? d.imgSrc : "/static/images/web-share.png"}
                href={d.href}
                comingSoon={d.comingSoon}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

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
  const today = new Date();

  const comingUp = events.filter(
    (event) => event.date >= today || event.until >= today,
  );
  const comingSoon = events.filter((event) => event.comingSoon);

  return {
    current: sortEvents(comingUp.concat(comingSoon)),
    past: sortEvents(
      events.filter((event) => {
        const today = new Date();
        return event.date < today;
      }),
    ),
  };
};

const allEvents = getEventsByType(eventsData);

export default function Events() {
  return (
    <>
      <div>
        <div className="pt-6 pb-6 flex flex-col items-center">
          <h1 className="text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
            Calendar
          </h1>
          <h2 className="text-brand-soft-charcoal dark:text-brand-white text-lg font-medium tracking-tight my-2">
            APP events & programs
          </h2>
        </div>
        <div className="container pt-4 pb-6">
          <h2 className="text-3xl font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod mb-6">
            Upcoming
          </h2>
          <div className="-m-4 flex flex-wrap">
            {allEvents.current.map((d) => (
              <Card
                key={d.title + d.date}
                title={d.title}
                description={d.description}
                date={d.date}
                until={d.until}
                imgSrc={d.imgSrc ? d.imgSrc : "/static/images/web-share.png"}
                href={d.href}
                comingSoon={d.comingSoon}
              />
            ))}
          </div>
          <h2 className="mt-12 text-3xl font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod mb-6">
            Past
          </h2>
          <div className="-m-4 flex flex-wrap">
            {allEvents.past.map((d) => (
              <Card
                key={d.title + d.date}
                title={d.title}
                description={d.description}
                date={d.date}
                until={d.until}
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

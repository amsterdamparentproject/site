import eventsData from "@/data/eventsData";
import Card from "@/components/Card";
import { genPageMetadata } from "app/seo";
import ShowcaseButton from "@/components/ShowcaseButton";
import siteMetadata from "@/data/siteMetadata";

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

  const comingUp = events.filter((event) => event.date >= today);
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
          />
          <ShowcaseButton
            key="community-calendar-iCal"
            href={siteMetadata.communityCalendar.iCal}
            title="Add to iCal"
            fill={true}
          />
          <ShowcaseButton
            key="community-calendar-submit"
            href="/calendar/submit-event"
            title="Submit your own event"
            fill={true}
          />
          <p className="text-sm italic text-center mt-4">
            Maintained for free by the Amsterdam Parent Project
          </p>
        </div>
        <div className="container pt-4 pb-6">
          <h2 className="text-3xl text-center font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod mb-6">
            Upcoming @ APP
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
          <h2 className="mt-12 text-3xl text-center font-bold leading-7 text-brand-soft-green dark:text-brand-goldenrod mb-6">
            Past @ APP
          </h2>
          <div className="-m-4 flex flex-wrap">
            {allEvents.past.reverse().map((d) => (
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

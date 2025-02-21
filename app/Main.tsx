import Logo from "@/components/Logo";
import Link from "@/components/Link";
import { formatDate } from "pliny/utils/formatDate";
import ShowcaseButton from "@/components/ShowcaseButton";
import siteMetadata from "@/data/siteMetadata";
import eventsData from "@/data/eventsData";

const getCurrentEvents = (events) => {
  return events.filter((event) => {
    const today = new Date();
    return event.date > today;
  });
};

const createEventList = (events, MAX_DISPLAY = 3) => {
  let currentEvents = getCurrentEvents(events);

  currentEvents = currentEvents.sort((a, b) => {
    if (a.date < b.date) {
      return -1;
    }
    if (a.date > b.date) {
      return 1;
    }
    return 0;
  });

  const comingSoonEvents = events.filter((event) => {
    return event.comingSoon;
  });

  if (currentEvents.length < MAX_DISPLAY) {
    const comingSoonFillers = comingSoonEvents.slice(
      0,
      MAX_DISPLAY - currentEvents.length,
    );
    return currentEvents.concat(comingSoonFillers);
  } else {
    return currentEvents;
  }
};

export default function Home({ posts }) {
  const latestPost = posts[0];
  const { slug, date, title } = latestPost;
  const latestPostUrl = `/blog/${slug}`;

  return (
    <>
      <div className="flex-column justify-center divide-y divide-gray-200 dark:divide-gray-700">
        <div
          key="container"
          className="flex flex-col items-center space-y-2 pt-6 pb-8 md:space-y-5"
        >
          <Logo size="100" style="hidden md:block" />
          <div className="h-6 text-2xl pt-0 mb-8 text-brand-charcoal font-semibold sm:hidden">
            {siteMetadata.headerTitle}
          </div>
          <h2 className="text-md mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            What's next
          </h2>
          {createEventList(eventsData).map((event) => (
            <ShowcaseButton
              key={event.title}
              href={event.href ? event.href : "/calendar"}
              title={event.title}
              date={event.date}
              comingSoon={event.comingSoon}
            />
          ))}
          <div className="flex justify-end text-base leading-6 font-medium">
            <Link
              href="/calendar"
              className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
              aria-label="All events"
            >
              See all &rarr;
            </Link>
          </div>

          <h2 className="text-md mt-6 mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            Latest expert advice
          </h2>
          <ShowcaseButton
            href={latestPostUrl}
            title={title}
            date={formatDate(date, siteMetadata.locale)}
          />
          <div className="flex justify-end text-base leading-6 font-medium">
            <Link
              href="/blog"
              className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
              aria-label="All advice"
            >
              See all &rarr;
            </Link>
          </div>

          <h2 className="text-md mt-6 mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            Follow us
          </h2>
          <ShowcaseButton
            href="/subscribe"
            title="Subscribe to our newsletter"
          />
          <ShowcaseButton href={siteMetadata.instagram} title="Instagram" />
          <ShowcaseButton href={siteMetadata.roadmap} title="Public roadmap" />
        </div>
      </div>
    </>
  );
}

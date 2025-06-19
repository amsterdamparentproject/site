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

const getCurrentPrograms = (programs) => {
  return programs.filter((program) => {
    const today = new Date();
    return program.until > today;
  });
};

const createEventList = (events, MAX_DISPLAY = 3) => {
  const currentPrograms = getCurrentPrograms(events);
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
    return currentPrograms.concat(currentEvents.concat(comingSoonFillers));
  } else {
    return currentPrograms.concat(currentEvents);
  }
};

export default function Home({ posts }) {
  const latestPost = posts[0];
  const { slug, date, title } = latestPost;
  const latestPostUrl = `/advice/${slug}`;

  return (
    <>
      <div className="flex-column justify-center divide-y divide-gray-200 dark:divide-gray-700">
        <div
          key="container"
          className="flex flex-col items-center space-y-2 pt-2 pb-8 md:space-y-5"
        >
          <Logo size="100" style="hidden sm:block" />
          <div className="h-6 text-2xl/5 pt-0 mb-8 text-brand-charcoal dark:text-brand-white font-semibold sm:hidden text-center">
            {siteMetadata.headerTitle}
          </div>

          <h2 className="text-md mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            What's next
          </h2>
          {createEventList(eventsData).map((event) => (
            <ShowcaseButton
              key={event.title + event.date}
              href={event.href ? event.href : "/calendar"}
              title={event.title}
              date={event.date}
              until={event.until}
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

          <h2 className="text-md mt-2 mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            Our programs
          </h2>
          <ShowcaseButton
            key={"bsp"}
            href={"/programs/burnout"}
            title={"Burnout Support Program"}
          />
          <ShowcaseButton
            key={"ftp"}
            href={"/programs/fourth-trimester"}
            title={"Fourth Trimester Program"}
          />

          <h2 className="text-md mt-6 mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            Latest post
          </h2>
          <ShowcaseButton
            key={title}
            href={latestPostUrl}
            title={title}
            date={formatDate(date, siteMetadata.locale)}
          />
          <div className="flex justify-end text-base leading-6 font-medium">
            <Link
              href="/advice"
              className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
              aria-label="All advice"
            >
              See all &rarr;
            </Link>
          </div>

          <h2 className="text-md mt-4 mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            Follow us
          </h2>
          <ShowcaseButton href="/newsletter" title="Newsletter" newTab={true} />
          <ShowcaseButton href={siteMetadata.instagram} title="Instagram" />
          <ShowcaseButton href={siteMetadata.roadmap} title="Public roadmap" />
        </div>
      </div>
    </>
  );
}

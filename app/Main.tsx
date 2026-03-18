import Logo from "@/components/Logo";
import Link from "@/components/Link";
import { formatDate } from "pliny/utils/formatDate";
import ShowcaseButton from "@/components/ShowcaseButton";
import siteMetadata from "@/data/siteMetadata";
import eventsData from "@/data/eventsData";

const createEventList = (events, MAX_DISPLAY = 3) => {
  const today = new Date();

  // 1. Convert strings to Dates and filter in one go
  const comingUp = events
    .map((event) => ({ ...event, dateObj: new Date(event.date) })) // Temporary date object for logic
    .filter((event) => event.dateObj >= today)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()); // Sort by the actual time

  // 2. Handle "Coming Soon" fillers
  if (comingUp.length < MAX_DISPLAY) {
    const comingSoon = events.filter((event) => event.comingSoon);
    const needed = MAX_DISPLAY - comingUp.length;

    // Combine and return
    return comingUp.concat(comingSoon.slice(0, needed));
  }

  return comingUp.slice(0, MAX_DISPLAY);
};

export default function Home({ posts }) {
  const upcomingEvents = createEventList(eventsData);

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
          <div>
            <p className="text-center max-w-md">
              We're a{" "}
              <span className="text-brand-goldenrod font-bold">
                nonprofit, parent-powered
              </span>{" "}
              (and expert-supported!) organization that runs{" "}
              <Link
                href="/programs/fourth-trimester"
                className="text-brand-soft-green font-bold hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-white"
                aria-label="fourth-tri-tagline"
                data-umami-event="Tagline: Fourth Trimester Program"
              >
                postpartum support groups
              </Link>
              , family events, and a local activities{" "}
              <Link
                href="/subscribe"
                className="text-brand-soft-green font-bold hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-white"
                aria-label="subscribe-tagline"
                data-umami-event="Tagline: Subscribe"
              >
                newsletter
              </Link>{" "}
              to help families with babies and toddlers thrive in Amsterdam.
            </p>
            <p className="mb-4 font-medium text-center mt-1">
              <Link
                href="/about"
                className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
                aria-label="about-tagline"
                data-umami-event="Tagline: About"
              >
                About us &rarr;
              </Link>
            </p>
          </div>

          <h2 className="text-md mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            What's next
          </h2>
          {createEventList(upcomingEvents).map((event) => (
            <ShowcaseButton
              key={event.title + event.date}
              href={event.href ? event.href : "/calendar"}
              title={event.title}
              date={event.date}
              until={event.until}
              comingSoon={event.comingSoon}
              umamiName={"Main: Event"}
            />
          ))}
          <div className="flex justify-end text-base leading-6 font-medium">
            <Link
              href="/calendar"
              className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
              aria-label="All events"
              data-umami-event="Main: See all events"
            >
              See all &rarr;
            </Link>
          </div>

          <h2 className="text-md mt-2 mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            What we do
          </h2>
          <ShowcaseButton
            key={"ftp"}
            href={"/programs/fourth-trimester"}
            title={"Fourth Trimester Program"}
            umamiName={"Main: Fourth Trimester Program"}
          />
          <ShowcaseButton
            key={"groups-directory"}
            href={"/groups-directory/access"}
            title={"Amsterdam Parent Groups Directory"}
            umamiName={"Main: Request Groups Directory Access"}
          />
          <ShowcaseButton
            href="/calendar"
            title="Family Events"
            umamiName={"Main: Calendar"}
          />
          <ShowcaseButton
            key={"bsp"}
            href={"/programs/burnout"}
            title={"Burnout Support Program"}
            umamiName={"Main: Burnout Support Program"}
          />

          <h2 className="text-md mt-6 mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            Latest post
          </h2>
          <ShowcaseButton
            key={title}
            href={latestPostUrl}
            title={title}
            date={formatDate(date, siteMetadata.locale)}
            umamiName="Main: Latest post"
          />
          <div className="flex justify-end text-base leading-6 font-medium">
            <Link
              href="/advice"
              className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
              aria-label="All advice"
              data-umami-event="Main: See all posts"
            >
              See all &rarr;
            </Link>
          </div>

          <h2 className="text-md mt-4 mb-2 font-bold text-brand-soft-green dark:text-brand-goldenrod">
            Follow us
          </h2>
          <ShowcaseButton
            href="/newsletter"
            title="Newsletter"
            newTab={true}
            umamiName={"Main: Newsletter"}
          />
          <ShowcaseButton
            href={siteMetadata.instagram}
            title="Instagram"
            umamiName={"Main: Instagram"}
          />
        </div>
      </div>
    </>
  );
}

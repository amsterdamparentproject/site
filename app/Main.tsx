import Logo from "@/components/Logo";
import Link from "@/components/Link";
import { formatDate } from "pliny/utils/formatDate";
import ShowcaseButton from "@/components/ShowcaseButton";
import siteMetadata from "@/data/siteMetadata";
import eventsData from "@/data/eventsData";

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

const createEventList = (events, MAX_DISPLAY = 3) => {
  const today = new Date();

  const comingUp = sortEvents(events.filter((event) => event.date >= today));
  const comingSoon = events.filter((event) => event.comingSoon);

  if (comingUp.length < MAX_DISPLAY) {
    const comingSoonFillers = comingSoon.slice(
      0,
      MAX_DISPLAY - comingUp.length,
    );
    return comingUp.concat(comingSoonFillers);
  } else {
    return comingUp;
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
          <p className="text-center max-w-md mb-8">
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
            to help families find their grounding here in Amsterdam.
          </p>

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
            Our programs
          </h2>
          <ShowcaseButton
            key={"ftp"}
            href={"/programs/fourth-trimester"}
            title={"Fourth Trimester Program"}
            umamiName={"Main: Fourth Trimester Program"}
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
          <ShowcaseButton
            href="/calendar"
            title="Calendar"
            umamiName={"Main: Calendar"}
          />
        </div>
      </div>
    </>
  );
}

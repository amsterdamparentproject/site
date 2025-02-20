import Logo from "@/components/Logo";
import Link from "@/components/Link";
import { formatDate } from "pliny/utils/formatDate";
import ShowcaseButton from "@/components/ShowcaseButton";
import siteMetadata from "@/data/siteMetadata";
import eventsData from "@/data/eventsData";

const MAX_DISPLAY = 3;

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
          {/* <h1 className="justify-center text-2xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Amsterdam Parent Project
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p> */}
          <h2 className="text-md mb-2 font-bold text-brand-charcoal dark:text-brand-goldenrod">
            Upcoming events & programs
          </h2>
          {eventsData.slice(0, MAX_DISPLAY).map((event) => (
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
              className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-white dark:hover:text-brand-goldenrod"
              aria-label="All events"
            >
              See all &rarr;
            </Link>
          </div>

          <h2 className="text-md mt-6 mb-2 font-bold text-brand-charcoal dark:text-brand-goldenrod">
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
              className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-white dark:hover:text-brand-goldenrod"
              aria-label="All advice"
            >
              See all &rarr;
            </Link>
          </div>

          <h2 className="text-md mt-6 mb-2 font-bold text-brand-charcoal dark:text-brand-goldenrod">
            Follow us
          </h2>
          <ShowcaseButton href={siteMetadata.instagram} title="Instagram" />
          <ShowcaseButton href={siteMetadata.roadmap} title="Public roadmap" />
        </div>
      </div>
    </>
  );
}

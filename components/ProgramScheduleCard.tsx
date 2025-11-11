import siteMetadata from "@/data/siteMetadata";
import Link from "./Link";
import { formatDate } from "pliny/utils/formatDate";

const formatSessions = (sessions) => {
  return (
    <div>
      <ul className="flex flex-col pl-4 list-disc sm:space-x-1 xl:space-y-1 xl:space-x-0">
        {sessions.map((session) => (
          <li key={session.name}>
            <p className="text-sm text-brand-charcoal">{session.name}</p>
            <span className="text-xs text-brand-soft-green dark:text-brand-dark-sand">
              {formatDate(session.date, siteMetadata.locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

function Card(args) {
  const { title, joinLink, dueDates, discussions, socials, showSchedule } =
    args;

  const joinHref = joinLink
    ? `/programs/fourth-trimester{joinLink}`
    : "/programs/fourth-trimester/join";

  return (
    <div className="pr-4 pl-4 pt-4 sm:w-1/2 min-w-80">
      <div
        className={`overflow-hidden rounded-md border border-brand-sand/60 dark:border-brand-soft-charcoal/60`}
      >
        <div className="bg-brand-soft-green pt-6 pb-2 px-4">
          <h2 className="text-2xl leading-6 mb-1 font-bold tracking-tight text-brand-white">
            {title} Cohort
          </h2>
          {dueDates && (
            <p className="mb-3 text-sm italic text-brand-white">
              For babies due in {dueDates}
            </p>
          )}
          <p className="mb-2">
            <Link
              href={"/programs/fourth-trimester" + joinLink}
              className="text-base leading-6 font-medium text-brand-goldenrod hover:text-brand-white"
              aria-label="jan-2026"
            >
              Join this cohort &rarr;
            </Link>
          </p>
        </div>

        {showSchedule && (
          <div className="p-4">
            {discussions && (
              <div>
                <h3 className="mb-3 font-bold">Discussions:</h3>
                {formatSessions(discussions)}
              </div>
            )}
            {socials && (
              <div>
                <h3 className="mt-6 mb-3 font-bold">Socials:</h3>
                {formatSessions(socials)}
              </div>
            )}
            {!discussions && !socials && (
              <p className="italic text-sm text-brand-soft-charcoal dark:text-brand-white">
                Full cohort schedule will be released soon
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;

import { formatDate } from "pliny/utils/formatDate";
import Image from "./Image";
import Link from "./Link";
import siteMetadata from "@/data/siteMetadata";
import { allAuthors, Authors } from "contentlayer/generated";

function Card(args) {
  const {
    title,
    description,
    details,
    imgSrc,
    href,
    date,
    until,
    comingSoon,
    hostName,
    components,
  } = args;

  const host = allAuthors.find((p) => p.slug === hostName) as Authors;

  let dateElement;
  if (comingSoon) {
    dateElement = (
      <p className="prose mb-3 max-w-none text-brand-soft-charcoal dark:text-brand-white">
        {"Coming Soon"}
      </p>
    );
  } else if (date && until) {
    dateElement = (
      <p className="prose mb-3 max-w-none text-brand-soft-charcoal dark:text-brand-white">
        {formatDate(date, siteMetadata.locale)} -{" "}
        {formatDate(until, siteMetadata.locale)}
      </p>
    );
  } else if (date) {
    dateElement = (
      <p className="prose mb-3 max-w-none text-brand-soft-charcoal dark:text-brand-white">
        {formatDate(date, siteMetadata.locale)}
      </p>
    );
  } else {
    dateElement = "";
  }

  return (
    <div className="p-4">
      <div
        className={`${
          imgSrc
        } overflow-hidden rounded-md border border-brand-sand/60 dark:border-brand-soft-charcoal/60 flex flex-row`}
      >
        <div className="w-30 object-cover object-center bg-[url(/static/images/programs/fourth-trimester-program/feeding-strategies-banner.png)]"></div>
        <div className="p-6">
          <h2 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
            {href ? (
              <Link href={href} aria-label={`Link to ${title}`}>
                {title}
              </Link>
            ) : (
              title
            )}
          </h2>
          {dateElement}
          {href && (
            <Link
              href={href}
              className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green text-base leading-6 font-medium"
              aria-label={`Link to ${title}`}
            >
              Reserve your spot &rarr;
            </Link>
          )}
          <p className="prose mb-3 text-sm text-italic max-w-none text-brand-soft-charcoal dark:text-brand-white">
            {description}
          </p>
          {details && (
            <p className="prose mb-3 max-w-none text-brand-soft-charcoal dark:text-brand-white">
              {details}
            </p>
          )}
          {hostName && (
            <div>
              <p className="mb-2 text-sm">Hosted by:</p>
              <ul className="flex flex-wrap gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0 mb-4">
                <li className="flex space-x-2" key={host.name}>
                  {host.avatar && (
                    <Image
                      src={host.avatar}
                      width={30}
                      height={30}
                      alt="avatar"
                      className="h-18 w-18 rounded-full"
                    />
                  )}
                  <div className="flex flex-col ml-2 text-sm">
                    <dl className="leading-5" />
                    <dt className="sr-only">Name</dt>
                    <dd className="dark:text-brand-white">{host.name}</dd>
                    <dt className="sr-only">Title</dt>
                    <dd className="text-brand-soft-charcoal dark:text-brand-white">
                      {host.occupation}
                    </dd>
                    <dt className="sr-only">Website</dt>
                    <dd>
                      {host.website && (
                        <Link
                          href={host.website}
                          className="text-brand-soft-green hover:text-brand-goldenrod"
                        >
                          {"Website"}
                        </Link>
                      )}
                    </dd>
                  </div>
                </li>
              </ul>
            </div>
          )}
          {components && (
            <div className="text-brand-soft-charcoal dark:text-brand-white text-sm">
              <p>In this session:</p>
              <ul className="list-disc mx-4">
                {components.map((component) => (
                  <li key={component.name}>{component}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;

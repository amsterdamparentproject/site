import { formatDate } from "pliny/utils/formatDate";
import Image from "./Image";
import Link from "./Link";
import siteMetadata from "@/data/siteMetadata";

function Card(args) {
  const { title, description, imgSrc, href, date, until, comingSoon } = args;

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
    <div className="md max-w-[544px] p-4 md:w-1/2">
      <div
        className={`${
          imgSrc && "h-full"
        } overflow-hidden rounded-md border border-brand-sand/60 dark:border-brand-soft-charcoal/60`}
      >
        {imgSrc &&
          (href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              <Image
                alt={title}
                src={imgSrc}
                className="object-cover object-center md:h-36 lg:h-48"
                width={544}
                height={306}
              />
            </Link>
          ) : (
            <Image
              alt={title}
              src={imgSrc}
              className="object-cover object-center md:h-36 lg:h-48"
              width={544}
              height={306}
            />
          ))}
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
          <p className="prose mb-3 max-w-none text-brand-soft-charcoal dark:text-brand-white">
            {description}
          </p>
          {href && (
            <Link
              href={href}
              className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green text-base leading-6 font-medium"
              aria-label={`Link to ${title}`}
            >
              Learn more &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;

import { formatDate } from "pliny/utils/formatDate";
import Image from "./Image";
import Link from "./Link";
import siteMetadata from "@/data/siteMetadata";

function Card(args) {
  const { title, description, imgSrc, href, date, comingSoon } = args;

  let dateElement;
  if (comingSoon) {
    dateElement = (
      <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
        {"Coming Soon"}
      </p>
    );
  } else if (date) {
    dateElement = (
      <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
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
        } overflow-hidden rounded-md border-2 border-gray-200/60 dark:border-gray-700/60`}
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
          <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
            {description}
          </p>
          {href && (
            <Link
              href={href}
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
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

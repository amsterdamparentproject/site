import siteMetadata from "@/data/siteMetadata";
import Link from "next/link";
import { formatDate } from "pliny/utils/formatDate";

function ShowcaseButton(args) {
  const { href, title, date, comingSoon, newTab } = args;

  let dateElement;
  if (comingSoon) {
    dateElement = <p className="text-xs sm:text-sm">{"Coming Soon"}</p>;
  } else if (date) {
    dateElement = (
      <p className="text-xs sm:text-sm">
        {formatDate(date, siteMetadata.locale)}
      </p>
    );
  } else {
    dateElement = "";
  }

  return (
    <Link href={href} className="mb-2" target={newTab ? "_blank" : ""}>
      <button
        type="button"
        className="
          py-4 px-8
          ml:40
          mr:10
          text-xl/5
          md:text-2xl/5
          rounded-full
          bg-brand-white
          text-brand-charcoal
          border border-brand-sand
          hover:bg-brand-soft-green
          hover:border-brand-soft-green
          hover:text-brand-white
          dark:bg-brand-charcoal
          dark:text-brand-white
          dark:border-brand-soft-charcoal
          dark:hover:bg-brand-soft-charcoal
          dark:hover:border-brand-soft-charcoal
          dark:hover:text-brand-white

          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-300
          w-80 sm:w-xl
          "
      >
        {title}
        {dateElement}
      </button>
    </Link>
  );
}

export default ShowcaseButton;

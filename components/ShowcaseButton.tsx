import siteMetadata from "@/data/siteMetadata";
import Link from "next/link";
import { formatDate } from "pliny/utils/formatDate";

function ShowcaseButton(args) {
  const { href, title, date, until, comingSoon, newTab, fill } = args;

  let dateElement;
  if (comingSoon) {
    dateElement = <p className="text-xs sm:text-sm">{"Coming Soon"}</p>;
  } else if (date && until) {
    dateElement = (
      <p className="text-xs sm:text-sm">
        {formatDate(date, siteMetadata.locale)} -{" "}
        {formatDate(until, siteMetadata.locale)}
      </p>
    );
  } else if (date) {
    dateElement = (
      <p className="text-xs sm:text-sm">
        {formatDate(date, siteMetadata.locale)}
      </p>
    );
  } else {
    dateElement = "";
  }

  const buttonStyle = `
    py-4 px-8
    ml:40
    mr:10
    text-xl/5
    md:text-2xl/5
    rounded-full
    cursor-pointer
    focus:outline-none focus:ring-0
    w-80 sm:w-xl
  `;

  const transparentStyle = `
    border
    bg-brand-white
    text-brand-charcoal
    border-brand-sand/60
    hover:bg-brand-soft-green
    hover:border-brand-soft-green
    hover:text-brand-white
    dark:bg-brand-charcoal 
    dark:text-brand-white
    dark:border-brand-soft-charcoal/60
    dark:hover:bg-brand-soft-charcoal
    dark:hover:border-brand-soft-charcoal
    dark:hover:text-brand-white
  `;

  const fillStyle = `
    border
    bg-brand-soft-green
    border-brand-soft-green
    text-brand-white
    hover:bg-brand-charcoal
    dark:bg-brand-soft-charcoal 
    dark:text-brand-white
    dark:hover:bg-brand-soft-green
    dark:border-brand-soft-charcoal
  `;

  const backgroundColor = fill ? fillStyle : transparentStyle;

  return (
    <Link href={href} className="mb-2" target={newTab ? "_blank" : ""}>
      <button type="button" className={buttonStyle + backgroundColor}>
        {title}
        {dateElement}
      </button>
    </Link>
  );
}

export default ShowcaseButton;

const defaultStyle =
  "hover:text-brand-soft-green dark:hover:text-brand-goldenrod m-1 font-medium text-brand-charcoal dark:text-brand-white";
const highlightStyle =
  "text-brand-soft-green dark:text-brand-goldenrod m-1 font-medium hover:text-brand-goldenrod dark:hover:text-brand-soft-green";
const headerNavLinks = [
  { href: "/", title: "Home", style: defaultStyle },
  {
    href: "/journey",
    title: "Your support journey",
    style: defaultStyle,
    umamiEvent: "Header: Journey",
  },
  {
    href: "/newsletter",
    title: "Newsletter",
    style: defaultStyle,
    newTab: true,
    prefetch: false,
    umamiEvent: "Header: Newsletter",
  },
  {
    href: "/donate",
    title: "Donate",
    style: highlightStyle,
    umamiEvent: "Header: Donate",
  },
];

export default headerNavLinks;

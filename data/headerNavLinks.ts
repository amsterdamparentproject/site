const defaultStyle =
  "hover:text-brand-soft-green dark:hover:text-brand-goldenrod m-1 font-medium text-brand-charcoal dark:text-brand-white";
const highlightStyle =
  "text-brand-soft-green dark:text-brand-goldenrod m-1 font-medium hover:text-brand-goldenrod dark:hover:text-brand-soft-green";
const headerNavLinks = [
  { href: "/", title: "Home", style: defaultStyle },
  { href: "/about", title: "About", style: defaultStyle },
  { href: "/calendar", title: "Calendar", style: defaultStyle },
  {
    href: "/newsletter",
    title: "Newsletter",
    style: defaultStyle,
    newTab: true,
  },
  { href: "/donate", title: "Donate", style: highlightStyle },
];

export default headerNavLinks;

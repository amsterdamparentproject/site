import Link from "@/components/Link";
import NewsletterCard from "@/components/homepage/NewsletterCard";

export default function HighlightSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="order-2 md:order-1 bg-brand-sand/40 dark:bg-brand-sand/10 rounded-3xl p-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
          Postpartum Post
        </h2>
        <p className="text-brand-charcoal dark:text-brand-white mb-6">
          Meet a new or expecting parent each month, plus local things to do
          together
        </p>
        <Link
          href="https://postpartumpost.com"
          className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors"
          data-umami-event="Highlight: Postpartum Post"
        >
          Get introduced
        </Link>
      </div>

      {/* Newborn support — 1st on mobile, 2nd on desktop */}
      <div className="order-1 md:order-2 bg-brand-soft-green/15 dark:bg-brand-violet/10 rounded-3xl p-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
          First Year Program
        </h2>
        <p className="text-brand-charcoal dark:text-brand-white mb-6">
          The whole family support system built for pregnancy through your
          baby's first year
        </p>
        <Link
          href="/programs/first-year"
          className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors"
          data-umami-event="Highlight: First Year Program"
        >
          Join the program
        </Link>
      </div>

      {/* Groups directory — 3rd on both */}
      <div className="order-3 bg-brand-goldenrod/15 dark:bg-brand-soft-green/10 rounded-3xl p-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
          Parent Groups Directory
        </h2>
        <p className="text-brand-charcoal dark:text-brand-white mb-6">
          Discover your local parent communities: 80+ groups and counting
        </p>
        <Link
          href="/groups-directory"
          className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors"
          data-umami-event="Highlight: Groups Directory"
        >
          Find your groups
        </Link>
      </div>
    </div>
  );
}

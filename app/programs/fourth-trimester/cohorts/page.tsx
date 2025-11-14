import { genPageMetadata } from "app/seo";
import Link from "@/components/Link";
import Card from "@/components/ProgramScheduleCard";
import cohortSchedules from "@/data/fourthTrimesterProgram/schedules";

export const metadata = genPageMetadata({
  title: "Fourth Trimester Program cohorts",
});

export default function Page() {
  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col items-center space-y-2 pt-6 md:space-y-5">
        <p className="text-2xl font-extrabold text-brand-soft-green dark:text-brand-goldenrod text-center">
          Join the Fourth Trimester Program
        </p>
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
          Choose your cohort
        </h1>
      </div>
      <div>
        <p className="text-center italic mt-8">
          Don't see your due date? Fill out our
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
            className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green"
          >
            {" "}
            interest form
          </a>{" "}
          to be notified of future cohorts.
        </p>
      </div>

      <div className="flex flex-row flex-wrap justify-center mt-2">
        {cohortSchedules.map((schedule) => (
          <Card
            key={schedule.title}
            title={schedule.title}
            slug={schedule.slug ? schedule.slug : ""}
            dueDates={schedule.dueDates}
            discussions={schedule.discussions}
            socials={schedule.socials}
            showSchedule={true}
          />
        ))}
      </div>

      <div className="mt-6 text-center">
        <h2 className="mt-2 mb-2 text-xl text-brand-soft-green dark:text-brand-goldenrod">
          Navigate:
        </h2>
        <Link
          href="/programs/fourth-trimester"
          className="text-base leading-6 font-medium text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
          aria-label="jan-2026"
        >
          Back to program info &rarr;
        </Link>
      </div>
    </div>
  );
}

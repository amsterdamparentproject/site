import Script from "next/script";
import { genPageMetadata } from "app/seo";
import Link from "@/components/Link";
import cohortSchedules, {
  Schedule,
} from "@/data/fourthTrimesterProgram/schedules";
import FTPCohortCard from "@/components/FTPCohortCard";

export const metadata = genPageMetadata({
  title: "Join the Fourth Trimester Program",
});

function PricingTable() {
  const pricingTableID = "prctbl_1SRvzSQXyrloqZVhejYo4mim";
  const publishableKey =
    "pk_live_51SPjE2QXyrloqZVh2slle48bZ0dI3Ud73x4180eRaszI8PZwlJNQi4Jk5wwz2LEhnywF8Z1RoCRw9S4icO9yKSOK00IvDsDylL";

  return (
    <div className="lg:w-5xl dark:m-6 p-2 lg:pt-4 rounded rounded-md bg-brand-white">
      <Script
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="lazyOnload"
      />

      {/* @ts-ignore: Property 'stripe-pricing-table' does not exist on type 'JSX.IntrinsicElements'. */}
      <stripe-pricing-table
        pricing-table-id={pricingTableID}
        publishable-key={publishableKey}
      />
    </div>
  );
}

function CohortSelection() {
  return (
    <div>
      <div className="flex flex-row flex-wrap justify-center mt-4">
        {cohortSchedules.map((schedule) => (
          <FTPCohortCard
            key={schedule.title}
            title={schedule.title}
            slug={schedule.slug ? schedule.slug : ""}
            dueDates={schedule.dueDates}
            discussions={schedule.discussions}
            socials={schedule.socials}
            showJoin={true}
            showSchedule={false}
          />
        ))}
      </div>

      <div>
        <p className="text-center italic mt-6">
          Don't see your due date? Fill out our
          <Link
            href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
            className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green"
            aria-label="interest-form"
          >
            {" "}
            interest form
          </Link>{" "}
          to be notified of future cohorts.
        </p>
      </div>
    </div>
  );
}

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { cohort } = searchParams;

  const defaultCohort: Schedule = { title: "Find your" };
  const cohortDetails =
    cohortSchedules.find((c) => c.slug === cohort) ?? defaultCohort;

  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
        <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
          Join the Fourth Trimester Program
        </p>
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
          {cohortDetails?.title} cohort
        </h1>
        <p className="mt-4">
          Your{" "}
          <b className="dark:text-brand-goldenrod text-brand-soft-green">
            neighborhood support system in the first months postpartum
          </b>
          , designed for families with {cohortDetails.dueDates} newborns.
          Expert-led discussions and curated socials with local newborn parents
          to help you transition with confidence to new parenthood.
          <Link
            href="/programs/fourth-trimester"
            className="text-base leading-6 font-medium italic text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-white"
            aria-label="jan-2026"
          >
            &nbsp;Learn more about the program &rarr;
          </Link>
        </p>
      </div>
      {!cohort && CohortSelection()}

      {cohort && (
        <div className="flex flex-col items-center">
          <div>
            <PricingTable />
          </div>

          {cohortDetails.start && cohortDetails.end && (
            <div className="mt-4">
              <h2 className="text-center mb-2 text-xl text-brand-goldenrod">
                Cohort schedule:
              </h2>
              <FTPCohortCard
                key={cohortDetails.title}
                title={cohortDetails.title}
                slug={cohortDetails.slug ? cohortDetails.slug : ""}
                dueDates={cohortDetails.dueDates}
                discussions={cohortDetails.discussions}
                socials={cohortDetails.socials}
                showJoin={false}
                showSchedule={true}
                draft={cohortDetails.draft}
              />
            </div>
          )}
          {cohortDetails && (
            <div>
              <p className="max-w-md mt-6 text-brand-charcoal dark:text-brand-white">
                Our schedule is <b>designed to reduce FOMO</b>! Whether you're
                traveling or just can't get out of bed, you can join our expert
                discussions online. If your baby is being fussy that morning,
                you're welcome to come late to one of our socials. Come as you
                are; we're here to meet you.
              </p>
              <p className="max-w-md mt-4 italic text-sm text-brand-charcoal dark:text-brand-white">
                Please note: The schedule may change before the start of the
                cohort.
              </p>
              {cohortDetails.dueDates && (
                <p className="text-center text-sm mt-4 md:mb-2">
                  Not due in {cohortDetails.dueDates}?
                  <br />
                  <Link
                    href="/programs/fourth-trimester/join"
                    className="dark:text-brand-goldenrod dark:hover:text-brand-soft-green text-brand-soft-green hover:text-brand-goldenrod"
                    aria-label="cohort-selection"
                  >
                    <span>Select another cohort &rarr;</span>
                  </Link>
                </p>
              )}
            </div>
          )}

          <div className="text-center max-w-md mt-8">
            <h2 className="mb-2 text-xl text-brand-goldenrod">
              Where your program fees are going:
            </h2>
            <p>
              <span>
                <b>To experts</b>: 62% /{" "}
              </span>
              <span>
                <b>To socials</b>: 20% /{" "}
              </span>
              <span>
                <b>To operations</b>: 18%
              </span>
            </p>
            <p className="mt-4">
              Each cohort costs €966 to run. We first cover costs, then we use
              the remainder to support program development and other APP
              initiatives.
            </p>
            <p className="mt-4 italic text-sm">
              APP is committed to transparency and accessibility. If you have
              concerns about our pricing model or need financial assistance,
              please reach out to us.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

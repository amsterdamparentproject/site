import Script from "next/script";
import { genPageMetadata } from "app/seo";
import Link from "@/components/Link";

export const metadata = genPageMetadata({
  title: "Join the Fourth Trimester Program",
});

function PricingTable() {
  const pricingTableID = "prctbl_1SRvzSQXyrloqZVhejYo4mim";
  const publishableKey =
    "pk_live_51SPjE2QXyrloqZVh2slle48bZ0dI3Ud73x4180eRaszI8PZwlJNQi4Jk5wwz2LEhnywF8Z1RoCRw9S4icO9yKSOK00IvDsDylL";

  return (
    <div className="lg:w-5xl m-6 mt-4 p-2 lg:pt-4 rounded rounded-md bg-brand-white border border-1 border-brand-sand/60 dark:border-brand-soft-charcoal/60">
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
        <h2 className="text-brand-soft-charcoal dark:text-brand-white text-center text-lg font-medium tracking-tight mb-2">
          <b className="text-brand-soft-green dark:text-brand-goldenrod">
            Your local support system in the first 3 months postpartum.
          </b>{" "}
          Socials and expert-led discussions to build your village, reduce
          overwhelm, and transition with confidence into new parent life.
        </h2>
      </div>
      <div className="flex flex-col items-center mt-6">
        <div className="mt-4 text-base leading-6 font-medium">
          <Link
            href="/programs/fourth-trimester/jan-2026"
            className="text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
            aria-label="jan-2026"
          >
            Nov/Dec 2025 due dates &rarr;
          </Link>
        </div>
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

import Script from "next/script";
import { genPageMetadata } from "app/seo";
import Link from "@/components/Link";

export const metadata = genPageMetadata({
  title: "Join the Mar 2026 FTP cohort",
});

function PricingTable() {
  const pricingTableID = "prctbl_1SRvzSQXyrloqZVhejYo4mim";
  const publishableKey =
    "pk_live_51SPjE2QXyrloqZVh2slle48bZ0dI3Ud73x4180eRaszI8PZwlJNQi4Jk5wwz2LEhnywF8Z1RoCRw9S4icO9yKSOK00IvDsDylL";

  return (
    <div className="lg:w-5xl m-6 mt-6 p-2 lg:pt-4 rounded rounded-md bg-brand-white border border-1 border-brand-sand/60 dark:border-brand-soft-charcoal/60">
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
          Mar-May 2026 cohort
        </h1>
        <p className="text-center">
          Your{" "}
          <b className="dark:text-brand-goldenrod text-brand-soft-green">
            neighborhood support system in the first months postpartum
          </b>
          , designed for families with January/February 2026 newborns.
          Expert-led discussions and curated socials with local newborn parents
          in the neighborhood to help you transition with confidence to new
          parenthood.
        </p>
        <p className="text-sm">
          Not due in January/February 2026?{" "}
          <a
            href="/programs/fourth-trimester/join"
            className="dark:text-brand-goldenrod dark:hover:text-brand-soft-green text-brand-soft-green hover:text-brand-goldenrod"
          >
            Join another cohort &rarr;
          </a>
        </p>
      </div>
      <div className="flex flex-col items-center mt-6">
        <div>
          <PricingTable />
        </div>

        <div className="text-center max-w-md">
          <h2 className="mt-2 mb-2 text-xl text-brand-soft-green dark:text-brand-goldenrod">
            Where your program fees are going:
          </h2>
          <p>
            <b>To experts</b>: 62% / <b>To socials</b>: 20% /{" "}
            <b>To operations</b>: 18%
          </p>
          <p className="mt-4">
            Each cohort costs €966 to run. We first cover costs, then we use the
            remainder to support program development and other APP initiatives.
          </p>
          <p className="mt-4 italic text-sm">
            APP is committed to transparency and accessibility. If you have
            concerns about our pricing model or need financial assistance,
            please reach out to us.
          </p>
        </div>

        <div className="mt-6 text-center">
          <h2 className="mt-2 mb-2 text-xl text-brand-soft-green dark:text-brand-goldenrod">
            Navigate:
          </h2>
          <Link
            href="/programs/fourth-trimester/join"
            className="text-base leading-6 font-medium text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
            aria-label="cohort-selection"
          >
            Select another cohort &rarr;
          </Link>
          <br />
          <Link
            href="/programs/fourth-trimester"
            className="text-base leading-6 font-medium text-brand-charcoal hover:text-brand-soft-green dark:text-brand-white dark:hover:text-brand-goldenrod"
            aria-label="program-info"
          >
            Learn more about the program &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

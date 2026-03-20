import { genPageMetadata } from "app/seo";
import Link from "@/components/Link";
import FTPCohorts from "@/data/fourthTrimesterProgram/cohorts";
import CohortsTable from "@/components/fourth-trimester-program/CohortsTable";
import Image from "@/components/Image";

export const metadata = genPageMetadata({
  title: "Join the Fourth Trimester Program",
  openGraph: {
    images: [
      `${process.env.BASE_PATH || ""}/static/images/web-share/fourth-trimester-program.png`,
    ],
  },
});

export default async function Page() {
  return (
    <div className="flex-column justify-center">
      <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
        <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
          Join the Fourth Trimester Program
        </p>
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
          Find your cohort
        </h1>
        <p className="mt-4">
          Your{" "}
          <b className="dark:text-brand-goldenrod text-brand-soft-green">
            neighborhood support system in the first months postpartum
          </b>
          , designed for families with newborns. Expert-led discussions and
          curated socials with local newborn parents to help you transition with
          confidence to new parenthood.
          <Link
            href="/programs/fourth-trimester"
            className="text-base leading-6 font-medium italic text-brand-soft-green hover:text-brand-soft-green dark:text-brand-goldenrod"
            aria-label="jan-2026"
          >
            &nbsp;Learn more about the program &rarr;
          </Link>
        </p>
      </div>

      <div>
        <CohortsTable cohorts={FTPCohorts} />
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

      <div className="flex flex-col items-center">
        <Image
          src="/static/images/programs/fourth-trimester-program/rijks-pilot.png"
          width={400}
          height={400}
          alt="rijksmuseum social"
          className="m-4"
        />
      </div>
    </div>
  );
}

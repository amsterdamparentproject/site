import { Suspense } from "react";
import { genPageMetadata } from "app/seo";
import GoToHubButton from "./GoToHubButton";

export const metadata = genPageMetadata({
  title: "Welcome to the First Year Program",
  robots: {
    index: false,
    follow: false,
  },
});

export default function FirstYearWelcomePage() {
  return (
    <div className="flex-column justify-center mx-2">
      <div
        className="pt-6 pb-6 flex flex-col items-center"
        id="program-description"
      >
        <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
          <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
            Welcome to the
          </p>
          <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
            First Year Program
          </h1>
          <p className="mt-4 max-w-xl">
            <b className="dark:text-brand-goldenrod text-brand-soft-green">
              We're so excited that you're joining us!
            </b>{" "}
            This program is a labor of community love, and when our community
            grows our heart grows ❤️
          </p>
          <p className="max-w-xl">
            We'll be in touch over email with next steps. While you get settled
            in, head on over to your First Year Hub to add and update the family
            members joining us and access program resources.
          </p>
          <Suspense fallback={null}>
            <GoToHubButton />
          </Suspense>
          <p className="max-w-xl">
            Have questions? Happy to answer them at{" "}
            <a
              href="mailto:hello@amsterdamparentproject.nl"
              className="text-brand-soft-green dark:text-brand-goldenrod font-medium underline"
            >
              hello@amsterdamparentproject.nl
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

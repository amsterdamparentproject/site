import { genPageMetadata } from "app/seo";
import FTPSessionCard from "@/components/FTPSessionCard";
import sessionData from "@/data/fourthTrimesterProgram/sessions";

export const metadata = genPageMetadata({
  title: "Welcome to the Fourth Trimester Program",
});

export default function page() {
  const session = sessionData.find((s) => s.title === "Building the Village");

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
            Fourth Trimester Program
          </h1>
          <p className="mt-4 max-w-xl">
            <b className="dark:text-brand-goldenrod text-brand-soft-green">
              We're so excited that you're joining us!
            </b>{" "}
            This nonprofit program is a labor of community love, and when our
            community grows our heart grows ❤️
          </p>
          <p className="max-w-xl">
            While you wait for the cohort to start, here's our guide on building
            your postpartum village. It covers both formal and informal support
            systems for you and your newborn. We’ll dive into it during our
            intro call, with plenty of time for your questions!
          </p>
          {session && (
            <div className="flex justify-center w-full">
              <div className="text-left">
                <FTPSessionCard
                  key={session.title}
                  title={session.title}
                  description={session.description}
                  subtitle={session.subtitle}
                  experts={session.experts}
                  components={session.components}
                  downloadFile="/guides/fourth-trimester-program/building-the-village.pdf"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

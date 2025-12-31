import { genPageMetadata } from "app/seo";
import SubmitEventForm from "@/components/SubmitEventForm";

export const metadata = genPageMetadata({ title: "Submit an event" });

export default function Page() {
  return (
    <div>
      <div className="pt-6 pb-6 flex flex-col items-center">
        <h1 className="text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
          Calendar
        </h1>
      </div>
      <div className="flex flex-col items-center space-y-2 md:pt-4 pb-8 md:space-y-5">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-soft-green dark:text-brand-goldenrod text-center mb-4 max-w-sm md:max-w-xl">
          Submit an event to our
          <br />
          Community Calendar
        </h2>
        <p className="max-w-xl text-center mb-4">
          Want to share an event for babies, toddlers, and/or their parents
          happening Amsterdam? Enter the details below and we'll add it to our
          Community Calendar. We may also highlight your event in our
          newsletter!
        </p>

        <p className="max-w-xl text-center italic text-sm mb-6">
          Please review the{" "}
          <a
            href="#event-requirements"
            className="text-brand-goldenrod hover:text-brand-soft-green"
          >
            requirements
          </a>{" "}
          before submitting. If your event does not meet the requirements, we
          will not add it to our calendar or newsletter.
        </p>

        <div className="w-full max-w-lg my-4">
          <SubmitEventForm />
        </div>

        <div className="max-w-lg px-3">
          <h2 className="font-bold text-xl" id="event-requirements">
            Event requirements
          </h2>
          <ol className="list-decimal">
            <li className="mt-4 ml-4">
              <b>Target audience:</b> Babies & toddlers ages 0-4 years old (or
              their parents!)
            </li>
            <li className="mt-4 ml-4">
              <b>Location:</b> Amsterdam, the Netherlands
            </li>
            <li className="mt-4 ml-4">
              <b>Inclusive:</b> Welcoming to all types of families, including
              those of different races, cultures, genders, sexualities,
              abilities, and more.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

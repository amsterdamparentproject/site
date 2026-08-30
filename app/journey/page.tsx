import { genPageMetadata } from "app/seo";
import JourneyStory from "@/components/journey/JourneyStory";
import SupportGrid from "@/components/journey/SupportGrid";

export const metadata = genPageMetadata({
  title: "Your Support Journey",
  description:
    "See how APP's programs — Postpartum Post, the Parent Groups Directory, the First Year Program, and our newsletter — fit together across pregnancy, newborn, baby, and toddlerhood.",
});

export default function Page() {
  return (
    <div className="flex flex-col items-center px-2 w-full max-w-full">
      {/* Hero */}
      <div className="flex flex-col text-center items-center space-y-2 pt-6 pb-4 md:space-y-5">
        <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
          Pregnancy through toddlerhood
        </p>
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
          Your support journey
        </h1>
        <p className="mt-4 mb-2 text-lg max-w-xl">
          APP isn't just one program — it's a set of overlapping supports that
          shift as your family grows. Here's how they fit together.
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 mt-10">
        <JourneyStory />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 mt-20 mb-16">
        <h2 className="text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod mb-10">
          At a glance
        </h2>
        <SupportGrid />
      </div>
    </div>
  );
}

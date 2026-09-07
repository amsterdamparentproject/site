"use client";
import { useState } from "react";
import { Stethoscope, Users, Microscope } from "lucide-react";
import Link from "@/components/Link";
import SpotlightSubmitForm from "@/components/SpotlightSubmitForm";
import {
  spotlightTypes,
  spotlightTypeCopy,
  spotlightArchiveHref,
  type SpotlightType,
} from "@/data/spotlights/questions";

type RecentPost = { title: string; href: string };

// Same round icon-badge treatment as the homepage's ResourceRow
// (components/homepage/ResourceRow.tsx) — Microscope matches the icon
// already used for Dear Dr. Mom on the homepage.
const spotlightIcons: Record<SpotlightType, React.ReactNode> = {
  dearDrMom: <Microscope className="w-5 h-5" />,
  expert: <Stethoscope className="w-5 h-5" />,
  community: <Users className="w-5 h-5" />,
};

const archiveLabel: Record<SpotlightType, string> = {
  dearDrMom: "See previous articles",
  expert: "See previous posts",
  community: "See previous posts",
};

const ContributeFlow = ({
  recentDearDrMom,
}: {
  recentDearDrMom: RecentPost[];
}) => {
  const [type, setType] = useState<SpotlightType>(spotlightTypes[0]);
  const [started, setStarted] = useState(false);

  return (
    <>
      <div className="max-w-3xl w-full px-4 mx-4">
        <p className="block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-3">
          What are you sharing?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {spotlightTypes.map((t) => (
            <div
              key={t}
              className={`h-full flex flex-col justify-between p-4 rounded-lg border-1 transition-all ${
                type === t
                  ? "bg-brand-soft-green border-brand-soft-green"
                  : "bg-white border-brand-sand hover:border-brand-soft-green"
              }`}
            >
              <button
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className="text-left focus:outline-none focus:ring-0"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                    type === t
                      ? "bg-brand-goldenrod text-brand-soft-green"
                      : "bg-brand-soft-green/20 text-brand-soft-green dark:bg-brand-soft-charcoal dark:text-brand-goldenrod"
                  }`}
                >
                  {spotlightIcons[t]}
                </div>
                <p
                  className={`font-bold mb-1 ${
                    type === t
                      ? "text-brand-white"
                      : "text-brand-soft-green dark:text-brand-goldenrod"
                  }`}
                >
                  {spotlightTypeCopy[t].label}
                </p>
                <p
                  className={`text-sm ${
                    type === t
                      ? "text-brand-white/90"
                      : "text-brand-soft-charcoal dark:text-brand-white"
                  }`}
                >
                  {spotlightTypeCopy[t].blurb}
                </p>
              </button>
              <Link
                href={spotlightArchiveHref[t]}
                target="_blank"
                className={`mt-3 inline-block text-sm font-medium text-brand-goldenrod underline ${
                  type === t
                    ? "hover:text-brand-white"
                    : "hover:text-brand-soft-green"
                }`}
              >
                {archiveLabel[t]} →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {!started && (
        <div className="w-full flex justify-center px-3 mt-6 mb-10">
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="inline-block text-center bg-brand-goldenrod text-brand-charcoal text-xl font-bold px-10 py-4 rounded-lg transition-all hover:brightness-105 focus:outline-none focus:ring-0"
          >
            Start →
          </button>
        </div>
      )}

      {!started ? (
        <div className="max-w-lg w-full px-3 mb-2">
          <h2 className="font-bold text-xl mb-2">Submission process</h2>
          <p className="text-sm text-brand-charcoal dark:text-brand-white mb-3">
            We publish the newsletter every other Monday. It usually takes 1–3
            weeks to publish your article.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-brand-charcoal dark:text-brand-white">
            <li>
              Write your answers — either via the form below or as a shared
              Google doc
            </li>
            <li>
              Provide 2–3 images we can use for the article and as socials promo
            </li>
            <li>Click Submit ✨💌</li>
            <li>
              Alex will follow up with proposed edits & confirmation before
              publish
            </li>
          </ol>
        </div>
      ) : (
        <div id="spotlight-form" className="w-full max-w-lg my-4 scroll-mt-24">
          <SpotlightSubmitForm type={type} recentDearDrMom={recentDearDrMom} />
        </div>
      )}
    </>
  );
};

export default ContributeFlow;

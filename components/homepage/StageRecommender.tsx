"use client";

import { useState } from "react";
import Link from "@/components/Link";
import Image from "@/components/Image";
import {
  stages,
  homepageRecommendationsForStage,
  type Stage,
} from "@/data/journey/programs";

// ---------------------------------------------------------------------------
// StageRecommender — homepage companion to /journey. A stage picker sits on
// top of three highlight cards; picking a stage swaps the cards to that
// stage's curated recommendations (see homepageRecommendationsForStage,
// data/journey/programs.ts). Both pieces share one full-bleed, full-strength
// brand-soft-green strip background (same -mx-[50vw] w-screen break-out as
// FirstYearProgramClient's FTPBanner) so they read as one connected
// component, and so this section reads as clearly distinct from the cream
// hero above it — hence plain white text throughout rather than a
// light/dark-aware color.
//
// Default stage is "newborn" so a visitor who never touches the picker sees
// exactly what the homepage always showed (Postpartum Post, First Year
// Program, Groups Directory) — this replaces the old static HighlightSection.
//
// Recommendations render as a vertical list of horizontal rows (photo block
// left, header/description/CTA stacked to the right) rather than a 3-column
// card grid — stacks flex-col on mobile since there's no room for a
// side-by-side row there.
//
// First Year Program's accent was moved from brand-soft-green to
// brand-green (data/journey/programs.ts) specifically so its footer band
// doesn't disappear into this section's own brand-soft-green strip — same
// fix applies wherever that accent shows up (SupportGrid, HighlightPill).
// ---------------------------------------------------------------------------

export default function StageRecommender() {
  const [stage, setStage] = useState<Stage>("newborn");
  const recommended = homepageRecommendationsForStage(stage);

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-brand-sand/20 py-10 md:py-14">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-brand-soft-green font-bold text-2xl md:text-3xl mb-2">
            Where are you in your parenthood journey?
          </h2>
          <p className="text-brand-soft-green dark:text-brand-white text-sm mb-6 max-w-lg mx-auto">
            Tell us where your family is at and we'll show you how we support
            you.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {stages.map((s) => {
              const active = s.key === stage;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStage(s.key)}
                  data-umami-event={`Homepage recommender: Select stage ${s.label}`}
                  className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    active
                      ? "bg-brand-soft-green text-brand-white border-brand-soft-green"
                      : "bg-transparent text-brand-soft-green border-brand-soft-green/40 hover:border-brand-soft-green"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {recommended.map((program) => (
            <div
              key={program.name}
              className={`bg-brand-white dark:bg-brand-charcoal rounded-3xl shadow-sm border ${program.accentSoftBorder} overflow-hidden flex flex-col sm:flex-row`}
            >
              <div className="relative aspect-[2/1] sm:aspect-auto sm:w-48 shrink-0">
                <Image
                  src={program.photo}
                  alt={program.photoAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, 192px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-white mb-1">
                  {program.name}
                </h3>
                <p className="text-sm text-brand-charcoal dark:text-brand-white mb-3">
                  {program.description}
                </p>
                <Link
                  href={program.href}
                  className={`self-start px-4 py-1.5 rounded-md text-sm font-semibold hover:opacity-80 transition-opacity ${program.accentSoftBg} text-brand-charcoal dark:text-brand-white`}
                  data-umami-event={`Highlight: ${program.name}`}
                >
                  {program.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-brand-soft-green/70 text-sm mt-10">
          Explore the full{" "}
          <Link
            href="/journey"
            className="font-semibold text-brand-soft-green underline hover:text-brand-soft-green/80"
            data-umami-event="Homepage recommender: See full journey"
          >
            support journey
          </Link>
        </p>
      </div>
    </section>
  );
}

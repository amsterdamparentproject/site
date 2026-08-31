"use client";

import { useState } from "react";
import Link from "@/components/Link";
import Image from "@/components/Image";
import ConfidenceCurve from "@/components/homepage/ConfidenceCurve";
import {
  homepageRecommendationsForStage,
  type Stage,
} from "@/data/journey/programs";

// ---------------------------------------------------------------------------
// StageRecommender — homepage companion to /journey. Reframes the problem
// first (ConfidenceCurve: parental confidence follows a Dunning-Kruger
// shape, not a straight line) before showing the solution (a list of
// program recommendations for whichever point on the curve is selected).
// The curve *is* the stage picker now — no separate pill row.
//
// Default stage is "newborn" so a visitor who never touches the curve sees
// exactly what the homepage always showed (Postpartum Post, First Year
// Program, Groups Directory) — this replaces the old static HighlightSection.
//
// Recommendations render as a vertical list of horizontal rows (photo block
// left, header/description/CTA stacked to the right) rather than a 3-column
// card grid. The photo is a narrow full-height strip on every breakpoint —
// on mobile it used to be a full-width aspect-[2/1] banner stacked above
// the text, which put more visual weight on the photo than the program
// name; it's now a fixed 80px-wide column flush against the card's left
// edge instead, the same treatment sm:+ already used just narrower.
//
// First Year Program's accent was moved from brand-soft-green to
// program-burnout-blue (data/journey/programs.ts) so its color doesn't
// disappear into this section's own brand-soft-green strip, or get
// confused with Season Group's charcoal — same fix applies wherever that
// accent shows up (SupportGrid, HighlightPill, ConfidenceCurve's dots).
// ---------------------------------------------------------------------------

export default function StageRecommender() {
  const [stage, setStage] = useState<Stage>("newborn");
  const recommended = homepageRecommendationsForStage(stage);

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-brand-sand/20 py-10 md:py-14">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-brand-soft-green font-bold text-xl md:text-3xl mb-2">
            Every new parent goes through this.
          </h2>
          <p className="text-brand-soft-green dark:text-brand-white text-sm max-w-lg mx-auto">
            The transition to parenthood has ups and downs. From the newborn
            trenches to toddler playdates, APP is here to support you along the
            way.
          </p>
        </div>

        <ConfidenceCurve activeStage={stage} onSelectStage={setStage} />

        <div className="max-w-3xl mx-auto flex flex-col mt-2 gap-3">
          {recommended.map((program) => (
            <div
              key={program.name}
              className={`bg-brand-white dark:bg-brand-charcoal rounded-3xl shadow-sm border ${program.accentSoftBorder} overflow-hidden flex flex-row items-stretch`}
            >
              <div className="relative w-20 sm:w-48 shrink-0">
                {/* sizes is deliberately wider than the 80px mobile slot
                    (w-20 above): it only tells Next how wide the crop is,
                    not how tall — and object-cover stretches this strip to
                    match the text column's height, which can run tall once
                    the description wraps in a ~200px-wide column. A
                    width-only-accurate hint here fetches a low-res crop
                    that then gets visibly upscaled to cover that height. */}
                <Image
                  src={program.photo}
                  alt={program.photoAlt}
                  fill
                  sizes="(max-width: 640px) 200px, 192px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-center">
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

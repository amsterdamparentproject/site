"use client";

import React from "react";
import { BUNDLE_MULTI_EUR, BUNDLE_SINGLE_EUR } from "@/lib/fyp/pricing";
import type { Situation } from "@/lib/fyp/situation";

// Luma calendar filtered to the first-year-program tag, for pay-per-event.
const LUMA_CALENDAR_URL = process.env.NEXT_PUBLIC_FYP_LUMA_CALENDAR_URL;

// Situation-aware note shown on the bundle card — mirrors the (more precise)
// copy inside FYPJoinForm's own PlanCard; the join form below is the source of
// truth.
function bundleNote(situation: Situation): string {
  if (situation === "expecting") {
    return "One payment for the program. Fully refundable if you cancel during pregnancy.";
  }
  return "One payment for 6 months of access.";
}

const StackedCostBar = () => {
  const segments = [
    {
      label: "Experts",
      value: 47,
      color: "bg-brand-soft-green",
      text: "text-white",
    },
    {
      label: "Socials",
      value: 17,
      color: "bg-brand-goldenrod",
      text: "text-brand-charcoal",
    },
    {
      label: "Operations",
      value: 36,
      color: "bg-brand-soft-charcoal",
      text: "text-white",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h4 className="text-center text-brand-charcoal dark:text-brand-goldenrod font-bold text-sm mb-6">
        Where your program fees go:
      </h4>

      <div className="flex w-full h-10 rounded-full overflow-hidden shadow-inner border border-brand-sand/30 mb-4">
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{ width: `${segment.value}%` }}
            className={`${segment.color} flex items-center justify-center transition-all border-r border-white/20 last:border-r-0`}
          >
            <span className={`${segment.text} text-[10px] font-black`}>
              {segment.value}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${segment.color}`} />
            <span className="text-[10px] font-bold text-brand-charcoal/60 dark:text-brand-white/80">
              {segment.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BundleCard = ({ note }: { note: string }) => (
  <div className="rounded-2xl border border-brand-goldenrod/40 overflow-hidden flex flex-col h-full">
    <div className="bg-brand-goldenrod px-6 py-4">
      <p className="text-sm font-black text-white">6-month bundle</p>
    </div>
    <div className="bg-white dark:bg-brand-soft-charcoal p-6 flex flex-col flex-1">
      <div className="space-y-3 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-brand-charcoal dark:text-brand-white/80">
            Single parent family
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-charcoal dark:text-brand-white">
              €{BUNDLE_SINGLE_EUR}
            </span>
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium">
            2+ parent family
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-soft-green dark:text-brand-goldenrod">
              €{BUNDLE_MULTI_EUR}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-brand-charcoal/40 dark:text-brand-white/40 pt-2 leading-relaxed">
          {note}
        </p>
        {LUMA_CALENDAR_URL && (
          <p className="text-[10px] text-brand-charcoal/40 dark:text-brand-white/40 leading-relaxed">
            Not ready for six months? You can also{" "}
            <a
              href={LUMA_CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              data-umami-event="First Year Program: Costs: Pay per event"
            >
              pay per event on our calendar
            </a>
            .
          </p>
        )}
      </div>
      <a
        href="#join"
        className="mt-6 block w-full text-center text-sm font-bold text-white bg-brand-goldenrod hover:bg-brand-goldenrod/90 transition-colors rounded-xl py-3"
        data-umami-event="First Year Program: Costs: Bundle"
      >
        Get the 6-month bundle
      </a>
    </div>
  </div>
);

function PriceCards({ situation }: { situation: Situation }) {
  return (
    <div className="w-full max-w-sm mb-8">
      <BundleCard note={bundleNote(situation)} />
    </div>
  );
}

interface CostsBreakdownProps {
  situation: Situation;
}

export default function CostsBreakdown({ situation }: CostsBreakdownProps) {
  return (
    <section className="max-w-4xl mx-auto my-8 px-6 flex flex-col items-center">
      {/* Price summary */}
      <PriceCards situation={situation} />

      {/* Billing note — personalized to the situation picked above */}
      <div className="max-w-md text-center mb-8 px-4">
        <p className="text-[11px] text-brand-soft-charcoal dark:text-brand-white/80 leading-relaxed">
          All prices include 21% BTW (VAT).
        </p>
      </div>

      {/* Transparency bar */}
      <div className="w-full border-t border-brand-sand/20 pt-8 flex flex-col items-center">
        <StackedCostBar />

        <p className="text-xs text-brand-soft-charcoal/60 dark:text-brand-white/80 max-w-lg text-center mt-8 leading-relaxed italic">
          Transparency is a core value: each 6-month cohort costs €1,347 to run.
          Fees cover costs first; anything left funds program development and
          community work.
        </p>
      </div>
    </section>
  );
}

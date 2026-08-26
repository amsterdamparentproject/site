"use client";

import React, { useRef, useState } from "react";
import { PROGRAM_START } from "@/lib/fyp/program";
import {
  BUNDLE_MULTI_EUR,
  BUNDLE_MULTI_FULL_EUR,
  BUNDLE_SINGLE_EUR,
  BUNDLE_SINGLE_FULL_EUR,
  DEPOSIT_EUR,
  MONTHLY_MULTI_EUR,
  MONTHLY_SINGLE_EUR,
} from "@/lib/fyp/pricing";
import type { Situation } from "@/lib/fyp/situation";

const isBeforeProgramStart = new Date() < PROGRAM_START;

// Situation-aware billing notes shown on each plan card — mirrors the
// (more precise, exact-due-date-aware) copy inside FYPJoinForm's own
// PlanCard, but simplified here since this section previews pricing before
// a due/birth date's exact billing consequences matter — the join form
// below is the source of truth for the precise number.
function monthlyNote(situation: Situation): string {
  if (situation === "expecting") {
    return `Reserve with a €${DEPOSIT_EUR} deposit — credited to your first invoice, refundable if you cancel during pregnancy.`;
  }
  return isBeforeProgramStart
    ? `€${DEPOSIT_EUR} deposit for now — billing starts once live sessions launch September 1, 2026.`
    : "Billed monthly, cancel anytime.";
}

function bundleNote(situation: Situation): string {
  if (situation === "expecting") {
    return `Pay upfront for the program, save €${DEPOSIT_EUR}. Fully refundable if you cancel during pregnancy.`;
  }
  return isBeforeProgramStart
    ? `Pay upfront and save €${DEPOSIT_EUR} — the program starts September 1, 2026.`
    : `Pay upfront for 6 months, save €${DEPOSIT_EUR}.`;
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

const MonthlyCard = ({ note }: { note: string }) => (
  <div className="rounded-2xl border border-brand-sand/60 overflow-hidden flex flex-col h-full">
    <div className="bg-brand-soft-green px-6 py-4">
      <p className="text-sm font-black text-white">Monthly</p>
    </div>
    <div className="bg-white dark:bg-brand-soft-charcoal p-6 flex flex-col flex-1">
      <div className="space-y-3 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-brand-charcoal dark:text-brand-white/80">
            Single parent family
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand-charcoal dark:text-brand-white">
              €{MONTHLY_SINGLE_EUR}
            </span>
            <span className="text-xs text-brand-charcoal/40 dark:text-brand-white/40">
              /mo
            </span>
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium">
            2+ parent family
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand-soft-green dark:text-brand-goldenrod">
              €{MONTHLY_MULTI_EUR}
            </span>
            <span className="text-xs text-brand-soft-green/50 dark:text-brand-goldenrod/50">
              /mo
            </span>
          </div>
        </div>
        <p className="text-[10px] text-brand-charcoal/40 dark:text-brand-white/40 pt-2 leading-relaxed">
          {note}
        </p>
      </div>
      <a
        href="#join"
        className="mt-6 block w-full text-center text-sm font-bold text-white bg-brand-soft-green hover:bg-brand-soft-green/90 transition-colors rounded-xl py-3"
        data-umami-event="First Year Program: Costs: Monthly"
      >
        Join or reserve your spot
      </a>
    </div>
  </div>
);

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
            <span className="text-xs line-through text-brand-charcoal/30">
              €{BUNDLE_SINGLE_FULL_EUR}
            </span>
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
            <span className="text-xs line-through text-brand-charcoal/30">
              €{BUNDLE_MULTI_FULL_EUR}
            </span>
            <span className="text-2xl font-bold text-brand-soft-green dark:text-brand-goldenrod">
              €{BUNDLE_MULTI_EUR}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-brand-charcoal/40 dark:text-brand-white/40 pt-2 leading-relaxed">
          {note}
        </p>
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
  const [activeCard, setActiveCard] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const monthlyNoteText = monthlyNote(situation);
  const bundleNoteText = bundleNote(situation);
  const cards = [
    <BundleCard key="bundle" note={bundleNoteText} />,
    <MonthlyCard key="monthly" note={monthlyNoteText} />,
  ];
  const labels = ["6-month bundle", "Monthly"];
  const dotColors = ["bg-brand-goldenrod", "bg-brand-soft-green"];

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) setActiveCard((c) => Math.min(c + 1, cards.length - 1));
      else setActiveCard((c) => Math.max(c - 1, 0));
    }
    touchStartX.current = null;
  }

  return (
    <div className="w-full max-w-2xl mb-8">
      {/* Mobile carousel */}
      <div className="md:hidden">
        <div className="flex justify-center gap-3 mb-4">
          {labels.map((label, i) => (
            <button
              key={i}
              onClick={() => setActiveCard(i)}
              className={`cursor-pointer px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                i === activeCard
                  ? `${dotColors[i]} text-white`
                  : "bg-brand-sand/30 text-brand-charcoal/60 dark:text-brand-white/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="select-none"
        >
          {cards[activeCard]}
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-2 gap-4">
        <MonthlyCard note={monthlyNoteText} />
        <BundleCard note={bundleNoteText} />
      </div>
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
          {situation === "expecting"
            ? "All prices include 21% BTW (VAT). Monthly billing starts the calendar month after your due date."
            : isBeforeProgramStart
              ? "All prices include 21% BTW (VAT). Billing starts once live sessions launch on September 1, 2026."
              : "All prices include 21% BTW (VAT). Billing starts immediately."}
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

"use client";

import React, { ReactNode, useRef, useState } from "react";

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

const MonthlyCard = () => (
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
              €55
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
              €68
            </span>
            <span className="text-xs text-brand-soft-green/50 dark:text-brand-goldenrod/50">
              /mo
            </span>
          </div>
        </div>
        <p className="text-[10px] text-brand-charcoal/40 dark:text-brand-white/40 pt-2 leading-relaxed">
          Pregnant? Reserve with a €25 deposit — credited to your first invoice,
          refundable if you cancel during pregnancy.
        </p>
      </div>
      <a
        href="#join"
        className="mt-6 block w-full text-center text-sm font-bold text-white bg-brand-soft-green hover:bg-brand-soft-green/90 transition-colors rounded-xl py-3"
      >
        Join or reserve your spot
      </a>
    </div>
  </div>
);

const BundleCard = () => (
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
              €330
            </span>
            <span className="text-2xl font-bold text-brand-charcoal dark:text-brand-white">
              €305
            </span>
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium">
            2+ parent family
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xs line-through text-brand-charcoal/30">
              €408
            </span>
            <span className="text-2xl font-bold text-brand-soft-green dark:text-brand-goldenrod">
              €383
            </span>
          </div>
        </div>
        <p className="text-[10px] text-brand-charcoal/40 dark:text-brand-white/40 pt-2 leading-relaxed">
          Pay upfront for the program, save €25. Fully refundable if you cancel
          during pregnancy.
        </p>
      </div>
      <a
        href="#join"
        className="mt-6 block w-full text-center text-sm font-bold text-white bg-brand-goldenrod hover:bg-brand-goldenrod/90 transition-colors rounded-xl py-3"
      >
        Get the 6-month bundle
      </a>
    </div>
  </div>
);

function PriceCards() {
  const [activeCard, setActiveCard] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const cards = [<BundleCard key="bundle" />, <MonthlyCard key="monthly" />];
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
        <MonthlyCard />
        <BundleCard />
      </div>
    </div>
  );
}

export default function CostsBreakdown() {
  const inclusions: { bold: string; rest: ReactNode }[] = [
    {
      bold: "1:1 peer match",
      rest: (
        <>
          via{" "}
          <a
            href="https://postpartumpost.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand-soft-green"
          >
            Postpartum Post
          </a>{" "}
          with someone who gets where you are
        </>
      ),
    },
    {
      bold: "6 expert-led discussions",
      rest: "covering your first year as a parent",
    },
    {
      bold: "6 curated socials",
      rest: "at baby-friendly Amsterdam spots, plus ad-hoc meetups",
    },
    {
      bold: "7 digital resource guides",
      rest: "providing evidence-based context for every stage",
    },
    {
      bold: "A private WhatsApp group",
      rest: "moderated by a psychotherapist",
    },
    {
      bold: "All parents included",
      rest: "because the transition affects the whole family",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto my-8 px-6 flex flex-col items-center">
      {/* What the program includes */}
      <div className="w-full max-w-xl bg-brand-sand/20 dark:bg-brand-soft-charcoal/30 rounded-2xl p-6 mb-12 border border-brand-sand/40 dark:border-brand-soft-charcoal/60">
        <h4 className="text-sm italic text-brand-soft-green dark:text-brand-goldenrod font-medium mb-4 text-center">
          Your monthly subscription includes:
        </h4>
        <ul className="grid grid-cols-1 gap-y-3 text-left">
          {inclusions.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-brand-soft-charcoal leading-relaxed"
            >
              <svg
                className="w-4 h-4 text-brand-goldenrod shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-brand-charcoal dark:text-brand-white/80">
                <strong className="font-bold text-brand-charcoal dark:text-brand-white">
                  {item.bold}
                </strong>{" "}
                {item.rest}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price summary */}
      <PriceCards />

      {/* Billing note */}
      <div className="max-w-md text-center mb-8 px-4">
        <p className="text-[11px] text-brand-soft-charcoal dark:text-brand-white/80 leading-relaxed">
          All prices include 21% BTW (VAT). Monthly billing starts the calendar
          month after your due date, or immediately if you already have a baby.
        </p>
      </div>

      {/* Transparency bar */}
      <div className="w-full border-t border-brand-sand/20 pt-8 flex flex-col items-center">
        <StackedCostBar />

        <p className="text-xs text-brand-soft-charcoal/60 dark:text-brand-white/80 max-w-lg text-center mt-8 leading-relaxed italic">
          One of our core values is transparency. Each cohort costs €1,347 to
          run over 6 months. We first cover costs, then use the remainder to
          support program development and other community initiatives.
        </p>
      </div>
    </section>
  );
}

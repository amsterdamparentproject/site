"use client";

import { useState, useRef } from "react";

type Path = "expecting" | "baby";

const circleColors = ["bg-brand-soft-green", "bg-brand-goldenrod", "bg-brand-soft-green"];

const paths: Record<Path, { subtitle: string; title: string; body: string }[]> = {
  expecting: [
    {
      title: "Reserve your spot",
      subtitle: "During pregnancy",
      body: "You commit to joining, and we help you start building your village during pregnancy. Get immediate access to 1:1 matching, the private WhatsApp group, and our first resource guide on Dutch postpartum care — all free (via refundable deposit) until your baby's due date.",
    },
    {
      title: "When your baby is due",
      subtitle: "The program begins",
      body: "You join the monthly program with the people you've already been building connections with — 1:1 match, group chat, expert discussions, socials, and resource guides. Even if your baby comes late, the information is still valuable: a place to ask all the questions.",
    },
    {
      title: "After 6 months",
      subtitle: "Keep going",
      body: "Our topics are designed to evolve as your baby grows — and as your experience as parents deepens. New perspectives, challenges, and questions emerge every month. Continue getting support for as long as you want, up until your baby is 12 months old.",
    },
  ],
  baby: [
    {
      title: "Jump right in",
      subtitle: "Anytime in the first year",
      body: "Get access to everything the program has to offer: monthly socials and expert discussions, a 1:1 match with a parent who gets it, all 6 resource guides, and a group chat moderated by our in-house postpartum psychotherapist.",
    },
    {
      title: "After 6 months",
      subtitle: "Keep going",
      body: "Our topics are designed to evolve as your baby grows — and as your experience as parents deepens. New perspectives, challenges, and questions emerge every month. Continue getting support for as long as you want, up until your baby is 12 months old.",
    },
  ],
};

export default function ProgramJourney() {
  const [path, setPath] = useState<Path>("expecting");
  const [activeStep, setActiveStep] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const steps = paths[path];

  function handlePathChange(newPath: Path) {
    setPath(newPath);
    setActiveStep(0);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) setActiveStep((s) => Math.min(s + 1, steps.length - 1));
      else setActiveStep((s) => Math.max(s - 1, 0));
    }
    touchStartX.current = null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Path toggle */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <button
          onClick={() => handlePathChange("expecting")}
          className={`cursor-pointer px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
            path === "expecting"
              ? "bg-brand-soft-green text-white border-brand-soft-green"
              : "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white border-brand-sand/60 hover:border-brand-soft-green"
          }`}
        >
          We're still expecting
        </button>
        <button
          onClick={() => handlePathChange("baby")}
          className={`cursor-pointer px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
            path === "baby"
              ? "bg-brand-goldenrod text-white border-brand-goldenrod"
              : "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white border-brand-sand/60 hover:border-brand-goldenrod"
          }`}
        >
          Our baby is here
        </button>
      </div>

      {/* ── Mobile carousel ──────────────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Numbered step indicators */}
        <div className="flex justify-center gap-3 mb-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`cursor-pointer w-9 h-9 rounded-full text-sm font-bold transition-all border-2 border-white dark:border-brand-charcoal ${
                circleColors[i]
              } ${i === activeStep ? "opacity-100 scale-110 shadow-md" : "opacity-40"} text-white`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Step card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="p-6 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal select-none"
        >
          <h4 className="font-bold text-brand-charcoal dark:text-brand-white">
            {steps[activeStep].title}
          </h4>
          <p className={`text-xs font-medium tracking-wide italic mt-1 mb-2 ${activeStep % 2 === 0 ? "text-brand-soft-green" : "text-brand-goldenrod"}`}>
            {steps[activeStep].subtitle}
          </p>
          <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/70 leading-relaxed">
            {steps[activeStep].body}
          </p>
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between mt-4 px-1">
          <button
            onClick={() => setActiveStep((s) => Math.max(s - 1, 0))}
            disabled={activeStep === 0}
            className="cursor-pointer text-sm font-medium text-brand-soft-green disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            onClick={() => setActiveStep((s) => Math.min(s + 1, steps.length - 1))}
            disabled={activeStep === steps.length - 1}
            className="cursor-pointer text-sm font-medium text-brand-soft-green disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

      {/* ── Desktop timeline ─────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="relative space-y-12 before:absolute before:inset-0 before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-soft-green before:via-brand-goldenrod before:to-transparent">
          {steps.map((step, index) => (
            <div
              key={`${path}-${index}`}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-brand-charcoal ${circleColors[index]} text-white shrink-0 z-10 absolute left-1/2 -translate-x-1/2`}>
                {index + 1}
              </div>
              <div className="w-[42%] p-6 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal">
                <h4 className="font-bold text-brand-charcoal dark:text-brand-white">
                  {step.title}
                </h4>
                <p className={`text-xs font-medium tracking-wide italic mt-1 mb-2 ${index % 2 === 0 ? "text-brand-soft-green" : "text-brand-goldenrod"}`}>
                  {step.subtitle}
                </p>
                <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/70 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

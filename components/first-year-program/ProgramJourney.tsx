"use client";

import { useState } from "react";

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
  const steps = paths[path];

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <button
          onClick={() => setPath("expecting")}
          className={`cursor-pointer px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
            path === "expecting"
              ? "bg-brand-soft-green text-white border-brand-soft-green"
              : "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white border-brand-sand/60 hover:border-brand-soft-green"
          }`}
        >
          We're still expecting
        </button>
        <button
          onClick={() => setPath("baby")}
          className={`cursor-pointer px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
            path === "baby"
              ? "bg-brand-goldenrod text-white border-brand-goldenrod"
              : "bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white border-brand-sand/60 hover:border-brand-goldenrod"
          }`}
        >
          Our baby is here
        </button>
      </div>

      {/* Timeline */}
      <div className="relative space-y-12 before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-soft-green before:via-brand-goldenrod before:to-transparent">
        {steps.map((step, index) => (
          <div
            key={`${path}-${index}`}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-brand-charcoal ${circleColors[index]} text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2`}>
              {index + 1}
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal">
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
  );
}

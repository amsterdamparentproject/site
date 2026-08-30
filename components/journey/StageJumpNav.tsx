"use client";

import { stages } from "@/data/journey/programs";

// ---------------------------------------------------------------------------
// StageJumpNav — "Jump to where YOU are". Scrolls the narrative to the
// matching <section id="stage-...">  in JourneyStory. Deliberately just a
// scroll-jump (not a filter/collapse) so the rest of the happy-path story
// stays visible — someone on Baby can still see what's ahead in Toddler.
// ---------------------------------------------------------------------------

export default function StageJumpNav() {
  function jumpTo(key: string) {
    document
      .getElementById(`stage-${key}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mb-14 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/50 dark:text-brand-white/40 mb-3">
        Jump to where you are
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {stages.map((stage) => (
          <button
            key={stage.key}
            type="button"
            onClick={() => jumpTo(stage.key)}
            className="cursor-pointer px-4 py-2 rounded-full text-sm font-semibold border border-brand-sand/60 text-brand-charcoal dark:text-brand-white hover:border-brand-soft-green dark:hover:border-brand-goldenrod hover:text-brand-soft-green dark:hover:text-brand-goldenrod transition-colors"
          >
            {stage.label}
          </button>
        ))}
      </div>
    </div>
  );
}

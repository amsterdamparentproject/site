"use client";

import { situationDefaultMonthYear, type Situation } from "@/lib/fyp/situation";

// ---------------------------------------------------------------------------
// SituationSelector
//
// The single "still expecting, or is your baby here?" control at the top of
// "How you experience the program" — drives everything below it (the family
// type toggle, the pricing preview, AccessToday, the full CostsBreakdown,
// and — synced via lifted state in FirstYearProgramClient — the join form).
// Purely controlled: no internal state of its own.
//
// This used to be a pair of month/year <select>s (see git history) — Alex
// asked for a simpler binary toggle instead. The underlying month/year
// state still exists (FYPJoinForm's due-month/year selects need a precise
// date for billing), it's just not shown here anymore: picking a side jumps
// month/year to a sensible default for that situation via
// situationDefaultMonthYear, and the join form lets a visitor refine it
// from there.
// ---------------------------------------------------------------------------

const OPTIONS: { label: string; situation: Situation; icon: string }[] = [
  { label: "Still expecting", situation: "expecting", icon: "🤰" },
  { label: "My baby's here", situation: "baby_here", icon: "👶" },
];

interface SituationSelectorProps {
  month: string;
  year: string;
  situation: Situation;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}

export default function SituationSelector({
  month,
  year,
  situation,
  onMonthChange,
  onYearChange,
}: SituationSelectorProps) {
  function selectSituation(target: Situation) {
    const next = situationDefaultMonthYear(target, month, year);
    onMonthChange(next.month);
    onYearChange(next.year);
  }

  return (
    <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-2">
      {OPTIONS.map((opt) => {
        const active = situation === opt.situation;
        return (
          <button
            key={opt.situation}
            type="button"
            onClick={() => selectSituation(opt.situation)}
            className={`cursor-pointer px-4 py-3 rounded-lg text-sm font-bold border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 ${
              active
                ? "border-brand-soft-green bg-brand-soft-green/10 text-brand-soft-green dark:border-brand-goldenrod dark:bg-brand-goldenrod/10 dark:text-brand-goldenrod"
                : "border-brand-sand/60 bg-white dark:bg-brand-charcoal text-brand-charcoal/70 dark:text-brand-white/60 hover:border-brand-soft-green/40"
            }`}
          >
            {opt.icon} {opt.label}
          </button>
        );
      })}
    </div>
  );
}

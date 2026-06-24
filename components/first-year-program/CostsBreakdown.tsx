import React from "react";

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

export default function CostsBreakdown() {
  const inclusions = [
    {
      bold: "1:1 peer match",
      rest: "via Postpartum Post — a matched parent who gets where you are",
    },
    {
      bold: "6 expert-led discussions",
      rest: "covering the full arc of your first year as a parent",
    },
    {
      bold: "6 curated socials",
      rest: "at baby-friendly Amsterdam spots, plus ad-hoc meetups",
    },
    {
      bold: "6 digital resource guides",
      rest: "providing evidence-based context for every stage",
    },
    {
      bold: "A private WhatsApp group",
      rest: "moderated by a psychotherapist, active 24/7",
    },
    {
      bold: "All parents included",
      rest: "multi-parent families join together at one family price",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto my-8 px-6 flex flex-col items-center">
      {/* What the program includes */}
      <div className="w-full max-w-xl bg-white dark:bg-brand-charcoal rounded-2xl p-6 mb-12 border border-brand-sand/60 dark:border-brand-soft-charcoal/80">
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
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mb-8 w-full">
        <div className="text-center dark:bg-white dark:p-4 dark:rounded-lg">
          <span className="block text-[10px] font-black text-brand-charcoal/40 uppercase tracking-widest mb-2">
            Single-parent families
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-brand-charcoal">€55</span>
            <span className="text-xs font-bold text-brand-charcoal/40">/mo</span>
          </div>
        </div>

        <div className="text-center dark:bg-white dark:p-4 dark:rounded-lg">
          <span className="block text-[10px] font-black text-brand-soft-green uppercase tracking-widest mb-2">
            Multi-parent families
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-brand-soft-green">€68</span>
            <span className="text-xs font-bold text-brand-soft-green/60">/mo</span>
          </div>
        </div>
      </div>

      {/* Billing note */}
      <div className="max-w-md text-center mb-8 px-4">
        <p className="text-[11px] text-brand-soft-charcoal dark:text-brand-white/80 leading-relaxed">
          Billed monthly, starting the month after your due date. All prices include 21% BTW (VAT). We recommend a 3-month minimum to get the most out of the program.
        </p>
      </div>

      {/* Transparency bar */}
      <div className="w-full border-t border-brand-sand/20 pt-8 flex flex-col items-center">
        <StackedCostBar />

        <p className="text-xs text-brand-soft-charcoal/60 dark:text-brand-white/80 max-w-lg text-center mt-8 leading-relaxed italic">
          One of our core values is transparency. Each cohort costs €1,347 to run over 6 months.
          We first cover costs, then use the remainder to support program development and other community initiatives.
        </p>
      </div>
    </section>
  );
}

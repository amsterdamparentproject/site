import React from "react";

const StackedCostBar = () => {
  const segments = [
    {
      label: "Experts",
      value: 62,
      color: "bg-brand-soft-green",
      text: "text-white",
    },
    {
      label: "Socials",
      value: 20,
      color: "bg-brand-goldenrod",
      text: "text-brand-charcoal",
    },
    {
      label: "Operations",
      value: 18,
      color: "bg-brand-soft-charcoal",
      text: "text-white",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h4 className="text-center text-brand-charcoal font-bold text-sm mb-6">
        Where your program fees go:
      </h4>

      <div className="flex w-full h-10 rounded-full overflow-hidden shadow-inner border border-brand-sand/30 mb-4">
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{ width: `${segment.value}%` }}
            className={`${segment.color} flex items-center justify-center transition-all border-r border-white/20 last:border-r-0 group relative`}
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
            <span className="text-[10px] font-bold text-brand-charcoal/60">
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
      bold: "3 months of access",
      rest: "for your whole family: all parents included",
    },
    {
      bold: "4 expert-led discussions",
      rest: "tailored to your newborn’s growth — and your own",
    },
    {
      bold: "5 digital guides",
      rest: "providing evidence-based context for early parenthood",
    },
    {
      bold: "5 curated socials",
      rest: "at baby-friendly Amsterdam spots, plus ad-hoc meetups",
    },
    {
      bold: "A private WhatsApp group",
      rest: "moderated by a psychotherapist",
    },
    {
      bold: "A vetted shortlist",
      rest: "of local & online resources from our network",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto my-8 px-6 flex flex-col items-center">
      {/* What the program includes */}
      <div className="w-full max-w-xl bg-brand-sand/5 rounded-2xl p-6 mb-12 border border-brand-sand/20">
        <h4 className="text-sm italic text-brand-soft-green font-medium mb-4 text-center">
          Your program fee includes:
        </h4>
        <ul className="grid grid-cols-1 gap-y-3 text-left">
          {inclusions.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-xs text-brand-soft-charcoal leading-relaxed"
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
              <span>
                <strong className="font-bold text-brand-charcoal">
                  {item.bold}
                </strong>{" "}
                {item.rest}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. PRICE SUMMARY */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mb-8 w-full">
        <div className="text-center">
          <span className="block text-[10px] font-black text-brand-charcoal/40 uppercase tracking-widest mb-2">
            Single parent families
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-brand-charcoal">€175</span>
            <span className="text-xs font-bold text-brand-charcoal/40">
              /3 mo
            </span>
          </div>
        </div>

        <div className="text-center">
          <span className="block text-[10px] font-black text-brand-soft-green uppercase tracking-widest mb-2">
            Multi-parent families
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-brand-soft-green">
              €295
            </span>
            <span className="text-xs font-bold text-brand-soft-green/60">
              /3 mo
            </span>
          </div>
        </div>
      </div>

      {/* 4. SLIDING SCALE NOTICE */}
      <div className="max-w-md text-center mb-12 px-4">
        <p className="text-[11px] text-brand-soft-charcoal leading-relaxed">
          All prices include 21% BTW (VAT). The €25 reservation fee will be
          deducted from this total when you complete registration.
        </p>
      </div>

      {/* 5. TRANSPARENCY BAR */}
      <div className="w-full border-t border-brand-sand/20 pt-10 flex flex-col items-center">
        <StackedCostBar />

        <p className="text-[10px] text-brand-soft-charcoal/60 max-w-lg text-center mt-8 leading-relaxed italic">
          One of our core values is transparency. Each cohort costs €966 to run.
          We first cover costs, then use the remainder to support program
          development and other community initiatives.
        </p>
      </div>
    </section>
  );
}

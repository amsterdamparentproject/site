import type { Situation } from "@/lib/fyp/situation";

// ---------------------------------------------------------------------------
// PricingPreview
//
// The condensed "You sign up:" line for "How you experience the program".
// Just a preview — the exact bundle prices live in CostsBreakdown further
// down the page. Bundle-only since October 2026.
// ---------------------------------------------------------------------------

interface PricingPreviewProps {
  situation: Situation;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-brand-sand/20 dark:bg-brand-soft-charcoal/40 text-brand-charcoal dark:text-brand-white/90">
      {children}
    </span>
  );
}

export default function PricingPreview({ situation }: PricingPreviewProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-8 text-center">
      <h3 className="text-lg font-bold text-brand-soft-green dark:text-brand-goldenrod mb-3">
        You sign up:
      </h3>
      <Pill>6-month bundle</Pill>
      <p className="mt-3 text-xs text-brand-charcoal/50 dark:text-brand-white/40">
        {situation === "expecting"
          ? "One payment today. Live sessions begin after your due date, and it's fully refundable during pregnancy. "
          : "One payment today, with full access from the moment you sign up. "}
        See the{" "}
        <a
          href="#pricing"
          className="underline hover:text-brand-soft-green dark:hover:text-brand-goldenrod"
        >
          bundle prices
        </a>
        .
      </p>
    </div>
  );
}

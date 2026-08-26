import { PROGRAM_START } from "@/lib/fyp/program";
import { DEPOSIT_EUR } from "@/lib/fyp/pricing";
import type { Situation } from "@/lib/fyp/situation";

// ---------------------------------------------------------------------------
// PricingPreview
//
// The condensed "You sign up:" line for "How you experience the program".
// Two variants, both just previews — the full breakdown (including exact
// monthly rates and the 6-month bundle price) still lives in CostsBreakdown
// further down the page:
//   - Still expecting, or the program hasn't launched yet: the thing
//     that's actually happening today is reserving a spot with a deposit.
//   - Baby's here and the program's already running: there's no deposit
//     step, so this used to just disappear. Alex wants it back for these
//     families too — just the two ways to pay, not a specific amount,
//     since which one's cheaper for their family type is what
//     CostsBreakdown is for.
// ---------------------------------------------------------------------------

const isBeforeProgramStart = new Date() < PROGRAM_START;

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
  const depositApplies = situation === "expecting" || isBeforeProgramStart;

  if (depositApplies) {
    const billingNote =
      situation === "expecting"
        ? "Monthly billing starts the month after your due date."
        : "Monthly billing starts once live sessions launch September 1, 2026.";

    return (
      <div className="w-full max-w-md mx-auto mt-8 text-center">
        <h3 className="text-lg font-bold text-brand-soft-green dark:text-brand-goldenrod mb-3">
          You sign up:
        </h3>
        <Pill>Reserve your spot with a €{DEPOSIT_EUR} deposit</Pill>
        <p className="mt-3 text-xs text-brand-charcoal/50 dark:text-brand-white/40">
          {billingNote} Or get the{" "}
          <a
            href="#pricing"
            className="underline hover:text-brand-soft-green dark:hover:text-brand-goldenrod"
          >
            6-month bundle now and save €{DEPOSIT_EUR}!
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8 text-center">
      <h3 className="text-lg font-bold text-brand-soft-green dark:text-brand-goldenrod mb-3">
        You sign up:
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Pill>6-month bundle</Pill>
        <span className="text-xs font-medium text-brand-charcoal/40 dark:text-brand-white/40">
          or
        </span>
        <Pill>Monthly plan</Pill>
      </div>
      <p className="mt-3 text-xs text-brand-charcoal/50 dark:text-brand-white/40">
        Full access from the moment you sign up. Save €{DEPOSIT_EUR} with the{" "}
        <a
          href="#pricing"
          className="underline hover:text-brand-soft-green dark:hover:text-brand-goldenrod"
        >
          6-month bundle
        </a>
        .
      </p>
    </div>
  );
}

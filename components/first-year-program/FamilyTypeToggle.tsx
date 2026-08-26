"use client";

// ---------------------------------------------------------------------------
// FamilyTypeToggle
//
// "I have a partner" / "I'm a single parent" — shared between the top-of-
// section-2 preview (FirstYearProgramClient) and FYPJoinForm's own family
// section, both driven by the same lifted `isSingleParent` state so picking
// one in either place updates both (mirrors the month/year lift for
// SituationSelector). `hint` shows the short explanatory line FYPJoinForm
// used to render inline — kept optional since the page-level preview
// doesn't need it.
// ---------------------------------------------------------------------------

const OPTIONS = [
  { label: "I have a partner", single: false },
  { label: "I'm a single parent", single: true },
] as const;

interface FamilyTypeToggleProps {
  isSingleParent: boolean;
  onChange: (isSingleParent: boolean) => void;
  hint?: boolean;
}

export default function FamilyTypeToggle({
  isSingleParent,
  onChange,
  hint = false,
}: FamilyTypeToggleProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map(({ label, single }) => {
          const active = isSingleParent === single;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(single)}
              className={`cursor-pointer px-3 py-2.5 rounded-lg text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 ${
                active
                  ? "border-brand-soft-green bg-brand-soft-green/10 text-brand-soft-green dark:text-brand-goldenrod dark:border-brand-goldenrod dark:bg-brand-goldenrod/10"
                  : "border-brand-sand/60 text-brand-charcoal/60 dark:text-brand-white/40 hover:border-brand-charcoal/30 dark:hover:border-brand-white/30"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {hint &&
        (isSingleParent ? (
          <p className="mt-2 text-xs text-brand-charcoal/50 dark:text-brand-white/40">
            We offer a discount to ensure everyone can access support,
            regardless of family structure.
          </p>
        ) : (
          <p className="mt-2 text-xs text-brand-charcoal/50 dark:text-brand-white/40">
            After sign up, you can add your partner(s) to the subscription from
            your profile.
          </p>
        ))}
    </div>
  );
}

import { Check } from "lucide-react";
import Link from "@/components/Link";
import { stages, journeyPrograms, type Pricing } from "@/data/journey/programs";

// ---------------------------------------------------------------------------
// SupportGrid
//
// The "grid" view of /journey: a program×stage matrix. Real <table> on
// larger screens (semantic, so screen readers get row/column headers for
// free); stacked cards on mobile, same pattern as StageJourney/ProgramJourney
// switching to a carousel/stack below the sm breakpoint rather than
// squeezing a 5-column table onto a phone.
//
// Pricing is surfaced here (not in the JourneyStory narrative — deliberately
// left out of the prose) since this is the "at a glance" reference view,
// and "Free" vs "Paid" is exactly the kind of scannable fact a matrix should
// carry.
// ---------------------------------------------------------------------------

function PricingBadge({ pricing }: { pricing: Pricing }) {
  return (
    <span className="ml-2 inline-block align-middle text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-sand/30 text-brand-charcoal/50 dark:bg-brand-white/10 dark:text-brand-white/40">
      {pricing}
    </span>
  );
}

export default function SupportGrid() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-brand-sand/60">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Which APP programs support each life stage
          </caption>
          <thead>
            <tr className="bg-brand-sand/20 dark:bg-brand-sand/10">
              <th
                scope="col"
                className="text-left font-bold text-brand-charcoal dark:text-brand-white px-5 py-4"
              >
                Program
              </th>
              {stages.map((stage) => (
                <th
                  key={stage.key}
                  scope="col"
                  className="text-center font-bold text-brand-charcoal dark:text-brand-white px-3 py-4"
                >
                  {stage.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {journeyPrograms.map((program, i) => (
              <tr
                key={program.name}
                className={i % 2 === 1 ? "bg-brand-sand/5" : ""}
              >
                <th
                  scope="row"
                  className="text-left align-top px-5 py-4 border-t border-brand-sand/30 font-semibold"
                >
                  <Link
                    href={program.href}
                    className={`hover:opacity-70 transition-opacity ${program.accentText}`}
                  >
                    {program.name}
                  </Link>
                  <PricingBadge pricing={program.pricing} />
                  <p className="text-xs font-normal text-brand-charcoal/60 dark:text-brand-white/50 mt-1 max-w-[16rem]">
                    {program.description}
                  </p>
                </th>
                {stages.map((stage) => {
                  const active = program.stages.includes(stage.key);
                  return (
                    <td
                      key={stage.key}
                      className="text-center align-top px-3 py-4 border-t border-brand-sand/30"
                    >
                      {active ? (
                        <span
                          className={`inline-flex w-6 h-6 rounded-full items-center justify-center ${program.accentDot}`}
                        >
                          <Check
                            size={14}
                            className="text-white"
                            strokeWidth={3}
                          />
                        </span>
                      ) : (
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-brand-sand/40"
                          aria-hidden
                        />
                      )}
                      <span className="sr-only">
                        {active ? "Included" : "Not included"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-4">
        {journeyPrograms.map((program) => (
          <div
            key={program.name}
            className="p-5 rounded-2xl border border-brand-sand/60 bg-white dark:bg-brand-charcoal"
          >
            <Link
              href={program.href}
              className={`font-bold ${program.accentText}`}
            >
              {program.name}
            </Link>
            <PricingBadge pricing={program.pricing} />
            <p className="text-xs text-brand-charcoal/60 dark:text-brand-white/50 mt-1 mb-4">
              {program.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => {
                const active = program.stages.includes(stage.key);
                return (
                  <span
                    key={stage.key}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      active
                        ? `${program.accentBorder} ${program.accentSoftBg} ${program.accentText}`
                        : "border-brand-sand/30 text-brand-charcoal/30 dark:text-brand-white/20"
                    }`}
                  >
                    {stage.label}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

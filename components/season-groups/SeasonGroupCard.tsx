"use client";

import { SeasonGroup } from "@/app/types/groups-directory";
import { formatDueRangeLabel } from "@/lib/season-groups";

// Public-safe version of DirectoryGroupCard (components/groups-directory)
// for the pre-access /season-groups listing: same visual language, but
// never renders an invite link — "Join" always opens the request-access
// modal instead, matching the anti-spam reasoning that gates the rest of
// the directory. See __claude__/season-groups-join-flow.md.

interface SeasonGroupCardProps {
  group: SeasonGroup;
  recommended?: boolean;
  // When the due-date filter has already narrowed the list down to this
  // one group, the "Recommended for you" pill is redundant — there's
  // nothing left to compare it against.
  hideBadge?: boolean;
  onJoin: (group: SeasonGroup) => void;
}

export default function SeasonGroupCard({
  group,
  recommended = false,
  hideBadge = false,
  onJoin,
}: SeasonGroupCardProps) {
  const dueRangeLabel = formatDueRangeLabel(group.due_start, group.due_end);

  return (
    <div
      className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all border ${
        recommended
          ? "border-brand-soft-green bg-brand-soft-green/5"
          : "border-brand-sand/60 dark:border-brand-soft-charcoal"
      }`}
    >
      <div className="flex-1">
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-white flex items-center gap-2 flex-wrap">
          {group.name}
          {recommended && !hideBadge && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-brand-soft-green dark:bg-brand-goldenrod dark:text-brand-charcoal px-2 py-0.5 rounded-full">
              Recommended for you
            </span>
          )}
        </h3>
        {group.description && (
          <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 pt-1">
            {group.description}
          </p>
        )}
        {dueRangeLabel && (
          <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-brand-soft-green dark:text-brand-goldenrod bg-brand-sand/20 px-1.5 py-0.5 rounded">
            {dueRangeLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onJoin(group)}
          className="cursor-pointer bg-brand-soft-green text-white px-10 py-2.5 rounded-full font-bold hover:bg-brand-goldenrod hover:text-brand-charcoal transition-all text-center"
          data-umami-event="Season Groups: Join group"
          data-umami-event-group-id={group.id}
        >
          Join
        </button>
      </div>
    </div>
  );
}

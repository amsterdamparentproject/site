"use client";

import { SeasonGroup } from "@/app/types/groups-directory";
import { formatDueRangeLabel } from "@/lib/season-groups";
import { CustomSocialIcon, components } from "@/components/social-icons";

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
  // Set while this specific card's join action (an already-known Directory
  // member merging straight into this group, no modal) is in flight.
  isJoining?: boolean;
  onJoin: (group: SeasonGroup) => void;
}

export default function SeasonGroupCard({
  group,
  recommended = false,
  hideBadge = false,
  isJoining = false,
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
          {group.platform && (
            <CustomSocialIcon
              kind={group.platform.toLowerCase() as keyof typeof components}
              size={4}
            />
          )}
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
          <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 pt-1">
            {dueRangeLabel}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onJoin(group)}
          disabled={isJoining}
          className="cursor-pointer bg-brand-soft-green text-white px-10 py-2.5 rounded-full font-bold hover:bg-brand-goldenrod hover:text-brand-charcoal transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
          data-umami-event="Season Groups: Join group"
          data-umami-event-group-id={group.id}
        >
          {isJoining ? "Joining…" : "Join"}
        </button>
      </div>
    </div>
  );
}

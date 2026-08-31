"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import PhotoGallery from "@/components/first-year-program/PhotoGallery";
import SeasonGroupCard from "@/components/season-groups/SeasonGroupCard";
import SeasonGroupSignupForm from "@/components/season-groups/SeasonGroupSignupForm";
import { MONTHS, situationYears } from "@/lib/fyp/situation";
import { findMatchedSeasonGroup, sortByDueStart } from "@/lib/season-groups";
import {
  SeasonGroup,
  SeasonGroupExistingProfile,
} from "@/app/types/groups-directory";

// Real meetup photos from past Season Groups — reuses the First Year
// Program's PhotoGallery component (shows 2-up, no arrows needed for
// exactly 2 photos) rather than building a second gallery component.
const seasonGroupPhotos = [
  {
    src: "/static/images/programs/season-groups/autumn-winter-2026-7-oba.webp",
    alt: "A large group of Season Groups parents posing together indoors at the OBA",
    caption: "Autumn/Winter 2026-2027 meetup at the OBA",
  },
  {
    src: "/static/images/programs/season-groups/cafe-table.webp",
    alt: "Parents chatting around a table with coffee and pastries at Papote Cafe",
    caption: "Spring/Summer 2026 meetup at Papote Cafe",
  },
];

interface SeasonGroupsClientProps {
  seasonGroups: SeasonGroup[];
  existingProfile: SeasonGroupExistingProfile | null;
}

export default function SeasonGroupsClient({
  seasonGroups,
  existingProfile,
}: SeasonGroupsClientProps) {
  const years = situationYears();

  // The page-level "when are you due?" filter — separate from the modal's
  // own due-date fields, though the modal is pre-filled from this. Default
  // is this select shown with nothing chosen; picking a date narrows the
  // list down to just the matching Season Group, and the × clears back to
  // the full list.
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const hasFilter = !!(filterMonth && filterYear);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const matchedGroup = useMemo(
    () => findMatchedSeasonGroup(seasonGroups, filterMonth, filterYear),
    [seasonGroups, filterMonth, filterYear],
  );

  // With a matched due date, show ONLY that group — no point listing
  // everyone else's season once we know which one is theirs. With no
  // filter (or a filter that matched nothing), fall back to the full list.
  const visibleGroups = useMemo(() => {
    if (hasFilter && matchedGroup) return [matchedGroup];
    return sortByDueStart(seasonGroups);
  }, [seasonGroups, hasFilter, matchedGroup]);

  const clearFilter = () => {
    setFilterMonth("");
    setFilterYear("");
  };

  return (
    <div className="flex flex-col items-center px-2 w-full max-w-full">
      {/* Hero */}
      <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
        <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
          For expecting and new families in Amsterdam
        </p>
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
          Season Groups
        </h1>
        <p className="mt-4 mb-2 text-lg max-w-xl">
          You don't have to wait for your baby to arrive to start building your
          village. Join the other Amsterdam families due around the same time as
          you — for peer guidance and free bi-monthly meetups run by APP. Open
          to all parents: moms, dads, and partners.
        </p>
      </div>

      {/* Photo gallery */}
      <section className="pt-8 pb-2 w-full max-w-2xl mx-auto">
        <PhotoGallery
          items={seasonGroupPhotos}
          cardWidthClassName="w-[calc(50%-0.5rem)]"
          imageSizes="50vw"
        />
      </section>

      {/* Listing */}
      <section className="py-10 w-full max-w-4xl mx-auto">
        <h2 className="text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod mb-6">
          Find your Season Group
        </h2>

        {/* Due-date filter */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-end justify-center gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filter-due-month"
                className="text-sm font-bold text-brand-soft-green dark:text-brand-goldenrod uppercase"
              >
                Your baby's due/birth date
              </label>
              <div className="flex gap-3">
                <select
                  id="filter-due-month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="min-w-[160px] bg-white dark:bg-brand-white text-brand-charcoal border border-brand-sand/60 rounded-lg pl-4 pr-9 py-3 text-base outline-none focus:border-brand-soft-green"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="min-w-[120px] bg-white dark:bg-brand-white text-brand-charcoal border border-brand-sand/60 rounded-lg pl-4 pr-9 py-3 text-base outline-none focus:border-brand-soft-green"
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {hasFilter && (
              <button
                type="button"
                onClick={clearFilter}
                aria-label="Clear due date filter and show all Season Groups"
                className="cursor-pointer h-12 px-3 text-brand-soft-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-goldenrod"
              >
                × Show all
              </button>
            )}
          </div>
          {hasFilter && !matchedGroup && (
            <p className="text-xs text-brand-soft-charcoal dark:text-brand-sand italic">
              We don't have a Season Group for that month yet — join anyway and
              we'll place you as soon as one opens.
            </p>
          )}
        </div>

        {/* Group list */}
        <div className="grid gap-4">
          {visibleGroups.length > 0 ? (
            visibleGroups.map((group) => (
              <SeasonGroupCard
                key={group.id}
                group={group}
                recommended={hasFilter && group.id === matchedGroup?.id}
                hideBadge={hasFilter && !!matchedGroup}
                onJoin={() => setIsJoinModalOpen(true)}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-brand-sand/10 rounded-xl border border-dashed border-brand-sand">
              <p className="text-brand-soft-charcoal dark:text-brand-white">
                We're setting up the first Season Groups now — join below and
                we'll place you as soon as yours is ready.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Join modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join your Season Group"
      >
        <SeasonGroupSignupForm
          seasonGroups={seasonGroups}
          existingProfile={existingProfile}
          initialDueMonth={filterMonth}
          initialDueYear={filterYear}
        />
      </Modal>
    </div>
  );
}

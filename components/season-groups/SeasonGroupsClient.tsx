"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import PhotoGallery from "@/components/first-year-program/PhotoGallery";
import SeasonGroupCard from "@/components/season-groups/SeasonGroupCard";
import SeasonGroupSignupForm from "@/components/season-groups/SeasonGroupSignupForm";
import { updateUserProfile } from "@/app/groups-directory/actions";
import { MONTHS, situationYears } from "@/lib/fyp/situation";
import {
  findMatchedSeasonGroups,
  mergeSeasonCategory,
  sortByDueStart,
} from "@/lib/season-groups";
import {
  SeasonGroup,
  SeasonGroupExistingProfile,
} from "@/app/types/groups-directory";

// Real meetup photos from past Season Groups — reuses the First Year
// Program's PhotoGallery component (shows 2-up, no arrows needed for
// exactly 2 photos) rather than building a second gallery component.
const seasonGroupPhotos = [
  {
    src: "/static/images/programs/season-groups/autumn-winter-2026-2027-oba.webp",
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
  // The specific group a new visitor clicked "Join" on — the modal is
  // scoped to exactly this group (title, and what gets submitted), no
  // due-date re-asking inside it.
  const [selectedGroupForJoin, setSelectedGroupForJoin] =
    useState<SeasonGroup | null>(null);
  const router = useRouter();
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Plural: the same season can have more than one row (e.g. a WhatsApp
  // group and a Facebook group sharing identical due dates) — see
  // findMatchedSeasonGroups. Both need their own card so a visitor can pick
  // the platform they actually want; picking just one arbitrarily would
  // silently join/highlight the wrong one.
  const matchedGroups = useMemo(
    () => findMatchedSeasonGroups(seasonGroups, filterMonth, filterYear),
    [seasonGroups, filterMonth, filterYear],
  );

  // With a matched due date, show ONLY the matching group(s) — no point
  // listing everyone else's season once we know which one is theirs. With
  // no filter (or a filter that matched nothing), fall back to the full
  // list.
  const visibleGroups = useMemo(() => {
    if (hasFilter && matchedGroups.length > 0) return matchedGroups;
    return sortByDueStart(seasonGroups);
  }, [seasonGroups, hasFilter, matchedGroups]);

  const clearFilter = () => {
    setFilterMonth("");
    setFilterYear("");
  };

  // Each card already tells us exactly which group a visitor wants — for
  // an existing Directory member there's no ambiguity left to resolve, so
  // skip the modal entirely: merge "Season" into their profile and take
  // them straight to that group's highlighted entry in the Directory. A new
  // visitor still needs the modal to collect a name/email, but it's scoped
  // to this exact group too — no due-date picker inside it.
  async function handleJoin(group: SeasonGroup) {
    if (!existingProfile) {
      setSelectedGroupForJoin(group);
      setIsJoinModalOpen(true);
      return;
    }

    setJoinError(null);
    setJoiningGroupId(group.id);
    const result = await updateUserProfile(
      existingProfile.uid,
      existingProfile.name,
      existingProfile.email,
      mergeSeasonCategory(existingProfile.categories),
    );
    if (!result.success) {
      setJoinError(
        "Something went wrong — please try again, or email hello@amsterdamparentproject.nl.",
      );
      setJoiningGroupId(null);
      return;
    }
    router.push(`/groups-directory?group=${group.id}`);
  }

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
        <p className="text-sm text-brand-soft-charcoal dark:text-brand-sand max-w-xl">
          You can find all Season Group links in APP's Amsterdam Parent Groups
          Directory: 100+ local groups supporting parents in Amsterdam.
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
          {hasFilter && matchedGroups.length === 0 && (
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
                recommended={
                  hasFilter && matchedGroups.some((m) => m.id === group.id)
                }
                hideBadge={hasFilter && matchedGroups.length > 0}
                isJoining={joiningGroupId === group.id}
                onJoin={handleJoin}
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

        {joinError && (
          <p className="mt-4 text-center text-sm text-red-500 dark:text-red-400">
            {joinError}
          </p>
        )}
      </section>

      {/* Join modal (new visitors only — an existing Directory member joins
          directly from the card above, no form needed) */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          setSelectedGroupForJoin(null);
        }}
        title={
          selectedGroupForJoin
            ? `Join ${selectedGroupForJoin.name}`
            : "Join your Season Group"
        }
      >
        {selectedGroupForJoin && (
          <SeasonGroupSignupForm group={selectedGroupForJoin} />
        )}
      </Modal>
    </div>
  );
}

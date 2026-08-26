"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import CurriculumData from "@/data/first-year-program/curriculum";
import Image from "@/components/Image";
import { coreContent } from "pliny/utils/contentlayer.js";
import { allAuthors, Authors } from "@/.contentlayer/generated";

// ---------------------------------------------------------------------------
// CurriculumOverview
//
// Condensed section-1 curriculum view for the First Year Program page.
// Replaced an earlier topic-chip filter (too many clicks to discover) with
// a simpler two-tab accordion: "Expert sessions" and "Socials", each a
// single vertical list — click a row to expand it. Sessions show the
// expert avatar(s); socials show the facilitator(s), defaulting to Alex
// Siega when a social doesn't name any (matches the convention used
// elsewhere, e.g. MonthlyJourneyGrid).
//
// Two deliberate exceptions to "session data → sessions tab, social data →
// socials tab": the reserve socials (not yet paired to a month) are left
// out entirely rather than shown under a confusing "Bonus" label, and
// Sleep Social is shown in the Expert sessions tab instead of Socials —
// it's a Q&A with a certified sleep coach, so content-wise it reads as an
// expert session even though it's modeled as a "social" in curriculum.ts.
// ---------------------------------------------------------------------------

const SLEEP_SOCIAL_TITLE = "Sleep Social";

type Tab = "sessions" | "socials";

interface SessionItem {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  components?: string[];
  people: string[]; // author slugs
}

interface SocialItem {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  location?: string;
  logistics?: string;
  note?: string | string[];
  people: string[]; // facilitator slugs, defaulted to alexSiega
}

function buildSessions(): SessionItem[] {
  const items = CurriculumData.map(({ session }, index) => ({
    key: `session-${index}`,
    title: session.title,
    subtitle: session.subtitle,
    description: session.description.trim(),
    components: session.components,
    people: session.experts,
  }));

  // Sleep Social reclassified here (see file header) — found by title
  // rather than a hardcoded month index, so this doesn't silently break if
  // the curriculum's month order ever changes.
  const sleepMonthIndex = CurriculumData.findIndex(
    ({ social }) => social?.title === SLEEP_SOCIAL_TITLE,
  );
  if (sleepMonthIndex !== -1) {
    const { social } = CurriculumData[sleepMonthIndex];
    items.push({
      key: "session-sleep-social",
      title: social.title,
      subtitle: social.subtitle,
      description: social.description.trim(),
      people:
        social.facilitators && social.facilitators.length > 0
          ? social.facilitators
          : ["alexSiega"],
    });
  }

  return items;
}

function buildSocials(): SocialItem[] {
  const items: SocialItem[] = [];

  CurriculumData.forEach(({ social }, index) => {
    if (!social || social.placeholder) return;
    if (social.title === SLEEP_SOCIAL_TITLE) return; // shown in Expert sessions instead
    items.push({
      key: `social-${index}`,
      title: social.title,
      subtitle: social.subtitle,
      description: social.description,
      location: social.location,
      logistics: social.logistics,
      note: social.note,
      people:
        social.facilitators && social.facilitators.length > 0
          ? social.facilitators
          : ["alexSiega"],
    });
  });

  return items;
}

const SESSIONS = buildSessions();
const SOCIALS = buildSocials();

function getAuthorsBySlugs(slugs: string[]) {
  return slugs
    .map((slug) => {
      const found = allAuthors.find((p) => p.slug === slug);
      return found ? coreContent(found as Authors) : null;
    })
    .filter(Boolean);
}

function AvatarStack({
  people,
}: {
  people: ReturnType<typeof getAuthorsBySlugs>;
}) {
  if (people.length === 0) return null;
  return (
    <div className="flex -space-x-3 overflow-hidden shrink-0">
      {people.map((person, i) => (
        <div
          key={person?.slug}
          className="relative inline-block rounded-full ring-2 ring-brand-white dark:ring-brand-charcoal bg-brand-white dark:bg-brand-charcoal"
          style={{ zIndex: people.length - i }}
        >
          <Image
            src={person?.avatar || "/static/images/logo/light.png"}
            width={40}
            height={40}
            alt={`${person?.name} headshot`}
            className="h-9 w-9 rounded-full object-cover grayscale-[20%]"
          />
        </div>
      ))}
    </div>
  );
}

function PeopleDetail({
  people,
  label,
}: {
  people: ReturnType<typeof getAuthorsBySlugs>;
  label: string;
}) {
  if (people.length === 0) return null;
  return (
    <div className="border-t border-brand-soft-green/10 pt-4">
      <h5 className="text-sm text-brand-charcoal dark:text-brand-white/80 mb-4">
        {label}
      </h5>
      <div className="flex flex-wrap gap-6">
        {people.map((person) => (
          <div key={person?.slug} className="flex items-center gap-3">
            <Image
              src={person?.avatar || "/static/images/logo/light.png"}
              width={40}
              height={40}
              alt={`${person?.name} headshot`}
              className="h-9 w-9 rounded-full object-cover grayscale-[20%]"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-brand-charcoal dark:text-brand-white/80 leading-tight">
                {person?.name}
              </span>
              {person?.occupation && (
                <span className="text-xs text-brand-soft-green dark:text-brand-goldenrod font-medium">
                  {person.occupation}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

interface RowProps {
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  people: string[];
  peopleLabel: string;
  children: React.ReactNode;
}

function Row({
  title,
  subtitle,
  isOpen,
  onToggle,
  people,
  peopleLabel,
  children,
}: RowProps) {
  const authors = getAuthorsBySlugs(people);

  return (
    <div
      className={`rounded-2xl border overflow-hidden bg-white dark:bg-brand-charcoal transition-all ${
        isOpen
          ? "border-brand-soft-green"
          : "border-brand-sand/60 hover:border-brand-soft-green"
      }`}
    >
      <button
        onClick={onToggle}
        className="cursor-pointer w-full text-left px-5 py-4 flex items-center justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-brand-charcoal dark:text-brand-white leading-tight">
            {title}
          </h4>
          <p className="text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 mt-0.5">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <AvatarStack people={authors} />
          <ChevronDown
            size={18}
            className={`shrink-0 text-brand-sand transition-transform ${
              isOpen ? "rotate-180 text-brand-soft-green" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-4 border-t border-brand-soft-green/10 space-y-4">
            {children}
            <PeopleDetail people={authors} label={peopleLabel} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CurriculumOverview
// ---------------------------------------------------------------------------

export default function CurriculumOverview() {
  const [activeTab, setActiveTab] = useState<Tab>("sessions");
  const [openKey, setOpenKey] = useState<string | null>(null);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setOpenKey(null);
  }

  function toggleRow(key: string) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Centered pill tabs */}
      <div className="flex justify-center gap-3 mb-8">
        {(
          [
            { tab: "sessions" as Tab, label: "Expert sessions" },
            { tab: "socials" as Tab, label: "Socials" },
          ] as const
        ).map(({ tab, label }) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => switchTab(tab)}
              className={`cursor-pointer px-7 py-3 rounded-full text-base font-bold transition-all ${
                active
                  ? "bg-brand-soft-green text-white"
                  : "bg-brand-sand/20 text-brand-charcoal/70 dark:text-brand-white/60 hover:bg-brand-sand/30"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {activeTab === "sessions"
          ? SESSIONS.map((item) => (
              <Row
                key={item.key}
                title={item.title}
                subtitle={item.subtitle}
                isOpen={openKey === item.key}
                onToggle={() => toggleRow(item.key)}
                people={item.people}
                peopleLabel="Expert content by:"
              >
                <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
                {!!item.components?.length && (
                  <div className="bg-brand-soft-green/5 rounded-xl py-4 px-6">
                    <h5 className="text-sm font-bold text-brand-charcoal dark:text-brand-goldenrod mb-2">
                      What we cover
                    </h5>
                    <ul className="grid grid-cols-1 gap-2">
                      {item.components.map((line, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-brand-soft-charcoal dark:text-brand-white/80"
                        >
                          <span className="mx-1 mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-goldenrod" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Row>
            ))
          : SOCIALS.map((item) => {
              const goodToKnow = [
                item.location && `📍 ${item.location}`,
                item.logistics,
                ...(item.note
                  ? Array.isArray(item.note)
                    ? item.note
                    : [item.note]
                  : []),
              ].filter(Boolean) as string[];

              return (
                <Row
                  key={item.key}
                  title={item.title}
                  subtitle={item.subtitle}
                  isOpen={openKey === item.key}
                  onToggle={() => toggleRow(item.key)}
                  people={item.people}
                  peopleLabel="Facilitated by:"
                >
                  <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 leading-relaxed">
                    {item.description}
                  </p>
                  {goodToKnow.length > 0 && (
                    <div className="bg-brand-goldenrod/5 rounded-xl py-4 px-6">
                      <h5 className="text-sm font-bold text-brand-charcoal dark:text-brand-goldenrod mb-2">
                        Good to know
                      </h5>
                      <ul className="grid grid-cols-1 gap-2">
                        {goodToKnow.map((line, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-brand-soft-charcoal dark:text-brand-white/80"
                          >
                            <span className="mx-1 mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-goldenrod" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Row>
              );
            })}
      </div>

      <p className="text-center text-xs text-brand-soft-charcoal/50 dark:text-brand-white/40 mt-6 italic">
        The whole 6-month curriculum repeats as your baby (and you) grow.
      </p>
    </div>
  );
}

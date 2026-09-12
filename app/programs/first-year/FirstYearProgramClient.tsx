"use client";

import { useState } from "react";
import ShowcaseButton from "@/components/ShowcaseButton";
import CurriculumOverview from "@/components/first-year-program/CurriculumOverview";
import SituationSelector from "@/components/first-year-program/SituationSelector";
import PricingPreview from "@/components/first-year-program/PricingPreview";
import AccessToday from "@/components/first-year-program/AccessToday";
import CostsBreakdown from "@/components/first-year-program/CostsBreakdown";
import ProgramFAQ from "@/components/first-year-program/ProgramFAQ";
import PhotoGallery from "@/components/first-year-program/PhotoGallery";
import { useSearchParams } from "next/navigation";
import Link from "@/components/Link";
import { MoveRight } from "lucide-react";
import FYPJoinForm from "@/components/first-year-program/FYPJoinForm";
import { resolveInitialMonthYear, deriveSituation } from "@/lib/fyp/situation";
import type { CalendarEvent } from "@/lib/calendar";

// ---------------------------------------------------------------------------
// Photo gallery data
// ---------------------------------------------------------------------------

// Testimonial quote cards (Alex's own designs) interspersed among the real
// meetup photos below — no `caption` needed since the quote is baked into
// the image itself.
const communityPhotos = [
  {
    src: "/static/images/programs/first-year-program/gallery/cafe-de-hallen.webp",
    alt: "Parents chatting and holding babies at a De Hallen café meetup",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/testimonial-single-mom.webp",
    alt: "Parent testimonial: “Loved getting to meet other parents in my same situation. Being a single mom is very lonely so it helped loads.”",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/museum-group.webp",
    alt: "A group of parents and babies posing together at the Rijksmuseum",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/testimonial-in-person-meetups.webp",
    alt: "Parent testimonial: “The in-person meet ups were of most value, chatting and exchanging stories and realizing your baby is 'normal' and not as wild as you thought!”",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/park-walk.webp",
    alt: "Parents walking together with a stroller along a tree-lined park path",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/testimonial-stay-connected.webp",
    alt: "Parent testimonial: “Even though the sessions are complete, I do feel like we'll stay connected.”",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/cafe-table.webp",
    alt: "A group of parents gathered around a café table for a social meetup",
  },
];

const curriculumPhotos = [
  {
    src: "/static/images/programs/first-year-program/gallery/tummy-time-reading.webp",
    alt: "Two babies on their tummies reading a picture book together",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/zoom-intro-call.webp",
    alt: "A live virtual expert discussion during the First Year Program",
    caption:
      "Expert discussions happen live online, so you can get support regardless of what your morning looked like.",
  },
  {
    src: "/static/images/programs/first-year-program/gallery/playroom.webp",
    alt: "Parents and babies playing together in a soft playroom",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const highlights = [
  {
    icon: "🩺",
    feature: "Expert discussions",
    scenario: "For expert guidance without the research overwhelm",
  },
  {
    icon: "🤝",
    feature: "1:1 parent match",
    scenario: "For when you want a friend, not just a community",
  },
  {
    icon: "☕️",
    feature: "Group socials",
    scenario:
      "For discovering the baby-friendly side of Amsterdam alongside other families",
  },
  {
    icon: "💬",
    feature: "Moderated community",
    scenario:
      "For when you need reassurance from a small group of local parents, not AI",
  },
];

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
  header: string;
  subtitle?: React.ReactNode;
}

const SectionHeader = ({ header, subtitle }: SectionHeaderProps) => {
  const headerMargin = subtitle ? "mb-4" : "mb-12";
  return (
    <>
      <h2
        className={`text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod ${headerMargin}`}
      >
        {header}
      </h2>
      {subtitle && (
        <div className="text-center text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 max-w-2xl mx-auto leading-relaxed italic mb-8 px-4">
          {subtitle}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// FTPBanner
// ---------------------------------------------------------------------------

function FTPBanner() {
  const params = useSearchParams();
  if (params.get("from") !== "fourth-trimester") return null;

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-brand-soft-green px-4 py-3 text-center text-sm text-white">
      The Fourth Trimester Program is now the{" "}
      <strong>First Year Program</strong>: Whole family support through
      pregnancy and your baby&apos;s first year.{" "}
      <a
        href="#ftp-comparison"
        className="font-semibold underline text-brand-goldenrod hover:text-brand-goldenrod/80"
      >
        Learn more
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DepositConfirmedBanner
// ---------------------------------------------------------------------------

function DepositConfirmedBanner() {
  const params = useSearchParams();
  const action = params.get("deposit");
  if (!action) return null;

  const message =
    action === "transfer_fyp"
      ? "Thanks for transferring your deposit to the First Year Program. We can't wait to welcome you in September! ❤️"
      : action === "refund"
        ? "We've received your request for a refund. It will be processed within 7 business days."
        : null;

  if (!message) return null;

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-brand-soft-green px-4 py-3 text-center text-sm text-white">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface FirstYearProgramClientProps {
  // Prefill for FYPJoinForm — resolved server-side by
  // app/programs/first-year/page.tsx from a ?legacyId= URL param (the
  // legacy-transition email's personalized "Register" link, see
  // lib/emails/fyp-legacy-transition.ts's buildJoinUrl) and passed down as
  // plain props.
  //
  // IMPORTANT: this component does NOT read these off useSearchParams()
  // itself, on purpose. An earlier version did exactly that — reading
  // firstName/lastName/email straight from the client-visible URL — which
  // Alex flagged as a real privacy problem (PII in browser history,
  // server/CDN logs, analytics tools, Referer headers). The URL only ever
  // carries the opaque legacyId now; see page.tsx's resolveLegacyPrefill
  // for where the actual lookup happens.
  initialFirstName?: string;
  initialLastName?: string;
  initialEmail?: string;
  initialMonth?: string;
  initialYear?: string;
  // Server-fetched (page.tsx) — next few real, dated events whose title
  // matches "First Year Program". MVP filter, see
  // lib/supabase/queries/events.ts's getFirstYearProgramEvents().
  initialUpcomingEvents?: CalendarEvent[];
}

export default function FirstYearProgramClient({
  initialFirstName,
  initialLastName,
  initialEmail,
  initialMonth,
  initialYear,
  initialUpcomingEvents,
}: FirstYearProgramClientProps) {
  // Due/birth month+year — the single source of truth for "when is your
  // baby due, or here already" across the whole page. Falls back to
  // today's month/year whenever there's no (valid) legacy prefill, same
  // rule FYPJoinForm used to apply on its own before this was lifted here.
  // SituationSelector (top of section 2) and FYPJoinForm both read/write
  // this same state, so picking a date once carries through to the
  // access-today content, the personalized pricing, and the join form.
  const [dueDate, setDueDate] = useState(() =>
    resolveInitialMonthYear(initialMonth, initialYear),
  );
  const { month, year } = dueDate;
  const situation = deriveSituation(month, year);

  function handleMonthChange(newMonth: string) {
    setDueDate((prev) => ({ ...prev, month: newMonth }));
  }
  function handleYearChange(newYear: string) {
    setDueDate((prev) => ({ ...prev, year: newYear }));
  }

  const upcomingEvents = initialUpcomingEvents ?? [];

  return (
    <>
      <FTPBanner />
      <DepositConfirmedBanner />
      <div className="flex-col justify-center px-2 items-center w-full max-w-full">
        <div
          className="pb-6 flex flex-col items-center w-full"
          id="program-description"
        >
          {/* Hero */}
          <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
            <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
              Pregnancy through your baby's first year
            </p>
            <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
              First Year Program
            </h1>
            <p className="mt-4 mb-2 text-lg max-w-xl">
              <b>
                You don't have to figure out early parenthood in Amsterdam
                alone.
              </b>{" "}
              Expert-led guidance, a matched local parent friend, and a
              community of families who are exactly where you are.
            </p>
          </div>

          <div className="mt-6 mb-8">
            <ShowcaseButton
              href="#join"
              title="Find your place with us"
              fill={true}
              umamiName="First Year Program: Join program"
            />
          </div>

          <div className="max-w-xl">
            <p className="mb-6 mx-4">
              When your kraamzorg and midwife step back, we step in. Built by
              psychologists, lactation consultants, and postpartum coaches —
              including the parents who started APP because they felt this exact
              gap.
            </p>
          </div>

          {/* Community gallery */}
          <section className="py-8 max-w-5xl mx-auto w-full">
            <SectionHeader
              header="Connecting real families"
              subtitle="Not another giant group chat abyss. Real parents with newborns and babies in Amsterdam, eager to build the village with you."
            />
            <PhotoGallery items={communityPhotos} />
          </section>

          {/* Highlights */}
          <div className="my-8 px-4 w-full max-w-xl">
            <h2 className="text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod mb-6 md:mb-12">
              How we support you
            </h2>
            <div className="flex flex-col gap-2">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:grid md:items-center gap-1 md:gap-4 py-2 md:min-h-[5rem]"
                  style={{ gridTemplateColumns: "1fr auto 1fr" }}
                >
                  <div className="flex items-center gap-3 md:contents">
                    <span className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-brand-goldenrod text-base font-bold text-brand-charcoal whitespace-nowrap">
                      {item.icon} {item.feature}
                    </span>
                    <MoveRight
                      className="text-brand-soft-green dark:text-brand-goldenrod shrink-0"
                      size={20}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span className="text-sm text-brand-charcoal/70 dark:text-brand-white/60 italic md:hidden ml-4 mt-1">
                    {item.scenario}
                  </span>
                  <span className="hidden md:block text-sm text-brand-charcoal/70 dark:text-brand-white/60 italic">
                    {item.scenario}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── How you experience the program ───────────────────────────
              Everything below is personalized to the situation picked in
              SituationSelector: what you get access to today, and pricing. */}
          <section className="my-8 w-full max-w-4xl mx-auto px-4">
            <SectionHeader
              header="What happens when you join"
              subtitle="Tell us where you are, and we'll show you the support that's here for you — starting immediately ❤️"
            />

            <SituationSelector
              month={month}
              year={year}
              situation={situation}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
            />

            <PricingPreview situation={situation} />

            <div className="mt-12">
              <AccessToday situation={situation} events={upcomingEvents} />
            </div>
          </section>

          {/* Curriculum — condensed: themes + session titles only, no
              accordion, no expert photos. The full monthly breakdown used
              to live here (MonthlyJourneyGrid); see CurriculumOverview.tsx
              for why it was simplified for this page. */}
          <section className="mt-10 mb-8 w-full">
            <SectionHeader
              header="Where experts & peers come together"
              subtitle="Expert-led chats and local socials that repeat every 6 months as your baby (and you!) grow."
            />

            <CurriculumOverview />

            <div className="max-w-4xl mx-auto m-10">
              <PhotoGallery items={curriculumPhotos} />
            </div>
          </section>

          {/* Costs */}
          <section
            id="pricing"
            className="mb-10 text-center scroll-m-32 w-full"
          >
            <SectionHeader
              header="Program fees"
              subtitle={
                <>
                  We're a nonprofit balancing fair pay for our experts with
                  access for families. If price is a barrier,{" "}
                  <Link
                    href="mailto:hello@amsterdamparentproject.nl"
                    className="text-brand-goldenrod hover:text-brand-soft-green"
                  >
                    contact us
                  </Link>{" "}
                  — we&apos;ll work with you.
                </>
              }
            />
            <CostsBreakdown situation={situation} />
          </section>

          {/* Join */}
          <section id="#join">
            <FYPJoinForm
              initialFirstName={initialFirstName}
              initialLastName={initialLastName}
              initialEmail={initialEmail}
              month={month}
              year={year}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
            />
          </section>
        </div>

        {/* FAQ */}
        <div id="faq" className="scroll-m-32 mt-6">
          <SectionHeader
            header="Common questions"
            subtitle={
              <>
                If you have any other questions, please{" "}
                <a
                  href="mailto:hello@amsterdamparentproject.nl"
                  className="text-brand-goldenrod hover:text-brand-soft-green"
                >
                  contact us
                </a>
                .
              </>
            }
          />
          <ProgramFAQ />
        </div>
      </div>
    </>
  );
}

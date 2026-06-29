"use client";

import ShowcaseButton from "@/components/ShowcaseButton";
import SessionsAccordion from "@/components/first-year-program/SessionsAccordion";
import CostsBreakdown from "@/components/first-year-program/CostsBreakdown";
import ProgramFAQ from "@/components/first-year-program/ProgramFAQ";
import ProgramJourney from "@/components/first-year-program/ProgramJourney";
import { useSearchParams } from "next/navigation";
import Link from "@/components/Link";
import { MoveRight } from "lucide-react";
import FYPJoinForm from "@/components/first-year-program/FYPJoinForm";

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

export default function FirstYearProgramClient() {
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
              From pregnancy through the first year
            </p>
            <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
              First Year Program
            </h1>
            <p className="mt-4 max-w-xl">
              A{" "}
              <b className="dark:text-brand-goldenrod text-brand-soft-green">
                local, nonprofit, whole family support system built for your
                baby&apos;s first year
              </b>
              . Expert-led discussions, curated socials, 1:1 peer matching, and
              a moderated community — all you need to transition with confidence
              into newborn parenthood.
            </p>
          </div>

          <div className="mt-6 mb-8">
            <ShowcaseButton
              href="#join"
              title="Find your place"
              fill={true}
              umamiName="First Year Program: Join program"
            />
          </div>

          <div className="max-w-xl">
            <p className="mb-6 mx-4">
              When support from your kraamzorg and midwife ends, we step in to{" "}
              <b>bridge the gap between expert and peer guidance</b>: because
              best parenting practices come from both science and shared
              experience.
            </p>
            <p className="mb-6 mx-4">
              The program is a{" "}
              <b>
                community labor of love from local parents and postpartum
                experts
              </b>
              . It's built by psychologists, lactation consultants,
              return-to-work specialists, postpartum coaches, and more, plus the
              founders of APP — who stood up this whole organization because
              they felt the support gap firsthand with their babies.
            </p>
          </div>

          {/* Highlights */}
          <div className="mt-6 mb-12 px-4 w-full max-w-xl">
            <h2 className="text-center text-3xl font-bold text-brand-charcoal dark:text-brand-goldenrod mb-6 md:mb-12">
              The four support pillars we believe in
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

          {/* Journey */}
          <section className="py-8 px-4 max-w-4xl mx-auto flex items-center flex-col justify-center">
            <SectionHeader
              header="How it works"
              subtitle="Join in pregnancy and the whole family gets immediate support — free (and refundable) until your baby arrives. Already have a baby? Jump right in. Support is there for you when and where you need it, for as long as you need."
            />
            <ProgramJourney />
          </section>

          {/* Curriculum */}
          <section className="mt-10 mb-8">
            <SectionHeader
              header="Expert curriculum"
              subtitle={
                <>
                  Evidence-based, expert-led discussions and resource guides
                  covering every major transition in your first year — from
                  newborn basics to returning to work. Topics rotate every 6
                  months so the conversation deepens as your family grows.
                </>
              }
            />
            <SessionsAccordion />
          </section>

          {/* Costs */}
          <section className="mb-10 text-center">
            <SectionHeader
              header="Program fees"
              subtitle={
                <>
                  As a nonprofit, we strive to balance access with fair pay for
                  our experts and facilitators. If price is a barrier, please{" "}
                  <Link
                    href="mailto:hello@amsterdamparentproject.nl"
                    className="text-brand-goldenrod hover:text-brand-soft-green"
                  >
                    contact us
                  </Link>{" "}
                  — we&apos;re happy to accommodate your needs.
                </>
              }
            />
            <CostsBreakdown />
          </section>

          {/* Join */}
          <section id="#join">
            <FYPJoinForm />
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

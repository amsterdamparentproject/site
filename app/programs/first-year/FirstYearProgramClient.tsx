"use client";

import ShowcaseButton from "@/components/ShowcaseButton";
import FYPCohorts from "@/data/first-year-program/cohorts";
import SessionsAccordion from "@/components/first-year-program/SessionsAccordion";
import CohortsAccordion from "@/components/fourth-trimester-program/CohortsAccordion";
import CostsBreakdown from "@/components/first-year-program/CostsBreakdown";
import ProgramHighlightBox from "@/components/fourth-trimester-program/ProgramHighlightBox";
import ProgramFAQ from "@/components/first-year-program/ProgramFAQ";
import ProgramJourney from "@/components/first-year-program/ProgramJourney";
import { ReactNode } from "react";
import Link from "@/components/Link";

const highlights = [
  {
    icon: "🤝",
    title: "1:1 peer match",
    description:
      "Get matched with another parent via Postpartum Post — someone who gets where you are or where you're headed, for personal support beyond the group.",
  },
  {
    icon: "🩺",
    title: "Expert guidance",
    description:
      "Monthly expert-led discussions covering the full arc of your first year — from newborn feeding and physical recovery to relationships, identity, and returning to work.",
  },
  {
    icon: "☕️",
    title: "Local socials",
    description:
      "Planned meetups at curated, baby-friendly spots around Amsterdam. We handle the logistics; you just show up with your baby.",
  },
  {
    icon: "💬",
    title: "Moderated community",
    description:
      "A private, psychotherapist-moderated WhatsApp group with a close-knit cohort of local parents — available 24/7 when you need it most.",
  },
];

interface SectionHeaderProps {
  header: string;
  subtitle?: ReactNode;
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

export default function FirstYearProgramClient() {
  return (
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
            Your{" "}
            <b className="dark:text-brand-goldenrod text-brand-soft-green">
              nonprofit support system through your baby's entire first year
            </b>
            . Expert-led discussions, curated socials, 1:1 peer matching, and a
            moderated community — starting in pregnancy, lasting through the
            milestones that matter.
          </p>
        </div>

        <div className="mt-6 mb-8">
          <ShowcaseButton
            href="#find-your-cohort"
            title="Reserve your spot"
            fill={true}
            umamiName="First Year Program: Join program"
          />
        </div>

        <div className="max-w-xl">
          <p className="mb-6 mx-4">
            The first year of parenthood is the most researched, most discussed,
            and least supported period in modern family life. Most of the world
            has always understood it as a communal responsibility — we're
            building that village for families in Amsterdam who don't have one
            yet.
          </p>
          <p className="mb-6 mx-4">
            <b>
              Join in pregnancy or with a newborn, and pay nothing until your
              baby arrives.
            </b>{" "}
            Monthly billing means you're never locked in — but the community,
            the expert sessions, and your 1:1 peer match are there every month
            when you need them.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mb-12 px-4 max-w-3xl w-full">
          {highlights.map((item, index) => (
            <ProgramHighlightBox
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        {/* Journey */}
        <section className="py-8 px-4 max-w-4xl mx-auto flex items-center flex-col justify-center">
          <SectionHeader header="How it works" />
          <ProgramJourney />
        </section>

        {/* Curriculum */}
        <section className="mt-10 mb-8">
          <SectionHeader
            header="Expert curriculum"
            subtitle={
              <>
                Evidence-based, expert-led discussions and resource guides covering
                every major transition in your first year — from newborn basics to
                returning to work. Topics rotate every 6 months so the conversation
                deepens as your family grows.
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
                As a nonprofit, we strive to balance access with fair pay. If
                price is a barrier, please{" "}
                <Link
                  href="mailto:hello@amsterdamparentproject.nl"
                  className="text-brand-goldenrod hover:text-brand-soft-green"
                >
                  contact us
                </Link>{" "}
                — we're happy to accommodate your needs.
              </>
            }
          />
          <CostsBreakdown />
        </section>

        {/* Cohorts */}
        <div className="w-full max-w-full overflow-x-clip">
          <section
            id="find-your-cohort"
            className="scroll-mt-20 md:scroll-mt-32 bg-brand-sand/20 dark:bg-brand-soft-charcoal border border-brand-sand/10 py-10 px-4 md:px-8 rounded-lg w-full"
          >
            <SectionHeader
              header="Find your cohort"
              subtitle="Reserve your spot at any stage — during pregnancy or with a newborn. No payment until after your due date."
            />

            <div className="max-w-3xl mx-auto mt-8 w-full px-2 md:px-4">
              <div className="space-y-4">
                {FYPCohorts.filter((c) => !c.draft || c.groupStatus === "Open").map(
                  (cohort, index) => (
                    <CohortsAccordion key={index} cohort={cohort} />
                  )
                )}
              </div>

              <p className="text-center text-xs text-brand-charcoal dark:text-brand-white/80 mt-8 max-w-md mx-auto leading-normal">
                Don't see your cohort?{" "}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
                  className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-white/80"
                >
                  Join the interest list
                </a>{" "}
                to hear about new cohorts first.
              </p>
            </div>
          </section>
        </div>
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
  );
}

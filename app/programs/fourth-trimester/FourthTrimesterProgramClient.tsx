"use client";

import ShowcaseButton from "@/components/ShowcaseButton";
import FTPCohorts from "@/data/fourth-trimester-program/cohorts";
import SessionsAccordion from "@/components/fourth-trimester-program/SessionsAccordion";
import CohortsAccordion from "@/components/fourth-trimester-program/CohortsAccordion";
import CostsBreakdown from "@/components/fourth-trimester-program/CostsBreakdown";
import ProgramHighlightBox from "@/components/fourth-trimester-program/ProgramHighlightBox";
import ProgramFAQ from "@/components/fourth-trimester-program/ProgramFAQ";
import { ReactNode } from "react";
import ProgramJourney from "@/components/fourth-trimester-program/ProgramJourney";

const highlights = [
  {
    icon: "🩺",
    title: "Expert guidance",
    description:
      "Regular 'Ask Me Anything' sessions with Amsterdam’s postpartum specialists, covering newborn growth, parenting skills, and shared experiences.",
  },
  {
    icon: "☕️",
    title: "Local socials",
    description:
      "Planned meetups at curated, newborn-friendly spots in your area and around the city. We handle the logistics; you just show up with your baby!",
  },
  {
    icon: "💬",
    title: "Moderated chat",
    description:
      "Peer support with safety built in: a private, psychotherapist-moderated chat with a close-knit group of local parents with newborns.",
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

export default function FourthTrimesterProgramClient() {
  return (
    <div className="flex-col justify-center px-2 items-center w-full max-w-full">
      <div
        className="pb-6 flex flex-col items-center w-full"
        id="program-description"
      >
        <div className="flex flex-col text-center items-center space-y-2 pt-6 md:space-y-5">
          <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
            Newborn family support
          </p>
          <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
            Fourth Trimester Program
          </h1>
          <p className="mt-4 max-w-xl">
            Your{" "}
            <b className="dark:text-brand-goldenrod text-brand-soft-green">
              nonprofit, neighborhood support system in the first months
              postpartum
            </b>
            . Expert-led discussions and curated socials with local newborn
            parents to help you transition with confidence to new parenthood.
          </p>
        </div>

        <div className="mt-6 mb-8">
          <ShowcaseButton
            href="#find-your-cohort"
            title="Find your cohort"
            fill={true}
            umamiName="Fourth Trimester Program: Join program"
          />
        </div>

        <div className="max-w-xl">
          <p className="mb-6 mx-4">
            The Fourth Trimester Program cuts through the noise of overwhelming,
            conflicting advice to focus on what matters: a healthy, calm, and
            confident transition to newborn parenthood for your whole
            family.{" "}
          </p>
          <p className="mb-6 mx-4">
            <b>
              When support from your kraamzorg and midwife ends, we step in to
              bridge the gap between professional expertise and real-world
              parenting
            </b>{" "}
            — because "best practices" come from both science and shared
            experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-12 px-4">
          {highlights.map((item, index) => (
            <ProgramHighlightBox
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        <section className="py-8 px-4 max-w-4xl mx-auto flex items-center flex-col justify-center">
          <SectionHeader header="Your family's transition to newborn parenthood" />
          <ProgramJourney />
        </section>

        <section className="mt-10 mb-8">
          <SectionHeader
            header="Expert curriculum"
            subtitle="Evidence-based and expert-led discussions plus resource guides for the whole family, tracking your newborn's development — and yours as new parents"
          />
          <SessionsAccordion />
        </section>

        <section className="mb-10 text-center">
          <SectionHeader
            header="Program fees"
            subtitle={
              <>
                As a nonprofit, we strive to balance access with fair pay. If
                price is an issue, please{" "}
                <a
                  href="mailto:hello@amsterdamparentproject.nl"
                  className="text-brand-goldenrod hover:text-brand-soft-green"
                >
                  contact us
                </a>{" "}
                — we're happy to accommodate your financial needs.
              </>
            }
          />
          <CostsBreakdown />
        </section>

        <div className="w-full max-w-full overflow-x-clip">
          <section
            id="find-your-cohort"
            className="scroll-mt-20 md:scroll-mt-32 bg-brand-sand/20 dark:bg-brand-soft-charcoal border border-brand-sand/10 py-10 px-4 md:px-8 rounded-lg w-full"
          >
            <SectionHeader
              header="Get started: Find your cohort"
              subtitle="Reserve your spot at any stage of your journey. Once your cohort reaches capacity, we’ll email you to finalize registration, process payment, and introduce your group."
            />

            <div className="max-w-3xl mx-auto mt-8 w-full px-2 md:px-4">
              <div className="space-y-4">
                {FTPCohorts.map((cohort, index) => (
                  <CohortsAccordion key={index} cohort={cohort} />
                ))}
              </div>

              <p className="text-center text-xs text-brand-charcoal dark:text-brand-white/80 mt-8 max-w-md mx-auto leading-normal">
                Don’t see your due date?{" "}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
                  className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-white/80"
                >
                  Join the general interest list
                </a>{" "}
                to be the first to know when new cohorts are released.
              </p>
            </div>
          </section>
        </div>
      </div>

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

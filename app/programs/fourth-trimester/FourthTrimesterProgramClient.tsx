"use client";

import ShowcaseButton from "@/components/ShowcaseButton";
import FTPCohorts from "@/data/fourth-trimester-program/cohorts";
import SessionsAccordion from "@/components/fourth-trimester-program/SessionsAccordion";
import CohortsAccordion from "@/components/fourth-trimester-program/CohortsAccordion";
import CostsBreakdown from "@/components/fourth-trimester-program/CostsBreakdown";
import ProgramHighlightBox from "@/components/fourth-trimester-program/ProgramHighlightBox";
import ProgramFAQ from "@/components/fourth-trimester-program/ProgramFAQ";

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

const HeaderAndSubtitle = ({ header, subtitle }) => {
  return (
    <>
      <h2 className="text-center text-3xl font-bold text-brand-charcoal mb-4">
        {header}
      </h2>
      <p className="text-center text-sm text-brand-soft-charcoal/70 max-w-xl mx-auto leading-relaxed italic mb-8">
        {subtitle}
      </p>
    </>
  );
};

export default function FourthTrimesterProgramClient() {
  return (
    <div className="flex-column justify-center mx-2">
      <div
        className="pt-6 pb-6 flex flex-col items-center"
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

        <div className="mt-6 mb-10">
          <ShowcaseButton
            href="#find-cohort"
            title="Find your cohort"
            fill={true}
            umamiName="Fourth Trimester Program: Join program"
          />
        </div>

        <div className="max-w-xl">
          <p className="mb-6">
            The Fourth Trimester Program cuts through the noise of overwhelming,
            conflicting advice to focus on what matters: a healthy, calm, and
            confident transition for your whole family.{" "}
            <b>
              When support from your kraamzorg and midwife ends, we step in to
              bridge the gap between professional expertise and real-world
              parenting
            </b>{" "}
            — because "best practices" come from both science and shared
            experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-12 px-4">
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
          <h2 className="text-3xl max-w-sm font-bold text-brand-charcoal mb-16 text-center">
            Your family's transition to newborn parenthood
          </h2>

          <div className="relative space-y-12 before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-soft-green before:via-brand-goldenrod before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white bg-brand-soft-green  text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-soft-green/10 bg-white">
                <h4 className="font-bold text-brand-charcoal">
                  Save your family's spot
                </h4>
                <p className="text-xs font-medium tracking-wide text-brand-soft-green italic mt-1 mb-2">
                  Up to 8 weeks after birth
                </p>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                  Pay the €25 reservation fee to join the program. We’ll begin
                  matching you with other families with similar due dates and
                  neighborhoods to build a cohort.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white bg-brand-goldenrod text-white  shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-goldenrod/10 bg-white">
                <h4 className="font-bold text-brand-charcoal">
                  The cohort starts
                </h4>
                <p className="text-xs font-medium tracking-wide text-brand-goldenrod italic mt-1 mb-2">
                  4-8 weeks after birth
                </p>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                  When your midwife support ends, our program begins!
                  Participate in expert-led AMAs, moderated peer discussions,
                  and local socials.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-brand-soft-green text-white shadow shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-soft-green/10 bg-white shadow-sm">
                <h4 className="font-bold text-brand-charcoal">
                  Continuous connection
                </h4>
                <p className="text-xs font-medium tracking-wide text-brand-soft-green italic mt-1 mb-2">
                  4 months after birth, and beyond
                </p>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                  After the program ends, your local expert network and peer
                  chat remain active. Your neighborhood support is now
                  permanent, for your family's ever-evolving needs 🫶🏻
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 mb-8">
          <HeaderAndSubtitle
            header="Expert curriculum"
            subtitle="Expert-led modules for the whole family that track your 12-week
            journey with your newborn"
          />
          <SessionsAccordion />
        </section>

        <section className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-brand-charcoal mb-4">
            Program fees
          </h2>
          <p className="text-sm text-brand-soft-charcoal/70 max-w-xl mx-auto leading-relaxed italic mb-8">
            As a nonprofit program, the program tiers reflect our commitment to
            balancing community access with paying our experts and facilitators
            fairly. If the full price is out of reach, please{" "}
            <a
              className="text-brand-goldenrod font-medium hover:text-brand-charcoal"
              href="mailto:hello@amsterdamparentproject.nl"
            >
              contact us
            </a>{" "}
            — we are happy to accommodate your financial needs.
          </p>
          <CostsBreakdown />
        </section>

        <section
          id="find-cohort"
          className="scroll-mt-20 md:scroll-mt-32 bg-brand-sand/20 border border-brand-sand/10 py-10 px-8 rounded-lg"
        >
          <HeaderAndSubtitle
            header="Get started: Find your cohort"
            subtitle="Reserve your spot now, whenever you are in your pre/postpartum
            journey. As soon as your cohort reaches enough families, we’ll email
            you to finalize signup (including full payment) and introduce you to
            your group."
          />
          <div className="max-w-3xl mx-auto mt-8 px-4">
            <div className="space-y-4">
              {FTPCohorts.map((cohort, index) => (
                <CohortsAccordion key={index} cohort={cohort} />
              ))}
            </div>
            <p className="text-center text-xs text-brand-charcoal mt-8 max-w-md mx-auto leading-normal">
              Don’t see your due date?{" "}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
                className="text-brand-soft-green hover:text-brand-goldenrod"
              >
                Join the general interest list
              </a>{" "}
              to be the first to know when new cohorts are released.
            </p>
          </div>
        </section>
      </div>

      <div id="faq" className="scroll-m-32 mt-6">
        <HeaderAndSubtitle
          header="Common questions"
          subtitle="If you have any other questions, please reach out to hello@amsterdamparentproject.nl."
        />
        <ProgramFAQ />
      </div>
    </div>
  );
}

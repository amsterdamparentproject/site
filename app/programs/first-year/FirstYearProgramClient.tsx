"use client";

import ShowcaseButton from "@/components/ShowcaseButton";
import SessionsAccordion from "@/components/first-year-program/SessionsAccordion";
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
    description: (
      <>
        Get matched with another parent via{" "}
        <a href="https://postpartumpost.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-soft-green">
          Postpartum Post
        </a>{" "}
        — someone who gets where you are or where you're headed, for personal support beyond the group.
      </>
    ),
  },
  {
    icon: "🩺",
    title: "Expert guidance",
    description:
      "Monthly expert-led discussions covering your first year — from newborn feeding and physical recovery to relationships, identity, and returning to work.",
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
      "A private, psychotherapist-moderated WhatsApp group with a close-knit cohort of local parents — available when you need it.",
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
            A{" "}
            <b className="dark:text-brand-goldenrod text-brand-soft-green">
              local, nonprofit, whole family support system built for your baby's first year
            </b>
            . Expert-led discussions, curated socials, 1:1 peer matching, and a
            moderated community — all you need to transition with confidence into newborn parenthood.
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
            The First Year Program cuts through the noise of overwhelming, conflicting advice to focus on what matters: a healthy, calm, and confident transition from pregnancy to newborn parenthood for your whole family.
          </p>
          <p className="mb-6 mx-4">
            <b>
              When support from your kraamzorg and midwife ends, we step in to bridge the gap
            </b>{" "}
             between professional expertise and peer support — because "best practices" come from both science and shared experience. Join anytime from pregnancy through your baby's first year.
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
          <SectionHeader
            header="How it works"
            subtitle="Join in pregnancy with a €25 deposit and the whole family gets immediate access to support — free until your baby arrives. Already have a baby under 12 months? Jump straight in. Support is there for you when and where you need it, for as long as you need."
          />
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
                As a nonprofit, we strive to balance access with fair pay for our experts and facilitators. If
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

        {/* Join */}
        <div className="w-full max-w-full overflow-x-clip">
          <section
            id="join"
            className="scroll-mt-20 md:scroll-mt-32 bg-brand-sand/20 dark:bg-brand-soft-charcoal border border-brand-sand/10 py-10 px-4 md:px-8 rounded-lg w-full"
          >
            <SectionHeader
              header="Join the program"
              subtitle="Open to families from pregnancy through your baby's first year, stbuarting in September 2026."
            />

            <div className="max-w-2xl mx-auto mt-8 w-full px-2 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Waiting for baby */}
              <div className="rounded-2xl border border-brand-sand/60 overflow-hidden flex flex-col">
                <div className="bg-brand-charcoal px-6 py-4">
                  <p className="text-sm font-black text-white">Waiting for baby</p>
                </div>
                <div className="bg-white dark:bg-brand-soft-charcoal p-6 flex flex-col flex-1">
                <p className="text-sm text-brand-charcoal dark:text-brand-white/80 mb-4">Still expecting? Reserve now and immediately get:</p>
                <ul className="flex-1 space-y-2 mb-2">
                  {["Peer matching", "Private WhatsApp group access", "Understanding the Village guide"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-brand-charcoal dark:text-brand-white/80">
                      <svg className="w-4 h-4 text-brand-soft-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs italic text-brand-charcoal/50 dark:text-brand-white/40 my-2">Includes access for your whole family: you and your partner.</p>
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
                    className="block w-full text-center text-sm font-bold text-white bg-brand-soft-green hover:bg-brand-soft-green/90 transition-colors rounded-xl py-3"
                    data-umami-event="First Year Program: Save spot monthly"
                  >
                    Reserve your spot — €25
                  </a>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
                    className="block w-full text-center text-sm font-bold text-white bg-brand-goldenrod hover:bg-brand-goldenrod/90 transition-colors rounded-xl py-3"
                    data-umami-event="First Year Program: Save spot 6 month"
                  >
                    6-month bundle — Save €25
                  </a>
                </div>
                </div>
              </div>

              {/* Baby's here */}
              <div className="rounded-2xl border border-brand-sand/60 overflow-hidden flex flex-col">
                <div className="bg-brand-charcoal px-6 py-4">
                  <p className="text-sm font-black text-white">Baby's here</p>
                </div>
                <div className="bg-white dark:bg-brand-soft-charcoal p-6 flex flex-col flex-1">
                <p className="text-sm text-brand-charcoal dark:text-brand-white/80 mb-4">Join anytime while your baby is under 12 months and immediately get:</p>
                <ul className="flex-1 space-y-2 mb-2">
                  {["Peer matching", "Private WhatsApp group access", "All 6 resource guides", "Invites to this month's events"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-brand-charcoal dark:text-brand-white/80">
                      <svg className="w-4 h-4 text-brand-goldenrod shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs italic text-brand-charcoal/50 dark:text-brand-white/40 my-2">Includes access for your whole family: you and your partner.</p>                
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
                    className="block w-full text-center text-sm font-bold text-white bg-brand-soft-green hover:bg-brand-soft-green/90 transition-colors rounded-xl py-3"
                    data-umami-event="First Year Program: Join with baby monthly"
                  >
                    Join now — €55–68/mo
                  </a>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSebsrV_7wH9pawo3DBFJXGLTIP0jIXPgfqtctK4SmSk89tEJQ/viewform?usp=dialog"
                    className="block w-full text-center text-sm font-bold text-white bg-brand-goldenrod hover:bg-brand-goldenrod/90 transition-colors rounded-xl py-3"
                    data-umami-event="First Year Program: Join with baby 6 month"
                  >
                    6-month bundle — Save €25
                  </a>
                </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-brand-charcoal/50 dark:text-brand-white/50 mt-8 max-w-md mx-auto leading-normal">
              Questions?{" "}
              <a
                href="mailto:hello@amsterdamparentproject.nl"
                className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-white/80"
              >
                Email us
              </a>{" "}
              — we're here to help!
            </p>
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

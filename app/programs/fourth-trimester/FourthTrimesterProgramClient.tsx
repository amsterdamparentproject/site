"use client";

import ShowcaseButton from "@/components/ShowcaseButton";
import FTPCohorts from "@/data/fourth-trimester-program/cohorts";
import SessionsAccordion from "@/components/fourth-trimester-program/SessionsAccordion";
import CohortsAccordion from "@/components/fourth-trimester-program/CohortsAccordion";
import CostsBreakdown from "@/components/fourth-trimester-program/CostsBreakdown";
import ProgramHighlightBox from "@/components/fourth-trimester-program/ProgramHighlightBox";

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

          {/* 1. Updated the central line to be absolute centered at 50% */}
          <div className="relative space-y-12 before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-soft-green before:via-brand-goldenrod before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              {/* 2. Simplified the circle centering logic */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white bg-brand-soft-green shadow text-white shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-soft-green/10 bg-white shadow-sm">
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
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-white bg-brand-goldenrod text-white shadow shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[42%] p-6 rounded-2xl border border-brand-goldenrod/10 bg-white shadow-sm">
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
          <h2 className="text-3xl font-bold text-brand-charcoal my-2 text-center">
            Expert curriculum
          </h2>
          <p className="text-brand-charcoal text-center text-sm">
            Expert-led modules for the whole family that track your 12-week
            journey with your newborn
          </p>
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
          className="bg-brand-sand/20 border border-brand-sand/10 py-10 px-8 rounded-lg"
        >
          <h2 className="text-3xl font-bold text-brand-soft-green my-2 text-center">
            Get started: Find your cohort
          </h2>
          <p className="text-brand-charcoal text-center text-sm">
            Reserve your spot now, whenever you are in your pre/postpartum
            journey. As soon as your cohort reaches enough families, we’ll email
            you to finalize signup (including full payment) and introduce you to
            your group.
          </p>
          <div className="max-w-3xl mx-auto mt-8 px-4">
            <div className="space-y-4">
              {FTPCohorts.map((cohort, index) => (
                <CohortsAccordion key={index} cohort={cohort} />
              ))}
            </div>
            <p className="text-center text-[11px] text-brand-charcoal/30 mt-8 max-w-md mx-auto leading-normal">
              Don’t see your due date?{" "}
              <a
                href="#newsletter"
                className="underline hover:text-brand-soft-green"
              >
                Join the general interest list
              </a>{" "}
              to be the first to know when new 2026 dates are released.
            </p>
          </div>
        </section>
      </div>

      <div id="faq" className="scroll-m-32 mt-6">
        <h2 className="text-center text-3xl font-bold leading-7 text-brand-goldenrod my-4">
          FAQ
        </h2>
        <ul className="list-disc mx-4">
          <li className="mb-4">
            <h3>
              <b>Why do I need group postpartum support?</b>
            </h3>
            <p className="mb-2 text-sm">
              Finding the right support after you have a baby is a daunting
              task. Your giant parent group is dispensing baby advice 100 times
              a day, you're frantically Googling "Why is this happening..."
              during 2am feeds, and social media is constantly telling you what
              you should be feeling as a new parent. If you want an actual
              expert's opinion, you may be paying €100/hour for a consult — and
              you have to spend time and energy to find them in the first place.
              Speaking from experience: It can be overwhelming and exhausting.
            </p>
          </li>
          <li className="mb-4">
            <h3>
              <b>What's different about the Fourth Trimester Program?</b>
            </h3>
            <p className="mb-2 text-sm">
              Parents — especially expat parents — have complex support needs:
            </p>
            <ul className="list-disc ml-4 mt-2 text-sm">
              <li>
                <u>Right timing</u>: You have questions you never anticipated
                that need answering now, and you can't remember what you learned
                before the birth.
              </li>
              <li>
                <u>Right sources</u>: You need insights from accredited experts,
                not some random blog you found through Google/ChatGPT/WhatsApp.
              </li>
              <li>
                <u>Right people</u>: You're less likely to build a stable
                support system with folks in Oost if you live in West, or if
                their baby is 8 months older than yours.
              </li>
              <li>
                <u>Right language</u>: You're not familiar with the Dutch
                language/system, and you don't need the mental overhead to
                figure it out right now.
              </li>
              <li>
                <u>Right price</u>: Having a baby is expensive, and the last
                thing you need is to weigh affordability with getting the
                support you need.
              </li>
            </ul>
            <p className="my-2 text-sm">
              We haven't found a single program in the Netherlands that does all
              this. The Fourth Trimester Program is meant to be your guide, so
              that you don't have to think about how to build your own support.
              You just have to show up ☺️
            </p>
          </li>
          <li className="mb-4">
            <h3>
              <b>Why are your sessions cheaper than others?</b>
            </h3>
            <p className="text-sm">
              APP operates as a non-profit. We strive to be a community resource
              above all. Sessions are offered with transparent, socially-driven
              costs to be as accessible and affordable as possible. You're
              paying for the expert's time, operating costs, and development
              costs: that's it.
            </p>
          </li>
          <li className="mb-4">
            <h3>
              <b>This sounds a lot like Mother's Groups in the UK...</b>
            </h3>
            <p className="text-sm">
              Yes, exactly! It's inspired by Canada's postpartum support system
              and <a href="https://www.peps.org/">PEPS</a> in Seattle. Our goal
              has never been to create a unique, revolutionary postpartum
              program; it's to import the successful models that exist in other
              countries to Amsterdam, to cover the gap in English-language
              postpartum support here.
            </p>
          </li>
          <li className="mb-4">
            <h3>
              <b>Why is APP tackling this?</b>
            </h3>
            <p className="text-sm">
              It's something close to our hearts and first-hand experience.
              Having become parents in Amsterdam ourselves, we couldn't
              transition into new parenthood with confidence with the existing
              English-language resources available. After asking ourselves "Why
              is this so hard?", we started asking, "What can we do about it?"
            </p>
          </li>
        </ul>
      </div>
      <div id="faq" className="scroll-m-32 mt-6">
        <h2 className="text-center text-3xl font-bold leading-7 text-brand-goldenrod my-4">
          Want to help?
        </h2>
        <p className="mb-2">
          Are you a postpartum professional that wants to support the program?
          We'd love to be in touch. There are three main ways to help:
        </p>
        <ul className="list-disc ml-4 mt-2 text-sm">
          <li>
            <u>Help us build cohorts</u>: APP believes that the most successful
            cohorts will have something in common: same midwife/doula, same
            neighborhood, etc. If you serve pregnant people, we'd love to talk
            to you about how we can offer sessions or a full program to your
            clients giving birth around the same time.
          </li>
          <li>
            <u>Help us build content</u>: We regularly seek reviews from experts
            to ensure our content aligns with current research.
          </li>
          <li>
            <u>Help us deliver content</u>: Every session needs a host! If
            you're an expert in a session topic and want to host, please reach
            out.
          </li>
        </ul>
        <p className="my-2">
          You can reach us at{" "}
          <a
            className="text-brand-goldenrod"
            href="mailto:amsterdamparentproject@gmail.com"
          >
            amsterdamparentproject@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

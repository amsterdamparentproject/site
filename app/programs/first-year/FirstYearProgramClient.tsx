"use client";

import ShowcaseButton from "@/components/ShowcaseButton";
import SessionsAccordion from "@/components/first-year-program/SessionsAccordion";
import CostsBreakdown from "@/components/first-year-program/CostsBreakdown";
import ProgramFAQ from "@/components/first-year-program/ProgramFAQ";
import ProgramJourney from "@/components/first-year-program/ProgramJourney";
import { ReactNode, useState } from "react";
import Link from "@/components/Link";
import { MoveRight } from "lucide-react";

type Flow =
  | "expecting_monthly"
  | "expecting_bundle"
  | "baby_monthly"
  | "baby_bundle";
type FamilyType = "single" | "multi";

async function startCheckout(flow: Flow, familyType: FamilyType) {
  const res = await fetch("/api/checkout/fyp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flow, familyType }),
  });
  const data = await res.json();
  if (data.url) {
    window.open(data.url, "_blank");
  } else {
    console.error("Checkout error:", data.error);
  }
}

function CheckoutButton({
  flow,
  familyType,
  className,
  children,
  umamiEvent,
}: {
  flow: Flow;
  familyType: FamilyType;
  className: string;
  children: ReactNode;
  umamiEvent?: string;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      className={`cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      data-umami-event={umamiEvent}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await startCheckout(flow, familyType);
        setLoading(false);
      }}
    >
      {loading ? "Redirecting…" : children}
    </button>
  );
}

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

function ExpectingCard({
  familyType,
  isSingleParent,
}: {
  familyType: FamilyType;
  isSingleParent: boolean;
}) {
  const isMulti = familyType === "multi";

  return (
    <div className="rounded-2xl border border-brand-sand/60 overflow-hidden flex flex-col">
      <div className="bg-brand-charcoal px-6 py-4">
        <p className="text-sm font-black text-white">Waiting for baby</p>
      </div>
      <div className="bg-white dark:bg-brand-soft-charcoal p-6 flex flex-col flex-1">
        <p className="text-sm text-brand-charcoal dark:text-brand-white/80 mb-4">
          Still expecting? Reserve now and immediately get:
        </p>
        <ul className="flex-1 space-y-2 mb-3">
          {[
            "Peer matching",
            "Private WhatsApp group access",
            "Understanding the Village guide",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-brand-charcoal dark:text-brand-white/80"
            >
              <svg
                className="w-4 h-4 text-brand-soft-green dark:text-brand-goldenrod shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-xs italic text-brand-charcoal/50 dark:text-brand-white/40 mb-5">
          This is for your whole family:{" "}
          {isSingleParent
            ? "you and your child(ren)"
            : "you, your partner, and your child(ren)"}
          .
        </p>
        <div className="flex flex-col gap-3">
          <CheckoutButton
            flow="expecting_monthly"
            familyType={familyType}
            className="block w-full text-center text-sm font-bold text-white bg-brand-soft-green hover:bg-brand-soft-green/90 transition-colors rounded-xl py-3"
            umamiEvent="First Year Program: Save spot monthly"
          >
            Reserve your spot — €25
          </CheckoutButton>
          <CheckoutButton
            flow="expecting_bundle"
            familyType={familyType}
            className="block w-full text-center text-sm font-bold text-white bg-brand-goldenrod hover:bg-brand-goldenrod/90 transition-colors rounded-xl py-3"
            umamiEvent="First Year Program: Save spot 6 month"
          >
            6-month bundle — {isMulti ? "€383" : "€305"} (save €25)
          </CheckoutButton>
        </div>
      </div>
    </div>
  );
}

function BabyCard({
  familyType,
  isSingleParent,
}: {
  familyType: FamilyType;
  isSingleParent: boolean;
}) {
  const isMulti = familyType === "multi";

  return (
    <div className="rounded-2xl border border-brand-sand/60 overflow-hidden flex flex-col">
      <div className="bg-brand-charcoal px-6 py-4">
        <p className="text-sm font-black text-white">Baby&apos;s here</p>
      </div>
      <div className="bg-white dark:bg-brand-soft-charcoal p-6 flex flex-col flex-1">
        <p className="text-sm text-brand-charcoal dark:text-brand-white/80 mb-4">
          Join anytime while your baby is under 12 months and immediately get:
        </p>
        <ul className="flex-1 space-y-2 mb-3">
          {[
            "Peer matching",
            "Private WhatsApp group access",
            "All 7 resource guides",
            "Invites to this month's events",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-brand-charcoal dark:text-brand-white/80"
            >
              <svg
                className="w-4 h-4 text-brand-goldenrod shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-xs italic text-brand-charcoal/50 dark:text-brand-white/40 mb-5">
          This is for your whole family:{" "}
          {isSingleParent
            ? "you and your child(ren)"
            : "you, your partner, and your child(ren)"}
          .
        </p>
        <div className="flex flex-col gap-3">
          <CheckoutButton
            flow="baby_monthly"
            familyType={familyType}
            className="block w-full text-center text-sm font-bold text-white bg-brand-soft-green hover:bg-brand-soft-green/90 transition-colors rounded-xl py-3"
            umamiEvent="First Year Program: Join with baby monthly"
          >
            Join now — {isMulti ? "€68" : "€55"}/mo
          </CheckoutButton>
          <CheckoutButton
            flow="baby_bundle"
            familyType={familyType}
            className="block w-full text-center text-sm font-bold text-white bg-brand-goldenrod hover:bg-brand-goldenrod/90 transition-colors rounded-xl py-3"
            umamiEvent="First Year Program: Join with baby 6 month"
          >
            6-month bundle — {isMulti ? "€383" : "€305"} (save €25)
          </CheckoutButton>
        </div>
      </div>
    </div>
  );
}

function JoinSection() {
  const [isSingleParent, setIsSingleParent] = useState(false);
  const familyType: FamilyType = isSingleParent ? "single" : "multi";

  return (
    <section
      id="join"
      className="scroll-mt-20 md:scroll-mt-32 bg-brand-sand/20 dark:bg-brand-soft-charcoal/40 py-10 px-4 md:px-8 rounded-lg w-full"
    >
      <SectionHeader
        header="Join the program"
        subtitle="Open to families from pregnancy through your baby's first year, starting in September 2026."
      />

      {/* Single parent slide toggle */}
      <div className="flex flex-col items-center gap-2 mt-4 mb-8">
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <span
            id="single-parent-toggle-label"
            className="text-sm text-brand-charcoal dark:text-brand-white/80"
          >
            I am a single parent
          </span>
          <button
            role="switch"
            aria-checked={isSingleParent}
            aria-labelledby="single-parent-toggle-label"
            onClick={() => setIsSingleParent((v) => !v)}
            className={`cursor-pointer relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              isSingleParent
                ? "bg-brand-soft-green"
                : "bg-brand-sand/60 dark:bg-brand-white/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                isSingleParent ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <p className="text-xs italic text-brand-charcoal/50 dark:text-brand-white/40 text-center max-w-sm">
          We offer a discount to ensure everyone can access support, regardless
          of family structure.
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpectingCard
          familyType={familyType}
          isSingleParent={isSingleParent}
        />
        <BabyCard familyType={familyType} isSingleParent={isSingleParent} />
      </div>

      <p className="text-center text-xs text-brand-charcoal/50 dark:text-brand-white/50 mt-8 max-w-md mx-auto leading-normal">
        Questions or need financial support?{" "}
        <a
          href="mailto:hello@amsterdamparentproject.nl"
          className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-white/80"
        >
          Email us
        </a>{" "}
        — we&apos;re here to help!
      </p>
    </section>
  );
}

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
              local, nonprofit, whole family support system built for your
              baby's first year
            </b>
            . Expert-led discussions, curated socials, 1:1 peer matching, and a
            moderated community — all you need to transition with confidence
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
            When support from your kraamzorg and midwife ends, we step in to
            bridge the gap between expert and peer guidance:
            because best parenting practices come from both science and
            shared experience. The program is a{" "}
            <b>community labor of love from local postpartum experts</b> —
            psychologists, lactation consultants, return-to-work
            specialists, postpartum coaches, and more — and the founders of APP,
            who stood up this whole organization because they felt the support
            gap firsthand with their babies.
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
            subtitle="Join in pregnancy with a €25 deposit and the whole family gets immediate csupport — free until your baby arrives. Already have a baby under 12 months? Jump straight in. Support is there for you when and where you need it, for as long as you need."
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
                — we're happy to accommodate your needs.
              </>
            }
          />
          <CostsBreakdown />
        </section>

        {/* Join */}
        <div className="w-full max-w-full overflow-x-clip">
          <JoinSection />
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

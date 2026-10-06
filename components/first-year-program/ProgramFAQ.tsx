"use client";

import { ReactNode, useEffect } from "react";
import Link from "@/components/Link";

interface FAQ {
  question: string;
  answer: ReactNode;
  id?: string;
}

// Luma calendar filtered to the first-year-program tag, for pay-per-event.
const LUMA_CALENDAR_URL = process.env.NEXT_PUBLIC_FYP_LUMA_CALENDAR_URL;

export default function ProgramFAQ() {
  const faqs: FAQ[] = [
    {
      question: "When can I join?",
      answer:
        "The program is open to families from pregnancy through baby's 12th month — join whenever you're ready. If you're pregnant, you get immediate access to your WhatsApp community, peer match, and the guides, and live sessions begin after your due date. If your baby is already here (up to 12 months), everything is available from the moment you sign up. Joining mid-cycle is completely fine too — the 6-month curriculum repeats, so you'll catch any topic you missed. We recommend joining as early as possible to get the most out of the full year.",
    },
    {
      question: "How does billing work?",
      answer: (
        <>
          The program is a one-time 6-month bundle: you pay once at signup and
          there are no recurring charges. If you joined in pregnancy, the full
          program begins after your due date; if you joined with a baby already,
          it starts immediately. Families who joined on a monthly plan before
          October 2026 keep that plan and can cancel any time from your{" "}
          <Link
            href="/hub/account"
            className="underline hover:text-brand-soft-green"
          >
            Hub account page
          </Link>
          , and you&apos;ll keep access through the end of your current billing
          period.
        </>
      ),
    },
    {
      question: "What is the 6-month bundle?",
      answer:
        "The 6-month bundle is the way to join the program: a single payment of €305 for single parent families or €383 for 2+ parent families. If you're pregnant, the full program starts after your due date and the bundle is fully refundable if you cancel during pregnancy. If you already have a baby, the program starts immediately.",
    },
    {
      question: "Can I just attend individual events?",
      answer: (
        <>
          Yes. If you&apos;re not ready for the full program, you can pay per
          event — browse upcoming First Year events on our{" "}
          {LUMA_CALENDAR_URL ? (
            <a
              href={LUMA_CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brand-soft-green"
            >
              events calendar
            </a>
          ) : (
            "events calendar"
          )}{" "}
          and register for the ones you want.
        </>
      ),
    },
    {
      question: "Are partners welcome?",
      answer:
        "Yes — the program is built for the whole family. Whether you are a birthing parent, non-birthing parent, or co-parent, you are an equal part of this transition. 2+ parent families join at one family price (€383 for the 6-month bundle), so all partners are included.",
    },
    {
      question: "Why do I need structured support? Can't I find this myself?",
      answer:
        "While information is everywhere, expert curation and a trusted local network are not. Instead of vetting conflicting advice during 2 AM scrolling, we provide a soft landing by combining professional expertise and peer support in a structured format. You get direct access to specialists, a matched peer, and a curated community — without the mental load of building it yourself.",
    },
    {
      question: "I'm not an expat. Can I still join?",
      answer:
        "Absolutely. While the program is conducted in English to support Amsterdam's international community, we welcome any parent looking for structured, expert-led support. Everyone deserves to be held in the first year ❤️",
    },
    {
      question: "Why is APP running this program?",
      answer:
        "Because we've been there. As parents in Amsterdam ourselves, we struggled to find the right support in English. Most of the world treats the first year as a shared responsibility, not a solo one — we're building that support system for families here who don't have it yet.",
    },
    {
      id: "ftp-comparison",
      question:
        "What's the difference between the Fourth Trimester and First Year Programs?",
      answer:
        "In 2025-2026, we ran two cohorts of the Fourth Trimester Program with a similar base: expert discussions, socials, and moderated chat. We took learnings and feedback from the early cohorts and evolved it into the First Year Program you see today. The new program is longer, has more social touchpoints (both group and 1:1), gets rid of the strict birth month requirements — before, your baby had to be born in the 2 months preceding the cohort start — and extends support for all families expecting and with babies under 1 year old.",
    },
  ];

  useEffect(() => {
    function openHash() {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  return (
    <div className="w-full max-w-full divide-y divide-brand-sand/30 dark:divide-brand-soft-charcoal/30 px-4 overflow-x-hidden">
      {faqs.map((faq, index) => (
        <details key={index} id={faq.id} className="group py-6 w-full block">
          <summary
            className="flex flex-nowrap items-start justify-between cursor-pointer list-none gap-4 w-full"
            style={{ cursor: "pointer" }}
          >
            <span className="flex-1 min-w-0 text-lg font-medium text-brand-charcoal dark:text-brand-white group-hover:text-brand-soft-green transition-colors break-words">
              {faq.question}
            </span>
            <span className="shrink-0 transition-transform duration-300 group-open:rotate-45 text-brand-soft-green mt-1">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </span>
          </summary>
          <div className="mt-4 text-brand-soft-charcoal dark:text-brand-white/80 text-sm leading-relaxed max-w-full overflow-hidden">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

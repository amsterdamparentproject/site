import { ReactNode } from "react";

interface FAQ {
  question: string;
  answer: ReactNode;
}

const PP = () => (
  <a
    href="https://postpartumpost.com"
    target="_blank"
    rel="noopener noreferrer"
    className="underline hover:text-brand-soft-green"
  >
    Postpartum Post
  </a>
);

export default function ProgramFAQ() {
  const faqs: FAQ[] = [
    {
      question: "When can I join?",
      answer:
        "The program is open to families from pregnancy through baby's 12th month — join whenever you're ready. If you're pregnant, reserve with a €25 monthly deposit or pay for 6 months upfront (save €25); either way you get immediate access to your WhatsApp community, peer match, and the Understanding the Village guide free until your due date. If your baby is already here (up to 12 months), there's no deposit — your subscription starts right away. We recommend joining as early as possible to get the most out of the full year.",
    },
    {
      question: "How does billing work?",
      answer:
        "If you joined in pregnancy on the monthly plan, your first invoice is charged the calendar month after your due date — with your €25 deposit credited, so you pay €30 (1-parent families) or €43 (2+ parent families) for month 1, then full price from month 2. If you chose the 6-month bundle, you've already paid upfront and the full program begins after your due date. If you joined with a baby already, monthly billing starts immediately. You can cancel at any time, and your subscription will continue until the end of the month.",
    },
    {
      question: "What is the 6-month bundle?",
      answer:
        "The 6-month bundle lets you pay for the full program upfront at a discount — €305 for single parent families or €383 for 2+ parent families (saving €25 vs. monthly). If you're pregnant, the full program starts after your due date and the bundle is fully refundable if you cancel during pregnancy. If you already have a baby, the program starts immediately.",
    },
    {
      question: "Are partners welcome?",
      answer:
        "Yes — the program is built for the whole family. Whether you are a birthing parent, non-birthing parent, or co-parent, you are an equal part of this transition. 2+ parent families join at one family price (€68/month), so all partners are included.",
    },
    {
      question:
        "What is Postpartum Post? Why is it part of my First Year subscription?",
      answer: (
        <>
          <PP /> is a 1:1 peer support platform that matches you with another
          parent based on your location, baby's age, and availability — also run
          by APP. As part of the First Year Program, you're matched with someone
          who gets where you are — or where you're headed. It's personal support
          that goes beyond what a group can offer.
        </>
      ),
    },
    {
      question: "What happens if I join mid-cohort?",
      answer: (
        <>
          That's completely fine. The program is designed for rolling entry —
          you join the cohort at whatever stage you're at, connect with your
          WhatsApp group, get your <PP /> match, and join the next discussion
          and social. The curriculum repeats every 6 months, so you'll catch any
          topics you missed.
        </>
      ),
    },
    {
      question: "Why do topics repeat every 6 months?",
      answer:
        "Because the same topic hits differently at different stages. A discussion about feeding when your baby is 2 weeks old is completely different from one at 5 months. Repetition isn't a limitation — it's a feature. New modules will also be added over time as the program grows.",
    },
    {
      question: "Why do I need structured support? Can't I find this myself?",
      answer:
        "While information is everywhere, expert curation and a local village are not. Instead of vetting conflicting advice during 2 AM scrolling, we provide a soft landing by combining professional expertise and peer support in a structured format. You get direct access to specialists, a matched peer, and a curated community — without the mental load of building it yourself.",
    },
    {
      question: "I'm not an expat. Can I still join?",
      answer:
        "Absolutely. While the program is conducted in English to support Amsterdam's international community, we welcome any parent looking for structured, expert-led support. Everyone deserves to be held in the first year ❤️",
    },
    {
      question: "Why is APP running this program?",
      answer:
        "Because we've been there. As parents in Amsterdam ourselves, we struggled to find the right support in English. Most of the world understands the first year as a communal responsibility — we're building that village for families here who don't have one yet.",
    },
  ];

  return (
    <div className="w-full max-w-full divide-y divide-brand-sand/30 dark:divide-brand-soft-charcoal/30 px-4 overflow-x-hidden">
      {faqs.map((faq, index) => (
        <details key={index} className="group py-6 w-full block">
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

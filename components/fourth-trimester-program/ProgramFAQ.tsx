export default function ProgramFAQ() {
  const faqs = [
    {
      question: "How does the reservation and payment process work?",
      answer:
        "We prioritize building cohorts of parents with similar due dates who live in the same neighborhood. You can reserve your spot at any stage of your journey for a €25 deposit. Once your specific cohort reaches capacity, we will email you to finalize your registration, process the remaining payment, and introduce you to your new group. If a cohort doesn't reach capacity, we’ll offer you a spot in the next closest group or a full refund.",
    },
    {
      question: "I’m not an expat. Can I still join?",
      answer:
        "Absolutely. While the program is conducted in English to support Amsterdam’s international community, we welcome any parent looking for a structured, expert-led support group. Having a mix of internationals and locals often makes for the best community resource sharing.",
    },
    {
      question: "Are partners welcome to attend?",
      answer:
        "Yes, yes, yes! Unlike many groups that focus solely on moms/the birthing parent, the Fourth Trimester Program is built for the whole family. Whether you are a birthing parent, a non-birthing parent, or a partner, you are an equal part of this transition. Bringing your partner ensures you’re both receiving the same expert advice and building a shared support network from day one.",
    },
    {
      question: "Why do I need group postpartum support?",
      answer:
        "Finding the right support after you have a baby is a daunting task. Between frantic 2 AM Google searches and overwhelming social media advice, getting an expert's opinion can be expensive and exhausting. We provide that expertise in a grounded, shared environment so you don't have to hunt for it.",
    },
    {
      question: "What's different about the Fourth Trimester Program?",
      answer: (
        <div className="space-y-3">
          <p>
            Parents — especially expats — have complex needs that current
            programs often miss:
          </p>
          <ul className="list-disc pl-5 space-y-1 opacity-90">
            <li>
              <strong>Timing:</strong> Answers when you actually have the
              questions.
            </li>
            <li>
              <strong>Sources:</strong> Accredited experts, not random blogs.
            </li>
            <li>
              <strong>Proximity:</strong> Matching you with neighbors, not just
              anyone in the city.
            </li>
            <li>
              <strong>Language:</strong> Removing the Dutch-language mental
              overhead.
            </li>
          </ul>
          <p>
            We haven't found a program in the Netherlands that hits all these
            marks. We built this so you don't have to build your own support
            system.
          </p>
        </div>
      ),
    },
    {
      question: "Why are your sessions cheaper than others?",
      answer:
        "APP operates as a non-profit. We strive to be a community resource above all. You're paying for the expert's time and basic operating costs—that's it. We believe support should be a right, not a luxury.",
    },
    {
      question: "This sounds a lot like Mother's Groups in the UK...",
      answer:
        "Exactly! It's inspired by successful models in Canada, the UK, and the US (like PEPS in Seattle). We aren't trying to reinvent the wheel; we're just importing proven support models to fill the English-language gap in Amsterdam.",
    },
    {
      question: "Why is APP tackling this?",
      answer:
        "Because we’ve been there. As parents in Amsterdam ourselves, we struggled to find the right resources in English. After asking 'Why is this so hard?', we decided to build the solution we wished we had.",
    },
  ];

  return (
    <div className="divide-y divide-brand-sand/30 dark:divide-brand-soft-charcoal/30 mx-4">
      {faqs.map((faq, index) => (
        <details key={index} className="group py-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-medium text-brand-charcoal dark:text-brand-white group-hover:text-brand-soft-green transition-colors pr-8">
              {faq.question}
            </span>
            <span className="transition-transform duration-300 group-open:rotate-45 text-brand-soft-green">
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
          <div className="mt-4 text-brand-soft-charcoal dark:text-brand-white/80 text-sm leading-relaxed max-w-2xl">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

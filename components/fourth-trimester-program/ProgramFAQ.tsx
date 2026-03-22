export default function ProgramFAQ() {
  const faqs = [
    {
      question: "Why do I need group postpartum support?",
      answer:
        "Finding the right support after you have a baby is a daunting task. Between frantic 2am Google searches and overwhelming social media advice, getting an expert's opinion can be expensive and exhausting. We provide that expertise in a grounded, shared environment so you don't have to hunt for it.",
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
    <div className="divide-y divide-brand-soft-green/20">
      {faqs.map((faq, index) => (
        <details key={index} className="group py-6">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-lg font-medium text-brand-charcoal group-hover:text-brand-soft-green transition-colors pr-8">
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
          <div className="mt-4 text-brand-soft-charcoal/80 text-sm leading-relaxed max-w-2xl">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

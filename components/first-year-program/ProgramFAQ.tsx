export default function ProgramFAQ() {
  const faqs = [
    {
      question: "When can I join?",
      answer:
        "You can join at any point — during pregnancy or with a newborn. Reserve your spot now and your billing starts the month after your due date, so there's no cost until your baby arrives. We recommend joining before or shortly after birth to get the most out of the full program.",
    },
    {
      question: "How does billing work?",
      answer:
        "The First Year Program is billed monthly. Your first payment is processed the month after your due date passes. You can cancel at any time, though we recommend a minimum of 3 months to settle in and get real value from the community.",
    },
    {
      question: "Are partners welcome?",
      answer:
        "Yes — the program is built for the whole family. Whether you are a birthing parent, non-birthing parent, or co-parent, you are an equal part of this transition. Multi-parent families join at one family price (€68/month), so both partners are included.",
    },
    {
      question: "What is Postpartum Post?",
      answer:
        "Postpartum Post is a 1:1 peer support platform that matches you with another parent based on your location, baby's age, and availability. As part of the First Year Program, you're matched with someone who gets where you are — or where you're headed. It's personal support that goes beyond what a group can offer.",
    },
    {
      question: "What happens if I join mid-cohort?",
      answer:
        "That's completely fine. The program is designed for rolling entry — you join the cohort at whatever stage you're at, connect with your WhatsApp group, get your Postpartum Post match, and join the next discussion and social. The curriculum repeats every 6 months, so you'll catch any topics you missed.",
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
          <summary className="flex flex-nowrap items-start justify-between cursor-pointer list-none gap-4 w-full">
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

export default function CollaborateFAQ() {
  const opportunities = [
    {
      title: "Help us build cohorts",
      content:
        "APP believes that the most successful cohorts share a common thread: the same neighborhood, midwife, or doula. If you serve pregnant people, we’d love to discuss how we can offer tailored sessions or a full program to your clients giving birth around the same time.",
    },
    {
      title: "Help us build content",
      content:
        "Accuracy and evidence are our foundation. We regularly seek reviews from experts to ensure our guides and resources align with the most current postpartum research.",
    },
    {
      title: "Help us deliver content",
      content:
        "Every session needs a host! If you are an accredited expert in a specific newborn or parent topic and want to facilitate a discussion for our cohorts, please reach out.",
    },
  ];

  return (
    <section
      id="collaborate"
      className="max-w-3xl mx-auto py-16 px-6 scroll-mt-32"
    >
      <div className="text-center md:text-left mb-10">
        <h2 className="text-3xl font-bold text-brand-goldenrod mb-4">
          Want to help?
        </h2>
        <p className="text-brand-soft-charcoal/90">
          Are you a postpartum professional looking to support the program? We’d
          love to be in touch. There are three main ways to collaborate:
        </p>
      </div>

      <div className="border-t border-brand-goldenrod/20 divide-y divide-brand-goldenrod/20">
        {opportunities.map((item, index) => (
          <details key={index} className="group py-6">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="text-lg font-bold text-brand-charcoal group-hover:text-brand-goldenrod transition-colors">
                {item.title}
              </span>
              <span className="text-brand-goldenrod transition-transform duration-300 group-open:rotate-45">
                <svg
                  width="20"
                  height="20"
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
              {item.content}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-brand-goldenrod/5 border border-brand-goldenrod/10 text-center">
        <p className="text-sm text-brand-charcoal">
          Ready to chat? Reach us at{" "}
          <a
            className="font-bold text-brand-goldenrod hover:underline underline-offset-4"
            href="mailto:amsterdamparentproject@gmail.com"
          >
            amsterdamparentproject@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}

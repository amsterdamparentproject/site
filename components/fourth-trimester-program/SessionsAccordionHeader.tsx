import { Authors, allAuthors } from "@/.contentlayer/generated";
import Image from "@/components/Image";
import { coreContent } from "pliny/utils/contentlayer.js";

interface AccordionHeaderProps {
  title: string;
  subtitle: string;
  experts: string[];
  isOpen: boolean;
  onClick: () => void;
}

export default function AccordionHeader({
  title,
  subtitle,
  experts,
  isOpen,
  onClick,
}: AccordionHeaderProps) {
  const sessionAuthors = experts
    .map((slug) => {
      const authorResults = allAuthors.find((p) => p.slug === slug);
      return authorResults ? coreContent(authorResults as Authors) : null;
    })
    .filter(Boolean);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-6 text-left hover:bg-brand-soft-green/5 transition-all group gap-4"
      aria-expanded={isOpen}
      data-umami-event="Fourth Trimester Program: See curriculum details"
      data-umami-event-title={title}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-brand-charcoal dark:text-brand-white text-lg leading-tight transition-colors duration-200">
          {title}
        </h3>
        <p className="text-xs font-medium tracking-wide text-brand-soft-green dark:text-brand-white/80 italic mt-1">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex -space-x-3 overflow-hidden">
          {sessionAuthors.map((expert, i) => (
            <div
              key={expert?.slug}
              className="relative inline-block rounded-full ring-1 ring-brand-white dark:ring-brand-charcoal bg-brand-white dark:bg-brand-charcoal"
              style={{ zIndex: sessionAuthors.length - i }}
            >
              <Image
                src={expert?.avatar || "/static/images/logo/light.png"}
                width={40}
                height={40}
                alt={`${expert?.name} headshot`}
                className="h-9 w-9 rounded-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
              />
            </div>
          ))}
        </div>

        {/* Expand */}
        <div
          className={`${isOpen ? "text-brand-soft-green" : "text-brand-sand"} transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"} shrink-0`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </button>
  );
}

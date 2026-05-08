import { ArrowRight } from "lucide-react";
import Link from "../Link";

type SubLink = { href: string; label: string; umamiEvent?: string };

export function ResourceRow({
  icon,
  href,
  title,
  subtitle,
  umamiEvent,
  subLinks,
}: {
  icon: React.ReactNode;
  href: string;
  title: string;
  subtitle?: string;
  umamiEvent: string;
  subLinks?: SubLink[];
}) {
  return (
    <div>
      <Link
        href={href}
        className="flex gap-4 group"
        data-umami-event={umamiEvent}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-soft-green dark:bg-brand-soft-charcoal flex items-center justify-center text-brand-white dark:text-brand-goldenrod group-hover:text-brand-goldenrod dark:group-hover:text-brand-violet transition-colors">
          {icon}
        </div>
        <div>
          <p className="font-bold text-brand-soft-green dark:text-brand-goldenrod group-hover:text-brand-goldenrod dark:group-hover:text-brand-violet transition-colors">
            {title}
          </p>
          {subtitle && (
            <p className="text-sm text-brand-soft-charcoal dark:text-brand-white">
              {subtitle}
            </p>
          )}
        </div>
      </Link>
      {subLinks && subLinks.length > 0 && (
        <div className="ml-14 mt-2 space-y-1.5">
          {subLinks.map((sub) => (
            <Link
              key={sub.href}
              href={sub.href}
              className="flex items-start gap-1 text-sm text-brand-soft-green dark:text-brand-sand hover:text-brand-goldenrod dark:hover:text-brand-violet transition-colors"
              data-umami-event={sub.umamiEvent}
            >
              <ArrowRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{sub.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

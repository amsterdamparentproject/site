"use client";

import { CustomSocialIcon, components } from "@/components/social-icons";

interface Group {
  id: string;
  name: string;
  categories: string[];
  recommended: boolean;
  platform: string;
  description: string;
  link: string;
  reported?: boolean;
}

interface DirectoryGroupProps {
  group: Group;
  uid?: string;
  onEdit: (group: Group) => void;
  onReport: (group: Group) => void;
}

export default function DirectoryGroupCard({
  group,
  uid,
  onEdit,
  onReport,
}: DirectoryGroupProps) {
  return (
    <div
      className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all border ${
        group.recommended
          ? "border-brand-soft-green bg-brand-soft-green/5"
          : "border-brand-sand/60 dark:border-brand-soft-charcoal"
      }`}
    >
      <div className="flex-1">
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-white flex items-center gap-2">
          {group.name}
          {group.platform && (
            <CustomSocialIcon
              kind={group.platform.toLowerCase() as keyof typeof components}
              size={4}
            />
          )}
        </h3>
        <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 pt-1">
          {group.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {group.categories?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold uppercase tracking-widest text-brand-soft-green dark:text-brand-goldenrod bg-brand-sand/20 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {group.reported ? (
          <span className="cursor-default bg-brand-sand/40 text-brand-soft-charcoal dark:text-brand-white/50 px-10 py-2.5 rounded-full font-bold text-center">
            Broken link
          </span>
        ) : (
          <a
            href={group.link}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer bg-brand-soft-green text-white px-10 py-2.5 rounded-full font-bold hover:bg-brand-goldenrod hover:text-brand-charcoal transition-all text-center"
            data-umami-event="Groups Directory: Join group"
            data-umami-event-uid={uid}
            data-umami-event-group-id={group.id}
          >
            Join
          </a>
        )}
        <div className="flex flex-row gap-3 justify-center text-[10px]">
          <button
            onClick={() => onEdit(group)}
            className="cursor-pointer text-brand-soft-green hover:underline dark:text-brand-goldenrod"
            data-umami-event="Groups Directory: Claim admin"
            data-umami-event-group-id={group.id}
          >
            Admin
          </button>
          <button
            onClick={() => onReport(group)}
            className="cursor-pointer text-red-800 hover:underline dark:text-red-400"
            data-umami-event={
              group.reported
                ? "Groups Directory: Fix link"
                : "Groups Directory: Report issue"
            }
            data-umami-event-group-id={group.id}
            data-umami-event-uid={uid}
          >
            {group.reported ? "Fix link" : "Report issue"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { CustomSocialIcon, components } from "@/components/social-icons";

interface Group {
  name: string;
  categories: string[];
  isRecommended?: boolean;
  platform: string;
  description: string;
  link: string;
}

interface DirectoryGroupProps {
  group: Group;
  activeTab: "recommended" | "all";
  uid?: string;
  onEdit: (group: Group) => void;
  onReport: (group: Group) => void;
}

export default function DirectoryGroupCard({
  group,
  activeTab,
  uid,
  onEdit,
  onReport,
}: DirectoryGroupProps) {
  return (
    <div
      className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all border ${
        activeTab === "recommended"
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
        <a
          href={group.link}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer bg-brand-soft-green text-white px-10 py-2.5 rounded-full font-bold hover:bg-brand-goldenrod hover:text-brand-charcoal transition-all text-center"
          data-umami-event="Join group"
          data-umami-event-uid={uid}
        >
          Join
        </a>
        <div className="flex flex-row gap-3 justify-center text-[10px]">
          <button
            onClick={() => onEdit(group)}
            className="cursor-pointer text-brand-soft-green hover:underline dark:text-brand-goldenrod"
          >
            Admin
          </button>
          <button
            onClick={() => onReport(group)}
            className="cursor-pointer text-red-800 hover:underline dark:text-red-400"
          >
            Report issue
          </button>
        </div>
      </div>
    </div>
  );
}

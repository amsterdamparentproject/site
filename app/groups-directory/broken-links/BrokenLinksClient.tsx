"use client";

import { useState } from "react";
import Link from "next/link";
import { CustomSocialIcon, components } from "@/components/social-icons";
import Modal from "@/components/Modal";
import FixLinkForm from "@/components/groups-directory/FixLinkForm";

interface ReportedGroup {
  name: string;
  categories: string[];
  description: string;
  platform: string;
  link: string;
}

export default function BrokenLinksClient({
  groups,
}: {
  groups: ReportedGroup[];
}) {
  const [selectedGroup, setSelectedGroup] = useState<ReportedGroup | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const handleClose = () => setSelectedGroup(null);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: "Help fix broken links — Amsterdam Parent Groups Directory",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled the share sheet — nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy url:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex flex-col text-center items-center space-y-2 pt-6 pb-6 md:space-y-5">
        <p className="text-2xl font-extrabold text-brand-goldenrod text-center">
          Amsterdam Parent Groups Directory
        </p>
        <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
          Help us fix broken links
        </h1>
      </div>

      <div className="mb-8 p-6 pb-4 bg-brand-sand/30 dark:bg-brand-soft-charcoal rounded-xl border border-brand-sand/20">
        <p className="text-sm text-brand-charcoal dark:text-brand-white">
          These groups in the Amsterdam Parent Groups Directory have a broken
          invite link. If you&apos;re a member (or the admin) of one of these
          groups, submitting an updated link helps other parents find and join
          it again.
        </p>
        <p className="text-sm text-brand-charcoal dark:text-brand-white mt-2">
          Thanks for helping keep this community resource up to date ❤️ It's a
          big help to APP and to the 500+ parents that use the directory!
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Link
          href="/groups-directory"
          className="inline-flex items-center justify-center bg-brand-soft-green text-white px-8 py-2.5 rounded-full font-bold hover:bg-brand-goldenrod hover:text-brand-charcoal transition-all text-center"
        >
          Go to Directory
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center cursor-pointer bg-transparent border-2 border-brand-soft-green text-brand-soft-green dark:border-brand-goldenrod dark:text-brand-goldenrod px-8 py-2.5 rounded-full font-bold hover:bg-brand-soft-green hover:text-white dark:hover:bg-brand-goldenrod dark:hover:text-brand-charcoal transition-all text-center"
        >
          {copied ? "Link copied!" : "Share this page"}
        </button>
      </div>

      <div className="grid gap-4">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={`${group.name}-${group.platform}`}
              className="p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all border border-brand-sand/60 dark:border-brand-soft-charcoal"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-white flex items-center gap-2">
                  {group.name}
                  {group.platform && (
                    <CustomSocialIcon
                      kind={
                        group.platform.toLowerCase() as keyof typeof components
                      }
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
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="cursor-pointer bg-brand-soft-green text-white px-10 py-2.5 rounded-full font-bold hover:bg-brand-goldenrod hover:text-brand-charcoal transition-all text-center"
                >
                  Fix link
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-brand-sand/10 rounded-xl border border-dashed border-brand-sand">
            <p className="text-brand-soft-charcoal dark:text-brand-white">
              No broken links right now! 🎉
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedGroup}
        onClose={handleClose}
        title={`Submit new link${selectedGroup ? `: ${selectedGroup.name}` : ""}`}
      >
        {selectedGroup && (
          <FixLinkForm
            info={{
              name: selectedGroup.name,
              link: selectedGroup.link,
            }}
            onClose={handleClose}
          />
        )}
      </Modal>
    </div>
  );
}

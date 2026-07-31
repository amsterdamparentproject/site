"use client";

import { useState } from "react";
import firstYearCurriculum from "@/data/first-year-program/curriculum";
import DownloadFileButton from "@/components/DownloadFileButton";
import Image from "@/components/Image";
import { coreContent } from "pliny/utils/contentlayer.js";
import { allAuthors, Authors } from "@/.contentlayer/generated";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import { getFypResourceDownloadUrl } from "@/app/hub/actions";

// Resources tab. Structurally mirrors
// components/fourth-trimester-program/SessionsAccordion.tsx's accordion
// shell (bordered rounded-2xl card, chevron header, animated expand panel,
// and the "Expert content by:" avatar section) — plus a green download
// button (reusing DownloadFileButton as-is, already bg-brand-soft-green)
// once expanded.
//
// Simplified 2026-07-29: curriculum.ts's session.guideFiles is now the
// single source of truth for which sessions have guides and what they're
// called — no separate lookup/list kept in sync here anymore. A session
// with no guideFiles just doesn't render a card. Almost always one file per
// session, but not always — Postpartum Transformation has two, rendered as
// separate download buttons below.
//
// Guides live in the private fyp-guides Storage bucket, not a public static
// path (see lib/fyp/resources.ts) — each guideFiles entry is an object path
// inside that bucket, resolved to a fresh signed URL on click via
// getFypResourceDownloadUrl.
//
// All guideFiles entries are live in both the TEST and prod fyp-guides
// buckets (uploaded via `yarn update-fyp-guides`, see
// scripts/update-fyp-guides.mjs — 2026-07-31).
//
// The WhatsApp/Luma quick-links that used to sit atop this page moved to
// their own Home tab (app/hub/(account)/home) 2026-07-29 — this page is
// guide downloads only now.
const RESOURCES = firstYearCurriculum
  .map((m) => m.session)
  .filter(
    (session): session is typeof session & { guideFiles: string[] } =>
      !!session.guideFiles && session.guideFiles.length > 0,
  );

// Derives a human-readable button label from a guide's filename — strips
// the extension, e.g. "Physical Postpartum.pdf" -> "Physical Postpartum".
// Only needed to distinguish multiple guides on the same session (see
// Postpartum Transformation) — irrelevant when there's just one.
function guideLabel(filename: string): string {
  return filename.replace(/\.pdf$/i, "");
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <div
      className={`${open ? "text-brand-soft-green dark:text-brand-goldenrod" : "text-brand-sand"} transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"} shrink-0`}
    >
      <svg
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
  );
}

export default function HubAccountResourcesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { accessToken } = useHubAccount();

  return (
    <div className="space-y-4">
      {RESOURCES.map((session, index) => {
        const open = openIndex === index;
        const sessionAuthors = session.experts
          .map((slug) => {
            const authorResults = allAuthors.find((p) => p.slug === slug);
            return authorResults ? coreContent(authorResults as Authors) : null;
          })
          .filter(Boolean);
        return (
          <div
            key={session.title}
            className={`border ${open ? "border-brand-soft-green" : "border-brand-sand/60"} rounded-2xl overflow-hidden bg-white dark:bg-brand-soft-charcoal transition-all hover:border-brand-soft-green`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
              data-umami-event="Hub: Toggle resource"
              data-umami-event-title={session.title}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-brand-soft-green/5 transition-all gap-4 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-brand-charcoal dark:text-brand-white text-lg leading-tight">
                  {session.title}
                </h3>
                <p className="text-xs font-medium tracking-wide text-brand-soft-green dark:text-brand-white/80 italic mt-1">
                  {session.subtitle}
                </p>
              </div>
              <ChevronIcon open={open} />
            </button>

            <div
              className={`transition-all duration-300 ease-in-out ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="p-6 pt-0 border-t border-brand-soft-green/10">
                <p className="text-sm text-brand-charcoal/80 dark:text-brand-white/80 mb-4 mt-4 whitespace-pre-line">
                  {session.description.trim()}
                </p>

                {session.components && session.components.length > 0 && (
                  <div className="bg-brand-soft-green/5 rounded-xl py-4 px-6 mb-6">
                    <h4 className="text-md font-bold text-brand-charcoal dark:text-brand-goldenrod mb-2">
                      What we cover
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {session.components.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-brand-charcoal/80 dark:text-brand-white/80"
                        >
                          <span className="mx-1 mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-goldenrod" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {session.guideFiles.map((filename) => {
                    const label =
                      session.guideFiles.length > 1
                        ? guideLabel(filename)
                        : "Download the guide";
                    return (
                      <div key={filename} className="flex items-center gap-2">
                        <DownloadFileButton
                          iconOnly
                          onDownload={async () => {
                            if (!accessToken) return null;
                            const result = await getFypResourceDownloadUrl(
                              accessToken,
                              filename,
                            );
                            if (!result.success) {
                              console.error(
                                "[Hub resources] download link failed:",
                                result.error,
                              );
                              return null;
                            }
                            return result.url;
                          }}
                          buttonText={label}
                          umamiName="Hub: Download resource guide"
                        />
                        <span className="text-sm font-medium text-brand-charcoal dark:text-brand-white/80">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {sessionAuthors.length > 0 && (
                  <div className="border-t border-brand-soft-green/10 pt-4 mt-6">
                    <h4 className="text-sm text-brand-charcoal dark:text-brand-white/80 mb-4 text-center sm:text-left">
                      Expert content by:
                    </h4>
                    <div className="flex flex-wrap justify-start gap-6">
                      {sessionAuthors.map((expert) => (
                        <div
                          key={expert?.slug}
                          className="flex items-center gap-4 group/expert"
                        >
                          <div className="relative h-12 w-12 shrink-0">
                            <Image
                              src={
                                expert?.avatar ||
                                "/static/images/logo/light.png"
                              }
                              width={48}
                              height={48}
                              alt={`${expert?.name} headshot`}
                              className="h-10 w-10 rounded-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-brand-charcoal dark:text-brand-white/80 leading-tight">
                              {expert?.name}
                            </span>
                            <span className="text-xs text-brand-soft-green font-medium">
                              {expert?.occupation || "Postpartum Specialist"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import CurriculumData from "@/data/first-year-program/curriculum";
import Image from "@/components/Image";
import { coreContent } from "pliny/utils/contentlayer.js";
import { allAuthors, Authors } from "@/.contentlayer/generated";

export default function MonthlyJourneyGrid() {
  const [openCard, setOpenCard] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenCard((prev) => (prev === key ? null : key));
  }

  return (
    <div className="max-w-5xl mx-auto my-6 px-4">
      <div className="space-y-8">
        {CurriculumData.map(({ theme, session, social }, index) => {
          const topicKey = `topic-${index}`;
          const socialKey = `social-${index}`;
          const isTopicOpen = openCard === topicKey;
          const isSocialOpen = openCard === socialKey;

          const sessionAuthors = session.experts
            .map((slug) => {
              const authorResults = allAuthors.find((p) => p.slug === slug);
              return authorResults
                ? coreContent(authorResults as Authors)
                : null;
            })
            .filter(Boolean);

          // Alex Siega is the default facilitator when a social doesn't name one.
          const facilitatorSlug = social?.facilitator || "alexSiega";
          const socialFacilitator = !social?.placeholder
            ? allAuthors.find((p) => p.slug === facilitatorSlug)
            : null;
          const socialAuthors = socialFacilitator
            ? [coreContent(socialFacilitator as Authors)]
            : [];

          const socialGoodToKnow = [
            social?.location && `📍 ${social.location}`,
            social?.logistics,
            social?.note && `📣 ${social.note}`,
          ].filter(Boolean) as string[];

          const topicBody = (
            <>
              <h4 className="text-lg font-bold text-brand-charcoal dark:text-brand-white">
                {session.title}
              </h4>
              <p className="text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 mt-1">
                {session.subtitle}
              </p>

              <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 mt-4 mb-6 pt-3 border-t border-brand-soft-green/10 leading-relaxed whitespace-pre-line">
                {session.description}
              </p>

              {!!session.components?.length && (
                <div className="bg-brand-soft-green/5 rounded-xl py-4 px-6 mb-6">
                  <h4 className="text-md font-bold text-brand-charcoal dark:text-brand-goldenrod mb-2 text-center sm:text-left">
                    What we cover
                  </h4>
                  <ul className="grid grid-cols-1 gap-2">
                    {session.components.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-brand-soft-charcoal dark:text-brand-white/80"
                      >
                        <span className="mx-1 mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-goldenrod" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sessionAuthors.length > 0 && (
                <div className="border-t border-brand-soft-green/10 pt-4">
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
                              expert?.avatar || "/static/images/logo/light.png"
                            }
                            width={48}
                            height={48}
                            alt={`${expert?.name} headshot`}
                            className="h-10 w-10 rounded-full object-cover grayscale-[20%] group-hover/expert:grayscale-0 transition-all"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-brand-charcoal dark:text-brand-white/80 leading-tight">
                            {expert?.name}
                          </span>
                          <span className="text-xs text-brand-soft-green dark:text-brand-goldenrod font-medium">
                            {expert?.occupation || "Postpartum Specialist"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          );

          const socialBody = social && !social.placeholder && (
            <>
              <h4 className="text-lg font-bold text-brand-charcoal dark:text-brand-white">
                {social.title}
              </h4>
              <p className="text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 mt-1">
                {social.subtitle}
              </p>

              <div className="mt-4 pt-3 border-t border-brand-goldenrod/10">
                {social.description && (
                  <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 mb-6 leading-relaxed">
                    {social.description}
                  </p>
                )}

                {socialGoodToKnow.length > 0 && (
                  <div className="bg-brand-goldenrod/5 rounded-xl py-4 px-6 mb-6">
                    <h4 className="text-md font-bold text-brand-charcoal dark:text-brand-goldenrod mb-2 text-center sm:text-left">
                      Good to know
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {socialGoodToKnow.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-brand-soft-charcoal dark:text-brand-white/80"
                        >
                          <span className="mx-1 mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-goldenrod" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {socialAuthors.length > 0 && (
                  <div className="border-t border-brand-goldenrod/10 pt-4">
                    <h4 className="text-sm text-brand-charcoal dark:text-brand-white/80 mb-4 text-center sm:text-left">
                      Facilitated by:
                    </h4>
                    <div className="flex flex-wrap justify-start gap-6">
                      {socialAuthors.map((facilitator) => (
                        <div
                          key={facilitator?.slug}
                          className="flex items-center gap-4"
                        >
                          <div className="relative h-12 w-12 shrink-0">
                            <Image
                              src={
                                facilitator?.avatar ||
                                "/static/images/logo/light.png"
                              }
                              width={48}
                              height={48}
                              alt={`${facilitator?.name} headshot`}
                              className="h-10 w-10 rounded-full object-cover grayscale-[20%]"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-brand-charcoal dark:text-brand-white/80 leading-tight">
                              {facilitator?.name}
                            </span>
                            {facilitator?.occupation && (
                              <span className="text-xs text-brand-soft-green dark:text-brand-goldenrod font-medium">
                                {facilitator.occupation}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          );

          return (
            <div key={index}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-lg font-bold text-brand-goldenrod">
                  Month {index + 1}: {theme}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Topic header */}
                <button
                  onClick={() => toggle(topicKey)}
                  className={`flex h-full flex-col justify-between cursor-pointer text-left border rounded-2xl p-5 bg-brand-white dark:bg-brand-charcoal transition-all ${
                    isTopicOpen
                      ? "border-brand-soft-green"
                      : "border-brand-sand/60 hover:border-brand-soft-green"
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-brand-charcoal dark:text-brand-white">
                        {session.title}
                      </h4>
                      <p className="text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 mt-1">
                        {session.subtitle}
                      </p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-brand-sand transition-transform ${isTopicOpen ? "rotate-180 text-brand-soft-green" : ""}`}
                    />
                  </div>
                  {sessionAuthors.length > 0 && (
                    <div className="flex -space-x-3 overflow-hidden mt-4">
                      {sessionAuthors.map((expert, i) => (
                        <div
                          key={expert?.slug}
                          className="relative inline-block rounded-full ring-1 ring-brand-white dark:ring-brand-charcoal bg-brand-white dark:bg-brand-charcoal"
                          style={{ zIndex: sessionAuthors.length - i }}
                        >
                          <Image
                            src={
                              expert?.avatar || "/static/images/logo/light.png"
                            }
                            width={40}
                            height={40}
                            alt={`${expert?.name} headshot`}
                            className="h-9 w-9 rounded-full object-cover grayscale-[20%]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </button>

                {/* Mobile-only: topic detail directly beneath its own header */}
                {isTopicOpen && (
                  <div className="md:hidden w-full rounded-2xl border border-brand-soft-green bg-brand-white dark:bg-brand-charcoal p-6">
                    {topicBody}
                  </div>
                )}

                {/* Social header */}
                <button
                  onClick={() => !social?.placeholder && toggle(socialKey)}
                  disabled={social?.placeholder}
                  className={`flex h-full flex-col justify-between text-left border rounded-2xl p-5 bg-brand-white dark:bg-brand-charcoal transition-all ${
                    social?.placeholder
                      ? "border-dashed border-brand-sand/40 bg-brand-white/50 dark:bg-brand-charcoal/50 cursor-default"
                      : `cursor-pointer ${isSocialOpen ? "border-brand-goldenrod" : "border-brand-sand/60 hover:border-brand-goldenrod"}`
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-brand-charcoal dark:text-brand-white">
                        {social?.title ?? "Coming soon"}
                      </h4>
                      <p className="text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 mt-1">
                        {social?.subtitle}
                      </p>
                    </div>
                    {!social?.placeholder && (
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-brand-sand transition-transform ${isSocialOpen ? "rotate-180 text-brand-goldenrod" : ""}`}
                      />
                    )}
                  </div>
                  {!social?.placeholder && socialAuthors.length > 0 && (
                    <div className="flex -space-x-3 overflow-hidden mt-4">
                      {socialAuthors.map((expert, i) => (
                        <div
                          key={expert?.slug}
                          className="relative inline-block rounded-full ring-1 ring-brand-white dark:ring-brand-charcoal bg-brand-white dark:bg-brand-charcoal"
                          style={{ zIndex: socialAuthors.length - i }}
                        >
                          <Image
                            src={
                              expert?.avatar || "/static/images/logo/light.png"
                            }
                            width={40}
                            height={40}
                            alt={`${expert?.name} headshot`}
                            className="h-9 w-9 rounded-full object-cover grayscale-[20%]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </button>

                {/* Mobile-only: social detail directly beneath its own header */}
                {isSocialOpen && socialBody && (
                  <div className="md:hidden w-full rounded-2xl border border-brand-goldenrod bg-brand-white dark:bg-brand-charcoal p-6">
                    {socialBody}
                  </div>
                )}
              </div>

              {/* Desktop-only: shared full-width detail panel below the row */}
              {isTopicOpen && (
                <div className="hidden md:block mt-2 w-full rounded-2xl border border-brand-soft-green bg-brand-white dark:bg-brand-charcoal p-6">
                  {topicBody}
                </div>
              )}

              {isSocialOpen && socialBody && (
                <div className="hidden md:block mt-2 w-full rounded-2xl border border-brand-goldenrod bg-brand-white dark:bg-brand-charcoal p-6">
                  {socialBody}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-brand-soft-charcoal/50 dark:text-brand-white/40 mt-6 italic">
        Socials rotate alongside our curriculum — always something new to
        discover in Amsterdam with your baby.
      </p>
    </div>
  );
}

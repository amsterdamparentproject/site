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

          // Alex Siega is the default facilitator when a social doesn't name any.
          const facilitatorSlugs =
            social?.facilitators && social.facilitators.length > 0
              ? social.facilitators
              : ["alexSiega"];
          const socialAuthors = social?.placeholder
            ? []
            : facilitatorSlugs
                .map((slug) => {
                  const authorResults = allAuthors.find((p) => p.slug === slug);
                  return authorResults
                    ? coreContent(authorResults as Authors)
                    : null;
                })
                .filter(Boolean);

          const anyOpenThisMonth = isTopicOpen || isSocialOpen;

          const socialNotes = social?.note
            ? Array.isArray(social.note)
              ? social.note
              : [social.note]
            : [];

          const socialGoodToKnow = [
            social?.location && `📍 ${social.location}`,
            social?.logistics,
            ...socialNotes,
          ].filter(Boolean) as string[];

          // Body content only — title/subtitle are shown once in the header
          // and not repeated here on mobile. Desktop's shared panel adds
          // them back on top of this.
          const topicMainContent = (
            <>
              <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 mb-6 leading-relaxed whitespace-pre-line">
                {session.description.trim()}
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

          const socialMainContent = social && !social.placeholder && (
            <>
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
            </>
          );

          const topicCard = (
            <div
              key="topic-card"
              className={`h-full flex flex-col rounded-2xl border overflow-hidden bg-brand-white dark:bg-brand-charcoal transition-all ${
                anyOpenThisMonth ? "md:col-span-2" : ""
              } ${
                isTopicOpen
                  ? "border-brand-soft-green"
                  : "border-brand-sand/60 hover:border-brand-soft-green"
              }`}
            >
              <button
                onClick={() => toggle(topicKey)}
                className="flex-1 flex h-full w-full flex-col justify-between cursor-pointer text-left p-5"
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
                  <div
                    className={`-space-x-3 overflow-hidden mt-4 ${isTopicOpen ? "hidden" : "flex"}`}
                  >
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

              {/* Expands within this same card, on every breakpoint */}
              <div
                className={`grid min-h-0 transition-[grid-template-rows] duration-300 ease-in-out ${
                  isTopicOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`px-5 pb-5 pt-2 border-t border-brand-soft-green/10 transition-opacity duration-300 ${
                      isTopicOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {topicMainContent}
                  </div>
                </div>
              </div>
            </div>
          );

          const socialCard = (
            <div
              key="social-card"
              className={`h-full flex flex-col rounded-2xl border overflow-hidden bg-brand-white dark:bg-brand-charcoal transition-all ${
                anyOpenThisMonth ? "md:col-span-2" : ""
              } ${
                social?.placeholder
                  ? "border-dashed border-brand-sand/40 bg-brand-white/50 dark:bg-brand-charcoal/50"
                  : isSocialOpen
                    ? "border-brand-goldenrod"
                    : "border-brand-sand/60 hover:border-brand-goldenrod"
              }`}
            >
              <button
                onClick={() => !social?.placeholder && toggle(socialKey)}
                disabled={social?.placeholder}
                className={`flex-1 flex h-full w-full flex-col justify-between text-left p-5 ${
                  social?.placeholder ? "cursor-default" : "cursor-pointer"
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
                  <div
                    className={`-space-x-3 overflow-hidden mt-4 ${isSocialOpen ? "hidden" : "flex"}`}
                  >
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

              {/* Expands within this same card, on every breakpoint */}
              {socialMainContent && (
                <div
                  className={`grid min-h-0 transition-[grid-template-rows] duration-300 ease-in-out ${
                    isSocialOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`px-5 pb-5 pt-2 border-t border-brand-goldenrod/10 transition-opacity duration-300 ${
                        isSocialOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {socialMainContent}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );

          return (
            <div key={index}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-lg font-bold text-brand-goldenrod">
                  Month {index + 1}: {theme}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {isSocialOpen ? (
                  <>
                    {socialCard}
                    {topicCard}
                  </>
                ) : (
                  <>
                    {topicCard}
                    {socialCard}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-brand-soft-charcoal/50 dark:text-brand-white/40 mt-6 italic">
        Socials happen in person across Amsterdam. Expert sessions take place
        online so that you don't have to leave the house to get expert support —
        right when and where you need it.
      </p>
    </div>
  );
}

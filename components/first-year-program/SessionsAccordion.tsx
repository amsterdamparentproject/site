"use client";

import { useState } from "react";
import SessionsData from "@/data/first-year-program/sessions";
import Image from "@/components/Image";
import { coreContent } from "pliny/utils/contentlayer.js";
import { allAuthors, Authors } from "@/.contentlayer/generated";

export default function SessionsAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto my-6 px-4">
      <div className="space-y-4">
        {SessionsData.map((session, index) => {
          const sessionAuthors = session.experts
            .map((slug) => {
              const authorResults = allAuthors.find((p) => p.slug === slug);
              return authorResults
                ? coreContent(authorResults as Authors)
                : null;
            })
            .filter(Boolean);

          return (
            <div
              key={index}
              className={`border ${openIndex === index ? "border-brand-soft-green" : "border-brand-sand/60"} rounded-2xl overflow-hidden bg-brand-white dark:bg-brand-charcoal transition-all hover:shadow-sm hover:border-brand-soft-green`}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-brand-goldenrod uppercase tracking-widest">
                      Month {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-white leading-tight">
                    {session.title}
                  </h3>
                  <p className="text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 mt-0.5">
                    {session.subtitle}
                  </p>
                </div>
                <span
                  className={`shrink-0 transition-transform duration-300 text-brand-soft-green ${openIndex === index ? "rotate-45" : ""}`}
                >
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
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
              >
                <div className="px-6 pb-6 border-t border-brand-soft-green/10">
                  <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 mb-6 mt-4">
                    {session.description}
                  </p>

                  <div className="bg-brand-soft-green/5 rounded-xl py-4 px-6 mb-6">
                    <h4 className="text-md font-bold text-brand-charcoal dark:text-brand-goldenrod mb-2 text-center sm:text-left">
                      What we cover
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {session.components?.map((item, i) => (
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
                                expert?.avatar ||
                                "/static/images/logo/light.png"
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
                            <span className="text-xs text-brand-soft-green font-medium">
                              {expert?.occupation || "Postpartum Specialist"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-brand-soft-charcoal/50 dark:text-brand-white/40 mt-6 italic">
        Topics repeat every 6 months. The curriculum evolves as new modules are added.
      </p>
    </div>
  );
}

import { useState } from "react";
import SessionsData from "@/data/fourth-trimester-program/sessions";
import SessionsAccordionHeader from "./SessionsAccordionHeader";
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
              className={`border ${openIndex === index ? "border-brand-soft-green" : "border-brand-sand/60"} rounded-2xl overflow-hidden bg-brand-white transition-all hover:shadow-sm hover:border-brand-soft-green`}
            >
              <SessionsAccordionHeader
                title={session.title}
                subtitle={session.subtitle}
                experts={session.experts}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />

              <div
                className={`transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
              >
                <div className="p-6 pt-0 border-t border-brand-soft-green/10">
                  <p className="text-sm text-brand-soft-charcoal mb-6 mt-4">
                    {session.description}
                  </p>

                  <div className="bg-brand-soft-green/5 rounded-xl py-4 px-6 mb-6">
                    <h4 className="text-md font-bold text-brand-charcoal mb-2 text-center sm:text-left">
                      What we cover
                    </h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {session.components?.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-brand-soft-charcoal"
                        >
                          <span className="mx-1 mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-goldenrod" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-brand-soft-green/10 pt-4">
                    <h4 className="text-sm text-brand-charcoal mb-4 text-center sm:text-left">
                      Expert content by:
                    </h4>
                    <div className="flex flex-wrap justify-start sm:justify-start gap-6">
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
                            <span className="text-sm font-bold text-brand-charcoal leading-tight">
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
    </div>
  );
}

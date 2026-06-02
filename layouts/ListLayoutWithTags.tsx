"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { slug } from "github-slugger";
import { formatDate } from "pliny/utils/formatDate";
import { CoreContent } from "pliny/utils/contentlayer";
import type { Blog } from "contentlayer/generated";
import Link from "@/components/Link";
import Tag from "@/components/Tag";
import siteMetadata from "@/data/siteMetadata";
import tagData from "app/tag-data.json";
import SearchButton from "@/components/SearchButton";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[];
  title: string;
  subtitle?: string;
  initialDisplayPosts?: CoreContent<Blog>[];
  pagination?: PaginationProps;
}

function Pagination({
  totalPages,
  currentPage,
  selectedType,
}: PaginationProps & { selectedType?: string | null }) {
  const pathname = usePathname();
  const queryString = selectedType ? `?type=${selectedType}` : "";
  const basePath = pathname
    .replace(/^\//, "") // Remove leading slash
    .replace(/\/page\/\d+$/, ""); // Remove any trailing /page
  const prevPage = currentPage - 1 > 0;
  const nextPage = currentPage + 1 <= totalPages;

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button
            className="cursor-auto disabled:opacity-50"
            disabled={!prevPage}
          >
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={
              currentPage - 1 === 1
                ? `/${basePath}/${queryString}`
                : `/${basePath}/page/${currentPage - 1}${queryString}`
            }
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button
            className="cursor-auto disabled:opacity-50"
            disabled={!nextPage}
          >
            Next
          </button>
        )}
        {nextPage && (
          <Link
            href={`/${basePath}/page/${currentPage + 1}${queryString}`}
            rel="next"
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}

export default function ListLayoutWithTags({
  posts,
  title,
  subtitle,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname();
  const tagCounts = tagData as Record<string, number>;
  const tagKeys = Object.keys(tagCounts);
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a]);

  const displayPosts =
    initialDisplayPosts.length > 0 ? initialDisplayPosts : posts;

  const [selectedType, setSelectedType] = useState<string | null>(null);
  useEffect(() => {
    const sp =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    setSelectedType(sp?.get("type") ?? null);
  }, []);

  return (
    <>
      <div>
        <div className="pt-6 pb-6 flex flex-col items-center">
          <h1 className="text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
            {title}
          </h1>
          <h2 className="text-brand-soft-charcoal dark:text-brand-white text-lg font-medium tracking-tight my-2">
            {subtitle}
          </h2>
          <SearchButton />
        </div>
        <div className="flex sm:space-x-24">
          <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm pt-5 sm:flex mr-4">
            <div className="px-6">
              <br />
              {pathname.startsWith("/advice") ? (
                <h3 className="text-brand-soft-green dark:text-brand-goldenrod font-bold uppercase">
                  All advice
                </h3>
              ) : (
                <Link
                  href={`/advice`}
                  className="text-brand-soft-green dark:text-brand-goldenrod font-bold uppercase"
                >
                  All advice
                </Link>
              )}
              <ul>
                {sortedTags.map((t) => {
                  return (
                    <li key={t} className="my-3">
                      {decodeURI(pathname.split("/tags/")[1]) === slug(t) ? (
                        <h3 className="text-brand-soft-green dark:text-brand-goldenrod inline px-3 py-2 text-sm font-bold uppercase">
                          {`${t.replace("-", " ")} (${tagCounts[t]})`}
                        </h3>
                      ) : (
                        <Link
                          href={`/tags/${slug(t)}`}
                          className="hover:text-brand-soft-green dark:text-brand-goldenrod dark:hover:text-brand-goldenrod px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                          aria-label={`View posts tagged ${t}`}
                        >
                          {`${t.replace("-", " ")} (${tagCounts[t]})`}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div>
            <ul>
              {displayPosts.map((post) => {
                const { path, date, title, summary, tags } = post;
                return (
                  <li key={path} className="py-5">
                    <article className="flex flex-col space-y-2 xl:space-y-0">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-1 font-semibold uppercase text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                            {path.startsWith("stories/") ? "Story" : "Advice"}
                          </span>
                          <span className="text-base leading-6 font-medium text-gray-500 dark:text-brand-white">
                            <time dateTime={date} suppressHydrationWarning>
                              {formatDate(date, siteMetadata.locale)}
                            </time>
                          </span>
                        </div>
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/${path}`}
                              className="text-brand-charcoal dark:text-brand-white"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.map((tag) => <Tag key={tag} text={tag} />)}
                          </div>
                        </div>
                        <div className="prose max-w-none text-brand-soft-charcoal dark:text-brand-white">
                          {summary}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                selectedType={selectedType}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

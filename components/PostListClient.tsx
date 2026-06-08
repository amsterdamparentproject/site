"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatDate } from "pliny/utils/formatDate";
import { CoreContent } from "pliny/utils/contentlayer";
import type { Blog } from "contentlayer/generated";
import Image from "next/image";
import Link from "@/components/Link";
import siteMetadata from "@/data/siteMetadata";
import { BookOpen, Microscope } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterDimension = "type" | "series" | "stage" | "topic" | "freeResource";
export type Primary = "all" | "stories" | "advice";

export interface AuthorInfo {
  name: string;
  avatar?: string;
}

export interface PostListClientProps {
  posts: CoreContent<Blog>[];
  filterDimensions: FilterDimension[];
  primary: Primary;
  title: string;
  subtitle?: string;
  authorMap?: Record<string, AuthorInfo>;
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const SERIES_LABELS: Record<string, string> = {
  "expert-spotlight": "Expert Spotlight",
  "community-spotlight": "Community Spotlight",
  "founder-notes": "Founder Notes",
};

const STAGE_LABELS: Record<string, string> = {
  newborn: "Newborn",
  baby: "Baby",
  toddler: "Toddler",
};

const TYPE_LABELS: Record<string, string> = {
  advice: "Advice",
  stories: "Stories",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  // Capitalize the first letter after spaces and slashes
  return str.replace(/(^|[\s/])(\S)/g, (_, sep, char) => sep + char.toUpperCase());
}

function getContentType(post: CoreContent<Blog>): "advice" | "stories" {
  return post.path.startsWith("stories/") ? "stories" : "advice";
}

function matchesSearch(post: CoreContent<Blog>, query: string): boolean {
  const q = query.toLowerCase();
  return (
    post.title.toLowerCase().includes(q) ||
    (post.summary ?? "").toLowerCase().includes(q) ||
    (post.tags ?? []).some((t: string) => t.toLowerCase().includes(q))
  );
}

// Parse comma-separated URL param into array
function parseParam(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

// Toggle a value in an array, return new array
function toggleValue(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

// ─── Filter dropdown ──────────────────────────────────────────────────────────

function FilterDropdown({
  label,
  options,
  active,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  active: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (options.length === 0) return null;

  const selectedCount = active.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
          selectedCount > 0
            ? "border-brand-soft-green bg-brand-soft-green/10 text-brand-charcoal dark:text-brand-white"
            : "border-gray-200 bg-white text-gray-600 hover:border-brand-soft-green hover:text-brand-charcoal dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-brand-white"
        }`}
      >
        {label}
        {selectedCount > 0 && (
          <span className="rounded-full bg-brand-soft-green/20 px-1.5 py-0.5 text-xs font-semibold">
            {selectedCount}
          </span>
        )}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {options.map((opt) => {
            const checked = active.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(opt.value)}
                  className="h-4 w-4 rounded border-gray-300 accent-brand-soft-green"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  showType,
  authorMap,
}: {
  post: CoreContent<Blog>;
  showType: boolean;
  authorMap?: Record<string, AuthorInfo>;
}) {
  const { path, date, title, summary, tags, authors, series, freeResource } = post as CoreContent<Blog> & {
    series?: string;
    childStage?: string[];
    freeResource?: boolean;
    authors?: string[];
  };
  const type = getContentType(post);

  const postAuthors: AuthorInfo[] = (authors ?? [])
    .map((slug) => authorMap?.[slug])
    .filter((a): a is AuthorInfo => !!a);

  const Icon = type === "stories" ? BookOpen : Microscope;

  return (
    <li className="py-5">
      <article className="flex gap-5">
        {/* Icon column — desktop only */}
        <div className="hidden sm:flex flex-shrink-0 items-start pt-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft-green text-brand-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col space-y-2 min-w-0">
        {/* Title */}
        <h2 className="text-2xl leading-8 font-bold tracking-tight">
          <Link href={`/${path}`} className="text-brand-charcoal dark:text-brand-white">
            {title}
          </Link>
        </h2>

        {/* Author byline */}
        {postAuthors.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {postAuthors.map((author) =>
                author.avatar ? (
                  <Image
                    key={author.name}
                    src={author.avatar}
                    width={28}
                    height={28}
                    alt={author.name}
                    className="h-7 w-7 rounded-full ring-1 ring-brand-white dark:ring-gray-900 object-cover"
                  />
                ) : null
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {postAuthors.map((a) => a.name).join(", ")}
            </span>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="prose max-w-none text-brand-soft-charcoal dark:text-brand-white">
            {summary}
          </div>
        )}

        {/* Meta row — after summary, styled like tags */}
        <div className="flex flex-wrap items-center mt-2 gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            <time dateTime={date} suppressHydrationWarning>
              {formatDate(date, siteMetadata.locale)}
            </time>
          </span>
          {freeResource && (
            <span className="text-xs text-brand-soft-green font-medium">🎁 Free resource</span>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/read?topic=${encodeURIComponent(tag)}`}
                className="text-xs text-gray-500 hover:text-brand-soft-green dark:text-gray-400 dark:hover:text-brand-goldenrod"
              >
                #{toTitleCase(tag)}
              </Link>
            ))}
          </div>
        )}
        </div>
      </article>
    </li>
  );
}

// ─── Search results ───────────────────────────────────────────────────────────

function SearchResults({
  query,
  posts,
  primary,
  authorMap,
}: {
  query: string;
  posts: CoreContent<Blog>[];
  primary: Primary;
  authorMap?: Record<string, AuthorInfo>;
}) {
  const matched = posts.filter((p) => matchesSearch(p, query));

  if (primary === "all") {
    if (matched.length === 0) {
      return <p className="py-8 text-gray-500">No results for &ldquo;{query}&rdquo;</p>;
    }
    return (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {matched.map((p) => (
          <PostCard key={p.path} post={p} showType={true} authorMap={authorMap} />
        ))}
      </ul>
    );
  }

  const primaryPosts = matched.filter((p) => getContentType(p) === primary);
  const secondaryType = primary === "stories" ? "advice" : "stories";
  const secondaryPosts = matched.filter((p) => getContentType(p) === secondaryType);

  return (
    <div>
      {primaryPosts.length === 0 && secondaryPosts.length === 0 && (
        <p className="py-8 text-gray-500">No results for &ldquo;{query}&rdquo;</p>
      )}
      {primaryPosts.length > 0 && (
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
            {TYPE_LABELS[primary]}
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {primaryPosts.map((p) => (
              <PostCard key={p.path} post={p} showType={false} authorMap={authorMap} />
            ))}
          </ul>
        </>
      )}
      {secondaryPosts.length > 0 && (
        <div className={primaryPosts.length > 0 ? "mt-10" : ""}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
            {TYPE_LABELS[secondaryType]}
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {secondaryPosts.map((p) => (
              <PostCard key={p.path} post={p} showType={false} authorMap={authorMap} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const INITIAL_DISPLAY = 10;

export default function PostListClient({
  posts,
  filterDimensions,
  primary,
  title,
  subtitle,
  authorMap,
}: PostListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Read multi-value filter state from URL (comma-separated)
  const activeTypes = parseParam(searchParams.get("type"));
  const activeSeries = parseParam(searchParams.get("series"));
  const activeStages = parseParam(searchParams.get("stage"));
  const activeTopics = parseParam(searchParams.get("topic"));
  const activeFreeResource = searchParams.get("free") === "1";

  // Reset showAll when filters change
  useEffect(() => {
    setShowAll(false);
  }, [searchParams]);

  // Toggle a value in a comma-separated URL param
  function toggleParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = parseParam(params.get(key));
    const updated = toggleValue(current, value);
    if (updated.length === 0) {
      params.delete(key);
    } else {
      params.set(key, updated.join(","));
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  // Derive topic options from posts (title-cased labels, raw values)
  const topicOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        seen.add(tag);
      }
    }
    return Array.from(seen)
      .sort()
      .map((t) => ({ value: t, label: toTitleCase(t) }));
  }, [posts]);

  // Apply filters (each dimension is OR within itself, AND across dimensions)
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const p = post as CoreContent<Blog> & { series?: string; childStage?: string[]; freeResource?: boolean };
      if (activeTypes.length > 0 && !activeTypes.includes(getContentType(post))) return false;
      if (activeSeries.length > 0 && !activeSeries.includes(p.series ?? "")) return false;
      if (activeStages.length > 0 && !(p.childStage ?? []).some((s) => activeStages.includes(s))) return false;
      if (activeTopics.length > 0 && !(post.tags ?? []).some((t) => activeTopics.includes(t))) return false;
      if (activeFreeResource && !p.freeResource) return false;
      return true;
    });
  }, [posts, activeTypes, activeSeries, activeStages, activeTopics, activeFreeResource]);

  const hasActiveFilter =
    activeTypes.length > 0 ||
    activeSeries.length > 0 ||
    activeStages.length > 0 ||
    activeTopics.length > 0 ||
    activeFreeResource;

  function toggleFreeResource() {
    const params = new URLSearchParams(searchParams.toString());
    if (activeFreeResource) {
      params.delete("free");
    } else {
      params.set("free", "1");
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  const displayPosts =
    showAll || hasActiveFilter ? filteredPosts : filteredPosts.slice(0, INITIAL_DISPLAY);
  const hasMore = !showAll && !hasActiveFilter && filteredPosts.length > INITIAL_DISPLAY;

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div>
      {/* Header */}
      <div className="pt-6 pb-6 flex flex-col items-center">
        <h1 className="text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
          {title}
        </h1>
        {subtitle && (
          <h2 className="text-brand-soft-charcoal dark:text-brand-white text-lg font-medium tracking-tight my-2">
            {subtitle}
          </h2>
        )}
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-soft-green focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter dropdowns — hidden while searching */}
      {!isSearching && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {filterDimensions.includes("type") && (
            <FilterDropdown
              label="Type"
              options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              active={activeTypes}
              onToggle={(v) => toggleParam("type", v)}
            />
          )}
          {filterDimensions.includes("series") && (
            <FilterDropdown
              label="Series"
              options={Object.entries(SERIES_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              active={activeSeries}
              onToggle={(v) => toggleParam("series", v)}
            />
          )}
          {filterDimensions.includes("stage") && (
            <FilterDropdown
              label="Stage"
              options={Object.entries(STAGE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              active={activeStages}
              onToggle={(v) => toggleParam("stage", v)}
            />
          )}
          {filterDimensions.includes("topic") && (
            <FilterDropdown
              label="Topic"
              options={topicOptions}
              active={activeTopics}
              onToggle={(v) => toggleParam("topic", v)}
            />
          )}
          {filterDimensions.includes("freeResource") && (
            <button
              onClick={toggleFreeResource}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                activeFreeResource
                  ? "border-brand-soft-green bg-brand-soft-green/10 text-brand-charcoal dark:text-brand-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-soft-green hover:text-brand-charcoal dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-brand-white"
              }`}
            >
              🎁 Free Resource
            </button>
          )}
          {hasActiveFilter && (
            <button
              onClick={() => router.push(pathname, { scroll: false })}
              className="ml-1 text-xs text-gray-400 hover:text-brand-soft-green underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isSearching ? (
        <SearchResults query={searchQuery} posts={posts} primary={primary} authorMap={authorMap} />
      ) : (
        <>
          {displayPosts.length === 0 ? (
            <p className="py-8 text-gray-500">No posts match the selected filters.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayPosts.map((post) => (
                <PostCard
                  key={post.path}
                  post={post}
                  showType={filterDimensions.includes("type")}
                  authorMap={authorMap}
                />
              ))}
            </ul>
          )}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAll(true)}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:border-brand-soft-green hover:text-brand-charcoal dark:border-gray-700 dark:text-gray-300"
              >
                Show all {filteredPosts.length} posts
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

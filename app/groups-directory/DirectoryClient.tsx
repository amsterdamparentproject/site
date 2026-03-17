"use client";

import { CustomSocialIcon, components } from "@/components/social-icons";
import { useEffect, useMemo, useState } from "react";

// --- Types ---
interface Group {
  name: string;
  categories: string;
  isRecommended: boolean;
  platform: string;
  description: string;
  inviteLink: string;
}

interface DirectoryData {
  userName: string;
  maskedEmail: string;
  groups: Group[];
  matchCount: number;
}

export default function DirectoryClient() {
  // --- State ---
  const [data, setData] = useState<DirectoryData[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  const [activeTab, setActiveTab] = useState<"recommended" | "all">(
    "recommended",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const [userUid, setuserUid] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        // 1. Handle UID from URL or LocalStorage
        const params = new URLSearchParams(window.location.search);
        let uid = params.get("uid");

        if (uid) {
          localStorage.setItem("app_uid", uid);
          // Clean up URL without refreshing the page
          window.history.replaceState({}, "", window.location.pathname);
        } else {
          uid = localStorage.getItem("app_uid");
        }

        if (uid) {
          setuserUid(uid);
        }

        if (!uid) {
          // Redirect to the access form if no UID found
          console.error("No UID found");
          window.location.href = "groups-directory/access?uid=false";
        }

        // 2. Call n8n Webhook
        const response = await fetch(`/api/groups-directory?uid=${uid}`);

        if (!response.ok) throw new Error("Unauthorized access");

        // Check if the response actually has content before parsing
        const text = await response.text();

        if (!text) {
          throw new Error("n8n returned an empty response");
        }

        const result = JSON.parse(text);

        // Handle n8n common return types (Array or Object)
        const formattedData: DirectoryData = Array.isArray(result)
          ? result[0]
          : result;

        if (!formattedData?.groups) throw new Error("Invalid data format");

        setData([formattedData]);
        setStatus("success");
      } catch (error) {
        // Redirect to the access form if the link is invalid
        console.error("Directory Error:", error);
        window.location.href = "groups-directory/access?uid=false";
      }
    };

    fetchDirectory();
  }, []);

  // --- Computed Filters ---
  const categories = useMemo(() => {
    const all =
      data[0]?.groups.flatMap((g) =>
        g.categories
          .split(", ")
          .map((cat) => cat.trim())
          .filter(Boolean),
      ) || [];

    return ["All", ...Array.from(new Set(all)).sort()];
  }, [data]);

  const types = useMemo(() => {
    const all =
      data[0]?.groups
        .map((g) => g.platform)
        .filter((p) => p && p.trim() !== "") || [];

    return ["All", ...Array.from(new Set(all)).sort()];
  }, [data]);

  const filteredGroups = useMemo(() => {
    const groups = data[0]?.groups || [];
    return groups.filter((group) => {
      const matchesTab = activeTab === "all" || group.isRecommended;
      const matchesCat =
        selectedCategory === "All" ||
        group.categories.includes(selectedCategory);
      const matchesType =
        selectedType === "All" || group.platform === selectedType;
      return matchesTab && matchesCat && matchesType;
    });
  }, [data, activeTab, selectedCategory, selectedType]);

  // --- Conditional Renders ---
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-soft-green"></div>
        <p className="mt-4 text-brand-soft-charcoal">
          Loading your directory...
        </p>
      </div>
    );
  }

  const currentUser = data[0];

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="pt-6 pb-6 flex flex-col items-center">
        <h1 className="text-center text-brand-charcoal dark:text-brand-white text-3xl leading-8 font-extrabold tracking-tight md:text-4xl">
          Amsterdam Parent Groups Directory
        </h1>
      </div>

      <div className="mb-8 p-6 bg-brand-sand/30 dark:bg-brand-soft-charcoal dark:border-brand-soft-charcoal/30 rounded-xl">
        <h2 className="text-2xl font-bold text-brand-soft-green dark:text-brand-goldenrod">
          Welcome, {currentUser?.userName}!
        </h2>
        <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 italic">
          Accessing as: {currentUser?.maskedEmail}
        </p>
        <p className="text-sm text-brand-charcoal dark:text-brand-white mt-2">
          This is your personalized community directory! Based on your
          interests, we’ve curated a list of groups and support networks for
          parents and parents-to-be across Amsterdam and the Netherlands. This
          resource is built by the community, for the community, with no strings
          attached.
        </p>
        <p className="text-sm text-brand-charcoal dark:text-brand-white mt-2">
          To keep our spaces safe and free from spam,{" "}
          <b>please do not share these invite links publicly</b>. Help us
          protect these groups from spammers and more by keeping this directory
          private.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab("recommended")}
          className={`pb-3 px-6 text-sm rounded-l-lg cursor-pointer transition-all flex-1 md:flex-none ${
            activeTab === "recommended"
              ? "font-bold bg-brand-soft-green p-2 text-brand-white"
              : "bg-brand-soft-green/10 dark:bg-brand-soft-green/40 p-2 text-brand-soft-charcoal dark:text-brand-white"
          }`}
        >
          Recommended (
          {currentUser?.groups.filter((g) => g.isRecommended).length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-6 text-sm rounded-r-lg cursor-pointer transition-all flex-1 md:flex-none ${
            activeTab === "all"
              ? "font-bold bg-brand-soft-green p-2 text-brand-white"
              : "bg-brand-soft-green/10 dark:bg-brand-soft-green/40 p-2 text-brand-soft-charcoal dark:text-brand-white"
          }`}
        >
          Browse all ({currentUser?.groups.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 max-w-sm md:max-w-xl gap-4 items-end my-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="category-select"
            className="text-xs font-bold text-brand-soft-green dark:text-brand-goldenrod uppercase"
          >
            Category
          </label>
          <select
            id="category-select"
            className="bg-white text-brand-charcoal border border-brand-sand/60 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-soft-green outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="platform-select"
            className="text-xs font-bold text-brand-soft-green dark:text-brand-goldenrod uppercase"
          >
            Platform
          </label>
          <select
            id="platform-select"
            className="bg-white text-brand-charcoal border border-brand-sand/60 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-soft-green outline-none"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All platforms" : t}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setSelectedCategory("All");
            setSelectedType("All");
          }}
          className="cursor-pointer text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium hover:text-brand-goldenrod dark:hover:text-brand-soft-green transition-colors h-10 flex items-center"
        >
          Reset filters
        </button>
      </div>

      {/* Group List */}
      <div className="grid gap-4">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div
              key={`${group.name}-${group.platform}`}
              className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                group.isRecommended
                  ? "border border-brand-soft-green"
                  : "border border-brand-sand/60 dark:border-brand-soft-charcoal"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-white leading-tight">
                    {group.name}

                    {group.platform && (
                      <span className="inline-flex align-middle ml-2 -translate-y-[1px]">
                        <CustomSocialIcon
                          kind={
                            group.platform.toLowerCase() as keyof typeof components
                          }
                          size={4}
                        />
                      </span>
                    )}
                  </h3>
                </div>
                {group.description && (
                  <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 pt-1">
                    {group.description}
                  </p>
                )}
                {group.categories && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {group.categories.split(",").map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold uppercase tracking-widest text-brand-soft-green dark:text-brand-goldenrod p-0.5 rounded"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <a
                href={group.inviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-soft-green text-white px-10 py-2.5 rounded-full cursor-pointer font-bold hover:bg-brand-goldenrod hover:text-brand-charcoal active:scale-95 transition-all shadow-sm text-center"
                data-umami-event="Groups Directory: Join group"
                data-umami-event-uid={userUid}
              >
                Join
              </a>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-brand-sand/10 dark:bg-white/5 rounded-xl border border border-brand-sand">
            <p className="text-brand-soft-charcoal dark:text-brand-white font-medium">
              No groups match your current filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedType("All");
                setActiveTab("all");
              }}
              className="mt-2 text-brand-soft-green font-bold hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-soft-green cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-brand-charcoal dark:text-brand-white mt-8 mb-8 italic">
        Something not working? Please report broken links to{" "}
        <a
          href="mailto:hello@amsterdamparentproject.nl"
          className="dark:text-brand-goldenrod dark:hover:text-brand-soft-green hover:text-brand-goldenrod text-brand-soft-green"
        >
          hello@amsterdamparentproject.nl
        </a>
        .
      </p>
    </div>
  );
}

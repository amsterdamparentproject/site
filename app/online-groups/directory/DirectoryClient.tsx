"use client";

import { CustomSocialIcon } from "@/components/social-icons";
import { useEffect, useMemo, useState } from "react";

const MOCK_DATA = [
  {
    userName: "Alex",
    maskedEmail: "he***@amsterdamparentproject.nl",
    groups: [
      {
        GroupName: "All Day Mummy-ing",
        Category: "Parenting, Mom, Baby, Toddler, Child",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "AMS Buy/Sell 💙 1-3 years 💙 Size 80-98 ",
        Category: "Buy & sell, Toddler",
        isMatch: false,
        Platform: "WhatsApp",
        Description: "Buy and sell toddler stuff",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "AmsterDAD",
        Category: "Parenting, Dad, Baby, Toddler, Child",
        isMatch: false,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "Expat Moms in Amsterdam",
        Category: "Parenting, Mom, Baby, Toddler, Child",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "Fertility Treatment Support",
        Category: "Fertility support",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "Mum’s Gone Climbing NL",
        Category: "Event & meet-up",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "Mum’s Gone Climbing NL",
        Category: "Event & meet-up",
        isMatch: true,
        Platform: "Facebook",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "NL Twins Buy/Sell/Donate Baby/Kid Items",
        Category: "Twin, Buy & sell, Baby, Toddler, Child",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "Oost",
        Category: "Neighborhood, Parenting",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "Spring/Summer 2025 Parents Amsterdam",
        Category: "Age/Due date, Parenting, Baby, Toddler, Child",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "Twin Moms",
        Category: "Twin, Parenting, Baby, Toddler, Child",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "Walks 🌳 Amsterdam Mamas",
        Category: "Event & meet-up, Baby, Toddler, Child",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
      {
        GroupName: "West/New West",
        Category: "Neighborhood, Parenting",
        isMatch: true,
        Platform: "WhatsApp",
        Description:
          "Connection and support for moms at home or on flexible schedules whose kids aren’t in full-time daycare.",
        Link: "https://amsterdamparentproject.nl",
      },
    ],
    matchCount: 64,
  },
];

export default function DirectoryClient() {
  const [data, setData] = useState<DirectoryData[]>(MOCK_DATA);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  const [activeTab, setActiveTab] = useState<"recommended" | "all">(
    "recommended",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    setData(MOCK_DATA);
    setStatus("success");
  }, []);

  const categories = useMemo(() => {
    const all = data[0]?.groups.flatMap((g) => g.Category.split(", ")) || [];
    return ["All", ...Array.from(new Set(all)).sort()];
  }, [data]);

  const types = useMemo(() => {
    const all = data[0]?.groups.map((g) => g.Platform).filter(Boolean) || [];
    return ["All", ...Array.from(new Set(all)).sort()];
  }, [data]);

  const filteredGroups = useMemo(() => {
    const groups = data[0]?.groups || [];
    return groups.filter((group) => {
      const matchesTab = activeTab === "all" || group.isMatch;
      const matchesCat =
        selectedCategory === "All" || group.Category.includes(selectedCategory);
      const matchesType =
        selectedType === "All" || group.Platform === selectedType;
      return matchesTab && matchesCat && matchesType;
    });
  }, [data, activeTab, selectedCategory, selectedType]);

  if (status === "loading")
    return <div className="p-10 text-center">Loading the directory...</div>;
  if (status === "error")
    return <div className="p-10 text-center">Access denied.</div>;

  const currentUser = data[0];

  return (
    <div className="max-w-4xl mx-auto px-6">
      {" "}
      {/* Fixed 'ph-6' to 'px-6' */}
      <div className="pt-6 pb-6 flex flex-col items-center">
        <h1 className="text-center text-brand-charcoal dark:text-brand-white text-3xl leading-8 font-extrabold tracking-tight md:text-4xl">
          Online Community Group Directory
        </h1>
      </div>
      <div className="mb-8 p-6 bg-brand-sand/30 border border-brand-sand/60 dark:bg-brand-soft-charcoal dark:border-brand-soft-charcoal/30 rounded-xl">
        <h2 className="text-2xl font-bold text-brand-soft-green dark:text-brand-goldenrod">
          Welcome, {currentUser?.userName}!
        </h2>
        <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 italic">
          Accessing as: {currentUser?.maskedEmail}
        </p>
        <p className="text-sm text-brand-charcoal dark:text-brand-white mt-2">
          The community put this directory together to support other parents, no
          strings attached.{" "}
          <b>Please do not share the invite links in this directory!</b> Help us
          keep the groups safe.
        </p>
      </div>
      {/* Tabs */}
      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab("recommended")}
          className={`pb-3 px-6 text-sm rounded-l-lg cursor-pointer transition-all ${
            activeTab === "recommended"
              ? "font-bold bg-brand-soft-green p-2 text-brand-white"
              : "bg-brand-soft-green/10 dark:bg-brand-soft-green/40 p-2 text-brand-soft-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-white/80"
          }`}
        >
          Recommended ({currentUser?.groups.filter((g) => g.isMatch).length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-6 text-sm rounded-r-lg cursor-pointer transition-all ${
            activeTab === "all"
              ? "font-bold bg-brand-soft-green p-2 text-brand-white"
              : "bg-brand-soft-green/10 dark:bg-brand-soft-green/40 p-2 text-brand-soft-charcoal dark:text-brand-white hover:text-brand-soft-green dark:hover:text-brand-white/80"
          }`}
        >
          Browse all ({currentUser?.groups.length})
        </button>
      </div>
      {/* Filters Bar */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3  max-w-sm md:max-w-xl gap-4 items-end my-4">
        {" "}
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
          className="cursor-pointer text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium hover:text-brand-goldenrod transition-colors h-4 md:h-10 flex items-center"
        >
          Reset filters
        </button>
      </div>
      {/* Group List */}
      <div className="grid gap-4">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div
              // 3. Robust key construction
              key={`${group.GroupName}-${group.Platform}`}
              className={`p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                group.isMatch
                  ? "border border-brand-sand/60 dark:border-brand-soft-charcoal"
                  : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-brand-charcoal dark:text-brand-white leading-tight">
                    {group.GroupName}
                  </h3>
                  <CustomSocialIcon
                    kind={group.Platform?.toLowerCase()}
                    size={4}
                  />
                </div>
                {group.Description && (
                  <p className="text-sm text-brand-soft-charcoal dark:text-brand-white pt-1">
                    {group.Description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-soft-green dark:text-brand-goldenrod">
                    {group.Category}
                  </span>
                </div>
              </div>

              <a
                href={group.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-soft-green text-white px-8 py-2.5 rounded-full cursor-pointer font-bold hover:bg-brand-goldenrod hover:text-brand-charcoal active:scale-95 transition-all shadow-sm text-center"
              >
                Join
              </a>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-soft-charcoal">
            <p className="text-gray-500 font-medium">
              No groups found matching these criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedType("All");
                setActiveTab("all");
              }}
              className="mt-2 text-brand-soft-green font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

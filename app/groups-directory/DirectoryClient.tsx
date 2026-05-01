"use client";

import { postManageDirectory } from "@/components/PostToWebhook";
import { useEffect, useMemo, useState } from "react";
import AddGroupForm from "@/components/groups-directory/AddGroupForm";
import ChangeGroupForm from "@/components/groups-directory/ChangeGroupForm";
import DirectoryGroupCard from "@/components/groups-directory/DirectoryGroupCard";
import Modal from "@/components/Modal";

// --- Types ---
interface Group {
  name: string;
  categories: string[];
  recommended: boolean;
  platform: string;
  description: string;
  link: string;
}

interface DirectoryClientProps {
  recommended: Group[];
  allGroups: Group[];
  userInterests: string[];
  userName: string;
  userEmail: string;
  userMaskedEmail: string;
  uid?: string;
}

export default function DirectoryClient({
  recommended = [],
  allGroups = [],
  userInterests,
  uid,
  userName,
  userEmail,
  userMaskedEmail,
}: DirectoryClientProps) {
  // --- State ---
  const [activeTab, setActiveTab] = useState<"recommended" | "all">(
    recommended.length > 0 ? "recommended" : "all",
  );

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] =
    useState<Group | null>(null);

  // --- Modal/Drawer handlers ---
  const handleEditGroup = (group: Group) => {
    setSelectedGroupForEdit(group);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGroupForEdit(null);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  useEffect(() => {
    const storedUid = localStorage.getItem("app_uid");
    const userId = uid || storedUid;
    const hasCookie = document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("app_uid="));

    // Clear invalid UIDs from localStorage
    if (
      storedUid &&
      (storedUid === "false" ||
        storedUid === "null" ||
        storedUid === "undefined" ||
        storedUid.trim() === "")
    ) {
      localStorage.removeItem("app_uid");
    }

    if (!userId) return;

    localStorage.setItem("app_uid", userId);

    if (!hasCookie) {
      document.cookie = `app_uid=${userId}; path=/; max-age=31536000; SameSite=Lax`;
    }

    if (uid && window.location.search.indexOf("uid=") !== -1) {
      const url = new URL(window.location.href);
      url.searchParams.delete("uid");
      window.history.replaceState({}, "", url.toString());
    }
  }, [uid]);

  // --- Computed Filters ---
  const categories = useMemo(() => {
    const allTags = allGroups.flatMap((g) => g.categories || []);
    const uniqueTags = Array.from(new Set(allTags)).sort();
    return ["All", ...uniqueTags];
  }, [allGroups]);

  const types = useMemo(() => {
    const allPlatforms = allGroups
      .map((g) => g.platform)
      .filter((p): p is string => Boolean(p && p.trim() !== ""));
    return ["All", ...Array.from(new Set(allPlatforms)).sort()];
  }, [allGroups]);

  const filteredGroups = useMemo(() => {
    const baseGroups = activeTab === "recommended" ? recommended : allGroups;

    return baseGroups.filter((group) => {
      const matchesCat =
        selectedCategory === "All" ||
        group.categories?.includes(selectedCategory);

      const matchesType =
        selectedType === "All" || group.platform === selectedType;

      return matchesCat && matchesType;
    });
  }, [activeTab, selectedCategory, selectedType, recommended, allGroups]);

  // --- Actions ---
  const handleReport = async (group: Group) => {
    const confirmed = window.confirm(
      `Report the link to the ${group.name} group as broken?`,
    );
    if (!confirmed) return;

    try {
      const payload = { groupName: group.name, link: group.link };
      const result = await postManageDirectory(payload, "report");
      if (result.success) alert(`Issue reported. Thanks!`);
    } catch (err) {
      console.error("Report failed:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="pt-6 pb-6 flex flex-col items-center">
        <h1 className="text-center text-brand-charcoal dark:text-brand-white text-3xl font-extrabold md:text-4xl">
          Amsterdam Parent Groups Directory
        </h1>
      </div>

      {/* Welcome Header */}
      <div className="mb-8 p-6 pb-4 bg-brand-sand/30 dark:bg-brand-soft-charcoal rounded-xl border border-brand-sand/20">
        <h2 className="text-2xl font-bold text-brand-soft-green dark:text-brand-goldenrod">
          Welcome{userName && `, ${userName}`}!
        </h2>
        {userEmail && (
          <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 italic">
            Accessing as: {userMaskedEmail}
          </p>
        )}
        <p className="text-sm text-brand-charcoal dark:text-brand-white mt-2">
          This is your personalized community directory: a curated list of
          groups for parents and parents-to-be across Amsterdam. This free
          resource is built by APP and maintained by the community.
        </p>
        <p className="text-sm text-brand-charcoal dark:text-brand-white mt-2">
          To keep our spaces safe and free from spam,{" "}
          <b>please do not share these invite links publicly</b>. Help us
          protect these groups from spammers and more by keeping this directory
          private.
        </p>
        <button
          onClick={handleOpenAddModal}
          className="cursor-pointer mt-2 text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium hover:text-brand-charcoal dark:hover:text-brand-white h-10 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="ml-1">Add new group</span>
        </button>
      </div>

      {/* Tabs */}
      {recommended.length > 0 && (
        <div className="flex mb-6">
          <div className="relative group flex items-center">
            <button
              onClick={() => setActiveTab("recommended")}
              className={`pb-3 px-6 text-sm rounded-l-lg cursor-pointer transition-all flex-1 md:flex-none ${
                activeTab === "recommended"
                  ? "font-bold bg-brand-soft-green p-2 text-brand-white"
                  : "bg-brand-soft-green/10 dark:bg-brand-soft-green/40 p-2 text-brand-soft-charcoal dark:text-brand-white"
              }`}
            >
              Recommended ({recommended.length})
            </button>
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-white text-brand-charcoal text-xs rounded shadow-lg z-50">
              Recommendations are based on your indicated interests:{" "}
              {userInterests.join(", ")}
            </div>
          </div>
          <div className="relative group flex items-center">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-3 px-6 text-sm rounded-r-lg cursor-pointer transition-all flex-1 md:flex-none ${
                activeTab === "all"
                  ? "font-bold bg-brand-soft-green p-2 text-brand-white"
                  : "bg-brand-soft-green/10 dark:bg-brand-soft-green/40 p-2 text-brand-soft-charcoal dark:text-brand-white"
              }`}
            >
              Browse all ({allGroups.length})
            </button>
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-45 p-2 bg-white text-brand-charcoal text-xs rounded shadow-lg z-50">
              All groups in the directory
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 sm:min-w-md md:max-w-xl gap-4 items-end my-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="category-filter"
            className="text-xs font-bold text-brand-soft-green dark:text-brand-goldenrod uppercase"
          >
            Category
          </label>
          <select
            className="bg-white dark:bg-brand-white text-brand-charcoal border border-brand-sand/60 rounded-lg px-3 py-2 text-sm outline-none"
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
            htmlFor="type-filter"
            className="text-xs font-bold text-brand-soft-green dark:text-brand-goldenrod uppercase"
          >
            Platform
          </label>
          <select
            className="bg-white dark:bg-brand-white text-brand-charcoal border border-brand-sand/60 rounded-lg px-3 py-2 text-sm outline-none"
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
          className="cursor-pointer text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium hover:text-brand-charcoal dark:hover:text-brand-white h-10 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 mr-1" // Allows you to size it with Tailwind e.g., w-4 h-4
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Reset filters</span>
        </button>
      </div>

      {/* Group List */}
      <div className="grid gap-4">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <DirectoryGroupCard
              key={`${group.name}-${group.platform}`}
              group={group}
              uid={uid}
              onEdit={handleEditGroup}
              onReport={handleReport}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-brand-sand/10 rounded-xl border border-dashed border-brand-sand">
            <p className="text-brand-soft-charcoal dark:text-brand-white">
              No groups match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add new group"
      >
        <AddGroupForm
          info={{ userName: userName, userEmail: userEmail }}
          onClose={handleCloseAddModal}
        />
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Change group${selectedGroupForEdit ? `: ${selectedGroupForEdit.name}` : ""}`}
      >
        {selectedGroupForEdit && (
          <ChangeGroupForm
            info={{
              name: selectedGroupForEdit.name,
              categories: selectedGroupForEdit.categories?.join(", ") || "",
              description: selectedGroupForEdit.description,
              link: selectedGroupForEdit.link,
              userName: userName,
              userEmail: userEmail,
            }}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
}

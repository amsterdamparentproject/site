"use client";

import { useEffect, useMemo, useState } from "react";
import AdminGroupsDirectoryForm from "@/components/groups-directory/AdminGroupsDirectoryForm";
import EditProfileForm from "@/components/groups-directory/EditProfileForm";
import ReportIssueForm from "@/components/groups-directory/ReportIssueForm";
import FixLinkForm from "@/components/groups-directory/FixLinkForm";
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
  reported?: boolean;
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFixLinkModalOpen, setIsFixLinkModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] =
    useState<Group | null>(null);
  const [selectedGroupForReport, setSelectedGroupForReport] =
    useState<Group | null>(null);
  const [selectedGroupForFixLink, setSelectedGroupForFixLink] =
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

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setSelectedGroupForReport(null);
  };

  const handleCloseFixLinkModal = () => {
    setIsFixLinkModalOpen(false);
    setSelectedGroupForFixLink(null);
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
  const handleReport = (group: Group) => {
    if (group.reported) {
      setSelectedGroupForFixLink(group);
      setIsFixLinkModalOpen(true);
    } else {
      setSelectedGroupForReport(group);
      setIsReportModalOpen(true);
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
        <p className="text-sm text-brand-soft-charcoal dark:text-brand-white/80 italic">
          Accessing as: {userMaskedEmail || userEmail}
        </p>
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
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleOpenAddModal}
            className="cursor-pointer text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium hover:text-brand-charcoal dark:hover:text-brand-white h-10 flex items-center"
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
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="cursor-pointer text-sm text-brand-soft-green dark:text-brand-goldenrod font-medium hover:text-brand-charcoal dark:hover:text-brand-white h-10 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="ml-1">Update profile</span>
          </button>
        </div>
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
        <AdminGroupsDirectoryForm
          mode="add"
          info={{ userName: userName, userEmail: userEmail, userId: uid }}
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
          <AdminGroupsDirectoryForm
            mode="edit"
            info={{
              name: selectedGroupForEdit.name,
              categories: selectedGroupForEdit.categories?.join(", ") || "",
              description: selectedGroupForEdit.description,
              link: selectedGroupForEdit.link,
              userName: userName,
              userEmail: userEmail,
              userId: uid,
            }}
            onClose={handleCloseModal}
          />
        )}
      </Modal>

      {/* Report Issue Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        title={`Report issue${selectedGroupForReport ? `: ${selectedGroupForReport.name}` : ""}`}
      >
        {selectedGroupForReport && (
          <ReportIssueForm
            info={{
              name: selectedGroupForReport.name,
              link: selectedGroupForReport.link,
            }}
            onClose={handleCloseReportModal}
          />
        )}
      </Modal>

      {/* Fix Link Modal */}
      <Modal
        isOpen={isFixLinkModalOpen}
        onClose={handleCloseFixLinkModal}
        title={`Fix broken link${selectedGroupForFixLink ? `: ${selectedGroupForFixLink.name}` : ""}`}
      >
        {selectedGroupForFixLink && (
          <FixLinkForm
            info={{
              name: selectedGroupForFixLink.name,
              link: selectedGroupForFixLink.link,
            }}
            onClose={handleCloseFixLinkModal}
          />
        )}
      </Modal>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Update profile"
      >
        <EditProfileForm
          uid={uid!}
          userName={userName}
          userEmail={userEmail}
          userInterests={userInterests}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

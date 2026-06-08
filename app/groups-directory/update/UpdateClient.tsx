"use client";

import { useRef, useState } from "react";
import { postManageDirectory } from "@/components/PostToWebhook";
import CategoryChipsFormField from "@/components/groups-directory/CategoryChipsFormField";
import type { GroupOption } from "./page";

const DESCRIPTION_MAX_LENGTH = 500;

const focusStyle = `focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-brand-soft-green`;
const inputBase =
  `appearance-none block w-full bg-white text-brand-charcoal placeholder-gray-400/80 border rounded py-3 px-4 leading-tight focus:bg-white ` +
  focusStyle;
const inputStyle = `${inputBase} border-brand-sand`;
const requiredInputStyle = `${inputBase} border-red-500 bg-red-50/30 focus:border-red-600`;
const labelStyle = `block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-2`;
const submitButtonStyle =
  `bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal w-48 font-bold text-lg mt-2 px-6 py-2 rounded transition-all cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed ` +
  focusStyle;

interface Props {
  groups: GroupOption[];
}

export default function UpdateClient({ groups }: Props) {
  // --- Group name autocomplete ---
  const [inputValue, setInputValue] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Core fields ---
  const [newLink, setNewLink] = useState("");
  const [email, setEmail] = useState("");

  // --- Expandable "other fields" ---
  const [showOtherFields, setShowOtherFields] = useState(false);
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const [touched, setTouched] = useState({ group: false, newLink: false, email: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Autocomplete suggestions ---
  const suggestions =
    inputValue.trim() === ""
      ? groups
      : groups.filter((g) =>
          g.name.toLowerCase().includes(inputValue.toLowerCase()),
        );

  // --- Validation ---
  const isLinkValid =
    newLink.trim() === "" ||
    newLink.trim().startsWith("http://") ||
    newLink.trim().startsWith("https://");
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = selectedGroup !== null && isLinkValid && isEmailValid;

  // --- Autocomplete handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedGroup(null);
    setShowDropdown(true);
    setActiveIndex(-1);
  };

  const confirmSelection = (group: GroupOption) => {
    setSelectedGroup(group);
    setInputValue(group.name);
    setShowDropdown(false);
    setActiveIndex(-1);
    // Pre-fill description and categories from the existing group data
    setDescription(group.description ?? "");
    setCategories(group.categories ?? []);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      setTouched((p) => ({ ...p, group: true }));
      if (selectedGroup === null) {
        const exact = groups.find(
          (g) => g.name.toLowerCase() === inputValue.toLowerCase(),
        );
        if (exact) {
          confirmSelection(exact);
        } else {
          setInputValue("");
        }
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        confirmSelection(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const groupFieldInvalid =
    touched.group && (selectedGroup === null || selectedGroup === "");

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("originalGroupName", selectedGroup!.name);
      data.append("groupName", selectedGroup!.name);
      data.append("platform", selectedGroup!.platform ?? "");
      data.append("inviteLink", newLink.trim());
      data.append("description", description.trim());
      data.append("categories", categories.join(", "));
      data.append("adminName", "");
      data.append("email", email.trim());
      data.append("notes", "");
      data.append("agreedToTerms", "Yes");
      data.append("createAccount", "No");
      data.append("subscribeNewsletter", "No");
      data.append("source", "direct");

      const response = await postManageDirectory(data, "update");
      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert(
        "Something went wrong. Please contact hello@amsterdamparentproject.nl.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full p-10 text-center bg-brand-soft-green border-2 border-brand-soft-green rounded-xl">
        <h2 className="text-2xl font-bold text-brand-goldenrod dark:text-brand-white mb-2">
          Thanks!
        </h2>
        <p className="text-brand-white">
          We've received your update and will apply it to the directory shortly.
        </p>
      </div>
    );
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      {/* Group name autocomplete */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3 relative">
          <label className={labelStyle} htmlFor="groupName">
            Group name <span className="text-red-500">*</span>
          </label>
          <input
            ref={inputRef}
            id="groupName"
            type="text"
            autoComplete="off"
            className={groupFieldInvalid ? requiredInputStyle : inputStyle}
            placeholder="Search for your group..."
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-expanded={showDropdown && suggestions.length > 0}
          />
          {groupFieldInvalid && (
            <p className="mt-1 text-xs text-red-500">
              Please select a group from the list.
            </p>
          )}

          {showDropdown && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-50 left-3 right-3 mt-1 bg-white border border-brand-sand rounded shadow-lg max-h-56 overflow-y-auto"
            >
              {suggestions.map((group, i) => (
                <li
                  key={`${group.name}-${group.platform}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={() => confirmSelection(group)}
                  className={`px-4 py-2 text-sm cursor-pointer text-brand-charcoal ${
                    i === activeIndex
                      ? "bg-brand-soft-green/20 font-semibold"
                      : "hover:bg-brand-sand/20"
                  }`}
                >
                  {group.name}
                  {group.platform && (
                    <span className="ml-2 text-xs text-gray-400">
                      {group.platform}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {showDropdown &&
            inputValue.trim() !== "" &&
            suggestions.length === 0 && (
              <div className="absolute z-50 left-3 right-3 mt-1 bg-white border border-brand-sand rounded shadow-lg px-4 py-3 text-sm text-gray-400">
                No groups found. Check the spelling or contact us.
              </div>
            )}
        </div>
      </div>

      {/* New invite link */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="newLink">
            New invite link
          </label>
          <input
            id="newLink"
            type="text"
            className={
              touched.newLink && !isLinkValid ? requiredInputStyle : inputStyle
            }
            placeholder="https://chat.whatsapp.com/..."
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, newLink: true }))}
          />
          {touched.newLink && !isLinkValid && (
            <p className="mt-1 text-xs text-red-500">
              Please enter a valid URL starting with https://
            </p>
          )}
        </div>
      </div>

      {/* Optional email */}
      <div className="flex flex-wrap mb-6">
        <div className="w-full px-3">
          <label className={labelStyle} htmlFor="email">
            Your email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            className={
              touched.email && !isEmailValid ? requiredInputStyle : inputStyle
            }
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          />
          <p className="mt-1.5 text-xs text-gray-400 dark:text-brand-white/60">
            To confirm humanity ❤️ and for any follow-up questions
          </p>
        </div>
      </div>

      {/* Expandable: other fields */}
      <div className="mb-6 px-3">
        <button
          type="button"
          onClick={() => setShowOtherFields((v) => !v)}
          className="flex items-center gap-2 text-sm font-bold text-brand-soft-green dark:text-brand-goldenrod hover:underline cursor-pointer"
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
            className={`transition-transform ${showOtherFields ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Update other fields
        </button>
      </div>

      {showOtherFields && (
        <>
          {/* Description */}
          <div className="flex flex-wrap mb-6 px-3">
            <label className={labelStyle + " w-full"} htmlFor="description">
              Group description
            </label>
            <textarea
              className={inputStyle}
              id="description"
              name="description"
              rows={3}
              placeholder="What is your group about?"
              maxLength={DESCRIPTION_MAX_LENGTH}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p
              className={`mt-1 text-xs text-right w-full ${
                description.length >= DESCRIPTION_MAX_LENGTH
                  ? "text-red-500 font-semibold"
                  : "text-gray-400"
              }`}
            >
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          {/* Categories */}
          <CategoryChipsFormField
            selectedCategories={categories}
            onChange={setCategories}
          />
        </>
      )}

      <div className="flex flex-col mb-6 px-3">
        <button
          className={submitButtonStyle}
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Submit update"}
        </button>
      </div>

      <p className="px-3 text-sm italic text-brand-soft-charcoal dark:text-brand-white/60">
        Updates go through an APP review before going live.
      </p>
    </form>
  );
}

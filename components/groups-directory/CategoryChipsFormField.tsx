"use client";

import { GROUP_CATEGORIES } from "@/app/types/groups-directory";

interface CategoryChipsProps {
  selectedCategories: string[];
  formQuestion?: string;
  formQuestionDescription?: string;
  onChange: (categories: string[]) => void;
  showSelectAll?: boolean;
}

export default function CategoryChipsFormField({
  selectedCategories,
  formQuestion = "Which categories apply to your group?",
  formQuestionDescription = "Tap to select all that apply. If none apply, it will show in the general list.",
  onChange,
  showSelectAll = true,
}: CategoryChipsProps) {
  const categories = GROUP_CATEGORIES;
  const allSelected = selectedCategories.length === categories.length;

  const handleSelectAll = () => {
    if (allSelected) {
      // If all are already selected, clear the list
      onChange([]);
    } else {
      // Otherwise, select all categories
      onChange([...categories]);
    }
  };

  const handleToggleCategory = (category: string) => {
    const isSelected = selectedCategories.includes(category);
    const updatedCategories = isSelected
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onChange(updatedCategories);
  };

  return (
    <div className="flex flex-wrap mb-6 px-3">
      <div className="flex justify-between items-end w-full mb-1">
        <label
          htmlFor="categories-chips"
          className="tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold"
        >
          {formQuestion}
        </label>
        {showSelectAll && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-bold text-brand-soft-green hover:underline transition-colors cursor-pointer"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-4 italic w-full">
        {formQuestionDescription}
      </p>

      <div id="categories-chips" className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => handleToggleCategory(category)}
              className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2
                ${
                  isSelected
                    ? "bg-brand-soft-green border-brand-soft-green text-white shadow-md scale-105"
                    : "bg-brand-sand/10 border-brand-sand text-gray-600 hover:border-brand-soft-green"
                }`}
            >
              <span>{category}</span>
              {isSelected ? (
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
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
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

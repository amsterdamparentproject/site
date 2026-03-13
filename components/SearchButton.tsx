"use client";

import { KBarButton } from "pliny/search/KBarButton";
import { SearchProvider } from "pliny/search";
import siteMetadata from "@/data/siteMetadata";

const SearchButton = () => {
  if (siteMetadata.search?.provider === "kbar") {
    return (
      <SearchProvider searchConfig={siteMetadata.search}>
        <KBarButton aria-label="Search">
          <div className="flex items-center space-x-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4 text-brand-violet group-hover:text-brand-goldenrod"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <span className="hidden font-xl text-brand-violet group-hover:text-brand-goldenrod sm:block">
              Search
            </span>
          </div>
        </KBarButton>
      </SearchProvider>
    );
  }
  return null;
};

export default SearchButton;

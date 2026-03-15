"use client";
import { useState } from "react";

const SharePageButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy url: ", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-brand-sand/10 border border-brand-sand/30 rounded-xl my-2">
      <p className="text-brand-soft-charcoal dark:text-brand-white text-sm font-medium mb-4">
        Invite others to the directory:
      </p>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-3 px-6 py-3 cursor-pointer rounded-full font-bold transition-all duration-300 shadow-sm
          ${
            copied
              ? "bg-brand-soft-green text-brand-white scale-95"
              : "bg-brand-soft-green text-brand-white border-2 border-brand-soft-green hover:bg-brand-soft-green hover:text-brand-white"
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {copied ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          )}
        </svg>
        {copied ? "Link copied!" : "Copy page link"}
      </button>
    </div>
  );
};

export default SharePageButton;

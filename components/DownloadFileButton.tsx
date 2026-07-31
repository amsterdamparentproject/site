"use client";

import { useState } from "react";

const buttonClassName =
  "inline-flex items-center px-6 py-3 bg-brand-soft-green text-base font-medium rounded-md text-brand-white hover:bg-brand-goldenrod cursor-pointer disabled:opacity-60 disabled:cursor-wait";

// Icon-only variant (see iconOnly prop below) — a plain circle, same size
// and colors as the round icon badges in components/homepage/ResourceRow.tsx
// and EventRow.tsx, so it reads as "the same kind of icon button" elsewhere
// in the app rather than a one-off shape.
const iconButtonClassName =
  "inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-soft-green hover:bg-brand-goldenrod text-brand-white cursor-pointer disabled:opacity-60 disabled:cursor-wait transition-colors shrink-0";

// Fixed 2026-07-29 — this used to be two unrelated icon paths overlaid on
// top of each other (a right-pointing arrow plus a stray tray shape),
// visibly broken. Replaced with a single clean "download" glyph (arrow
// into a tray), Heroicons' ArrowDownTrayIcon path.
const DownloadIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

// Two modes:
// - filePath: plain static link (existing behavior — FTPSessionCard.tsx's
//   public guides, untouched by the FYP Hub Storage migration).
// - onDownload: async, returns a fresh URL at click time (e.g. a
//   short-lived Supabase Storage signed URL) rather than linking a path
//   that's known upfront — used by the Hub's private resource guides, which
//   have no stable public URL to link to at all.
//
// iconOnly (added 2026-07-29, Hub resource guides only): renders just the
// round icon badge, no visible text — buttonText still required and used
// as the aria-label/title so the button stays accessible/hoverable.
// FTPSessionCard's public guide buttons are untouched (iconOnly omitted
// there, defaults to the full text button).
function DownloadFileButton({
  filePath,
  onDownload,
  buttonText,
  umamiName,
  iconOnly = false,
}: {
  filePath?: string;
  onDownload?: () => Promise<string | null>;
  buttonText: string;
  umamiName: string;
  iconOnly?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  if (onDownload) {
    if (iconOnly) {
      return (
        <button
          type="button"
          disabled={loading}
          aria-label={buttonText}
          title={buttonText}
          data-umami-event={umamiName}
          data-umami-event-type="downloadFileButton"
          className={iconButtonClassName}
          onClick={async () => {
            setLoading(true);
            try {
              const url = await onDownload();
              if (url) window.open(url, "_blank", "noopener,noreferrer");
            } finally {
              setLoading(false);
            }
          }}
        >
          <DownloadIcon className="h-4 w-4" />
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={loading}
        data-umami-event={umamiName}
        data-umami-event-type="downloadFileButton"
        className={buttonClassName}
        onClick={async () => {
          setLoading(true);
          try {
            const url = await onDownload();
            if (url) window.open(url, "_blank", "noopener,noreferrer");
          } finally {
            setLoading(false);
          }
        }}
      >
        <DownloadIcon className="mr-2 h-5 w-5" />
        {loading ? "Preparing…" : buttonText}
      </button>
    );
  }

  return (
    <a
      href={filePath}
      download
      data-umami-event={umamiName}
      data-umami-event-type="downloadFileButton"
      className={buttonClassName}
    >
      <DownloadIcon className="mr-2 h-5 w-5" />
      {buttonText}
    </a>
  );
}

export default DownloadFileButton;

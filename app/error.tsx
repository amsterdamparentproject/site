"use client";

import { useEffect } from "react";
import Link from "@/components/Link";

/**
 * Route-segment error boundary. Catches errors thrown while rendering any page
 * under app/ and renders this UI in place of the page (inside the root layout),
 * instead of leaving the App Router without an error component — which in dev
 * produces the "missing required error components, refreshing..." reload loop.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error in the console (and Playwright's captured logs).
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:text-6xl dark:text-gray-100">
        Something went wrong
      </h1>
      <p className="mt-4 mb-8 max-w-md">
        Sorry — an unexpected error occurred. Please try again, or head back to
        our homepage.
      </p>
      {error?.digest && (
        <p className="mb-8 font-mono text-xs text-brand-soft-charcoal dark:text-gray-400">
          Error reference: {error.digest}
        </p>
      )}
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="inline rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm leading-5 font-medium text-white shadow-xs transition-colors duration-150 hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline rounded-lg border border-brand-sand/60 px-4 py-2 text-sm leading-5 font-medium transition-colors duration-150 hover:bg-brand-sand/20"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}

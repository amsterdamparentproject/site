"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { buildReportHref } from "@/lib/sentry/report";

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
  const [eventId, setEventId] = useState<string>();

  useEffect(() => {
    // Surface the real error in the console (and Playwright's captured logs).
    console.error(error);
    setEventId(
      Sentry.captureException(
        error,
        error.digest ? { tags: { digest: error.digest } } : undefined,
      ),
    );
  }, [error]);

  const reportHref = buildReportHref({
    to: "hello@amsterdamparentproject.nl",
    product: "Amsterdam Parent Project",
    eventId,
    digest: error?.digest,
  });

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:text-6xl dark:text-gray-100">
        Something went wrong
      </h1>
      <p className="mt-4 mb-8 max-w-md">
        Sorry — an unexpected error occurred. Please try again, or head back to
        our homepage.
      </p>
      {eventId && (
        <p className="mb-8 font-mono text-xs text-brand-soft-charcoal dark:text-gray-400">
          Reference: {eventId.slice(0, 8)}
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
        <a
          href={reportHref}
          className="inline rounded-lg border border-brand-sand/60 px-4 py-2 text-sm leading-5 font-medium transition-colors duration-150 hover:bg-brand-sand/20"
        >
          Email us about this
        </a>
      </div>
    </div>
  );
}

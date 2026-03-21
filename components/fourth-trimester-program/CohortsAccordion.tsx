import { useState } from "react";
import CohortSchedule from "./CohortSchedule";
import InfoIcon from "../social-icons/info-icon";

const handleCheckout = async ({ cohort, isClosed }) => {
  if (isClosed) {
    return;
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cohortSlug: cohort.slug,
        cohortTitle: cohort.title,
      }),
    });

    const session = await response.json();

    if (session.error) throw new Error(session.error);

    if (session.url) {
      // TODO: Open in new tab
      window.location.href = session.url; // Send the user to Stripe
    }
  } catch (err) {
    console.error("Checkout failed:", err);
    alert("Something went wrong. Please try again or message me!");
  }
};

const StatusIndicator = ({ groupStatus, inline = false }) => {
  const statusConfig = {
    Open: {
      dot: "bg-brand-soft-green dark:bg-brand-violet",
      text: "text-brand-soft-green dark:text-brand-violet",
      label: "Open",
    },
    "Last spots": {
      dot: "bg-brand-goldenrod",
      text: "text-brand-goldenrod",
      label: "Last spots",
    },
    Full: {
      dot: "bg-gray-400",
      text: "text-gray-400",
      label: "Full",
    },
  };

  const config = statusConfig[groupStatus] || statusConfig["Open"];
  const statusText = groupStatus || "Open";

  if (inline) {
    return (
      <>
        <span
          className={`inline-block h-2 w-2 rounded-full ml-3 mr-2 bg-brand-charcoal ${config.dot}`}
        ></span>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}
        >
          {statusText}
        </span>
      </>
    );
  } else {
    return (
      <div className="flex items-center">
        <span className={`h-2 w-2 rounded-full mr-2 ${config.dot}`}></span>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${config.text}`}
        >
          {statusText}
        </span>
      </div>
    );
  }
};

export default function CohortsAccordion({ cohort }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const now = new Date();
  const groupStatus = cohort.groupStatus || "Open";
  const isClosed = cohort.start <= now || groupStatus === "Full";

  const hasSchedule = cohort.sessions?.length > 0;

  return (
    <div
      className={`border rounded-2xl p-6 transition-all bg-white ${
        isExpanded
          ? "border-brand-soft-green"
          : "border-brand-sand/60 hover:border-brand-soft-green"
      }`}
    >
      {/* 1. STATIC HEADER (Option 1: Inline Flow) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          {/* Title and Status on the same line */}
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="font-bold text-brand-charcoal text-xl leading-none">
              {cohort.title}
            </h3>
            <StatusIndicator groupStatus={groupStatus} />
          </div>

          <p className="text-sm font-semibold italic text-brand-soft-green mt-2 mb-2">
            For {cohort.dueDates} babies
          </p>

          {/* 2. THE INLINE TOGGLE */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-soft-charcoal/60 hover:text-brand-soft-green transition-colors group"
          >
            <span>
              {isExpanded
                ? "Show less"
                : `Cohort ${hasSchedule ? "schedule & details" : "details"}`}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        {/* 3. STATIC ACTION (Simple Button) */}
        <div className="shrink-0">
          <button
            type="button"
            className={`inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm text-white ${
              isClosed
                ? "bg-brand-soft-charcoal disabled"
                : "cursor-pointer transition-all hover:bg-brand-goldenrod active:scale-95 bg-brand-soft-green hover:bg-brand-goldenrod"
            }`}
            onClick={() => handleCheckout({ cohort, isClosed })}
          >
            {isClosed ? "Closed" : "Save your place — €25"}
          </button>
        </div>
      </div>

      {/* 4. EXPANDABLE CONTENT */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-4 border-t border-brand-soft-green/10 text-sm text-brand-charcoal/70 leading-relaxed">
          <p className="mb-4">
            Once you've secured your spot, you'll receive a welcome email with a
            brief intake form. We use this to match you with other families in
            your neighborhood with similar due dates.
          </p>
          <div className="bg-brand-soft-green/5 p-4 rounded-xl flex gap-3 items-start">
            <span className="text-brand-goldenrod">
              <InfoIcon />
            </span>
            <p className="text-xs">
              Your €25 reservation fee is applied as a credit toward total
              program costs once your cohort begins. If we are unable to form a
              cohort for you, you will be fully refunded your reservation fee.
            </p>
          </div>
          {hasSchedule && (
            <div className="w-full mt-6 border-t border-brand-soft-green/10 mb-6">
              <h2 className="text-lg text-brand-soft-green dark:text-brand-goldenrod mb-1 font-bold mt-4">
                Cohort schedule
              </h2>
              <p className="italic text-xs mb-3">
                Please note: The schedule may change before the start of the
                cohort.
              </p>
              <CohortSchedule cohort={cohort} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

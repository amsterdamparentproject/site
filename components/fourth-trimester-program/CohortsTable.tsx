"use client";

import Link from "next/link";
import { useState } from "react";
import FTPCohortSchedule from "./CohortSchedule";

const handleCheckout = async (cohort) => {
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
      window.location.href = session.url; // Send the user to Stripe
    }
  } catch (err) {
    console.error("Checkout failed:", err);
    alert("Something went wrong. Please try again or message me!");
  }
};

const formatDate = (date) => {
  return date instanceof Date
    ? date.toLocaleDateString("en-US", { day: "numeric", month: "short" })
    : "TBD";
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
      label: "Last Spots",
    },
    Full: {
      dot: "bg-gray-400",
      text: "text-gray-400",
      label: "Full",
      pulse: "",
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

const SessionTable = ({ cohort }) => {
  const sortedSessions = [...(cohort.sessions || [])].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date.getTime() - b.date.getTime();
  });

  return (
    <div className="w-full bg-brand-sand/10 p-4">
      <h2 className="text-brand-soft-green dark:text-brand-goldenrod mb-2 font-bold">
        Cohort schedule
      </h2>
      <p className="italic text-sm mb-3">
        Please note: The schedule may change before the start of the cohort.
      </p>
      <FTPCohortSchedule cohort={cohort} />
    </div>
  );
};

const CohortRow = ({ cohort, activationFee = 25 }) => {
  const [isRowOpen, setIsRowOpen] = useState(false);
  const now = new Date();

  // Get cohort status
  const groupStatus = cohort.groupStatus || "Open";
  const isClosed = cohort.start <= now;
  const isFull = groupStatus === "Full";

  return (
    <>
      <tr
        onClick={() => setIsRowOpen(!isRowOpen)}
        className={`group cursor-pointer transition-all border-b border-brand-soft-green/20 dark:border-brand-soft-charcoal/30 ${
          isRowOpen ? "bg-brand-sand/5 shadow-inner" : "hover:bg-brand-sand/10"
        }`}
      >
        {/* Column 1: Season & Toggle */}
        <td className="px-3 py-5">
          <div className="flex items-center">
            <span
              className={`mr-3 text-[10px] transition-transform duration-300 text-brand-soft-green ${isRowOpen ? "rotate-90" : ""}`}
            >
              ▶
            </span>
            <div>
              <div className="font-bold text-lg text-brand-soft-charcoal dark:text-brand-white leading-tight">
                {cohort.dueDates} babies
              </div>
              <div className="sm:hidden text-xs text-brand-soft-charcoal font-medium mt-1">
                <span> Starting {formatDate(cohort.start)}</span>
                <StatusIndicator
                  groupStatus={cohort.groupStatus}
                  inline={true}
                />
              </div>
            </div>
          </div>
        </td>

        {/* Column 2: Due Date Window (Desktop) */}
        <td className="px-6 py-5 hidden sm:table-cell text-sm font-medium text-brand-charcoal dark:text-brand-white">
          {formatDate(cohort.start)} to {formatDate(cohort.end)}
        </td>

        {/* Column 3: Status Indicator */}
        <td className="px-3 py-5 hidden sm:table-cell">
          <StatusIndicator groupStatus={groupStatus} />
        </td>

        {/* Column 4: Activation CTA */}
        <td
          className="px-3 py-5 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          {!isClosed ? (
            <button
              type="button"
              className="pointer-cursor text-center inline-block dark:hover:bg-brand-goldenrod dark:hover:text-brand-charcoal dark:bg-brand-soft-green dark:text-brand-white bg-brand-goldenrod hover:bg-brand-soft-green hover:text-brand-white text-brand-charcoal px-3 py-2 rounded text-xs font-bold"
              data-umami-event-name="Fourth Trimester Program: Save your place"
              data-umami-event-cohort={cohort.slug}
              onClick={() => handleCheckout(cohort)}
            >
              Save my place (€{activationFee})
            </button>
          ) : (
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {isClosed ? "Closed" : "Waitlist"}
            </span>
          )}
        </td>
      </tr>

      {/* Expanded Session View */}
      {isRowOpen && (
        <tr>
          <td colSpan={4} className="p-0 overflow-hidden">
            <SessionTable cohort={cohort} />
          </td>
        </tr>
      )}
    </>
  );
};

const CohortsTable = ({ cohorts }) => {
  const activationFee = 25;

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <table className="w-full text-left">
        <thead className="bg-brand-soft-green text-brand-white text-sm">
          <tr>
            <th className="pl-8 pr-6 py-4">Cohort</th>
            <th className="px-6 py-4 hidden sm:table-cell">Program dates</th>
            <th className="pl-2 py-4 hidden sm:table-cell">Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <CohortRow key={c.slug} cohort={c} activationFee={activationFee} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CohortsTable;

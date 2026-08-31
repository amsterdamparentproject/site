"use client";

import { useMemo, useState } from "react";
import { postRequestDirectory } from "@/components/PostToWebhook";
import subscribeToNewsletter from "@/components/Subscribe";
import { updateUserProfile } from "@/app/groups-directory/actions";
import { MONTHS, situationYears } from "@/lib/fyp/situation";
import Link from "@/components/Link";
import { findMatchedSeasonGroup } from "@/lib/season-groups";
import {
  SeasonGroup,
  SeasonGroupExistingProfile,
} from "@/app/types/groups-directory";

// ---------------------------------------------------------------------------
// SeasonGroupSignupForm
//
// Joining a Season Group goes through the *same* pipeline as every other
// Directory category, not a separate one — see
// __claude__/season-groups-join-flow.md for the full reasoning. Two paths:
//
// - No existing Directory profile (no valid app_uid cookie): submits via
//   postRequestDirectory, the exact webhook RequestAccessForm already uses.
//   That workflow hard-requires agreedToTerms === "Yes" (silently no-ops
//   otherwise) and overwrites categories rather than merging them — both
//   fine for a brand-new user.
//
// - Existing Directory profile: submitting through that same webhook would
//   silently wipe their existing interests (the "Update user" node replaces
//   categories rather than merging). So instead this calls updateUserProfile
//   directly with their current categories + "Season" merged in — the same
//   server action the "Update profile" modal in /groups-directory already
//   uses, safely, and instantly (no email round-trip needed).
//
// The stored/matched category is "Season", not "Season Groups": the
// request-access workflow strips the literal word "group(s)" out of every
// category before writing it, so "Season Groups" would silently become
// "Season" on that path anyway. "Season Groups" stays the product name in
// all copy here.
// ---------------------------------------------------------------------------

const labelClass =
  "block text-sm font-medium text-brand-charcoal dark:text-brand-white/80 mb-1";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-brand-sand/60 bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white/80 focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 focus:border-brand-soft-green transition placeholder:text-brand-charcoal/30 dark:placeholder:text-brand-white/30";

const selectClass =
  "w-full px-4 py-2.5 rounded-lg border border-brand-sand/60 bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white/80 focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 focus:border-brand-soft-green transition";

function RequiredMark() {
  return <span className="text-brand-soft-green ml-0.5">*</span>;
}

interface SeasonGroupSignupFormProps {
  seasonGroups: SeasonGroup[];
  existingProfile: SeasonGroupExistingProfile | null;
  initialDueMonth?: string;
  initialDueYear?: string;
  onJoined?: () => void;
}

export default function SeasonGroupSignupForm({
  seasonGroups,
  existingProfile,
  initialDueMonth = "",
  initialDueYear = "",
  onJoined,
}: SeasonGroupSignupFormProps) {
  const years = situationYears();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [dueMonth, setDueMonth] = useState(initialDueMonth);
  const [dueYear, setDueYear] = useState(initialDueYear);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchedGroup = useMemo(
    () => findMatchedSeasonGroup(seasonGroups, dueMonth, dueYear),
    [seasonGroups, dueMonth, dueYear],
  );

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = existingProfile
    ? !!dueMonth && !!dueYear
    : firstName.trim() !== "" && isEmailValid && !!dueMonth && !!dueYear;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    setError(null);

    const monthLabel =
      MONTHS.find((m) => m.value === dueMonth)?.label || dueMonth;
    const notes = matchedGroup
      ? `Due: ${monthLabel} ${dueYear} — matched: ${matchedGroup.name}`
      : `Due: ${monthLabel} ${dueYear} — no matching Season Group yet`;

    try {
      if (existingProfile) {
        // Already a Directory member: merge "Season" into their existing
        // interests rather than routing through the request-access webhook,
        // which would overwrite categories instead of merging them.
        const mergedCategories = existingProfile.categories.includes("Season")
          ? existingProfile.categories
          : [...existingProfile.categories, "Season"];

        const result = await updateUserProfile(
          existingProfile.uid,
          existingProfile.name,
          existingProfile.email,
          mergedCategories,
        );
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
      } else {
        if (subscribeNewsletter) {
          await subscribeToNewsletter({
            email,
            tags: ["website-season-group-request"],
            referringSite: String(window.location),
          });
        }

        const data = new FormData();
        data.append("name", firstName);
        data.append("email", email);
        data.append("categories", "Season");
        data.append("otherInterest", "");
        data.append("notes", notes);
        data.append("subscribeNewsletter", subscribeNewsletter ? "Yes" : "No");
        // Passive consent (see file header) rather than a checkbox — this
        // workflow silently drops the submission if it isn't "Yes".
        data.append("agreedToTerms", "Yes");

        const response = await postRequestDirectory(data);
        if (!response.success) {
          throw new Error(response.error || "Submission failed");
        }
      }

      setIsSuccess(true);
      onJoined?.();
    } catch (err) {
      setError(
        "Something went wrong. Please email hello@amsterdamparentproject.nl instead.",
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full p-10 text-center bg-brand-soft-green border-2 border-brand-soft-green rounded-xl">
        <h2 className="text-2xl font-bold text-brand-goldenrod dark:text-brand-white mb-2">
          You're in!
        </h2>
        {existingProfile ? (
          <>
            <p className="text-brand-white">
              {matchedGroup
                ? `We've added "${matchedGroup.name}" to your Directory.`
                : "We've noted your interest in Season Groups on your Directory profile — we'll match you to one as soon as it's ready."}
            </p>
            <Link
              href="/groups-directory"
              className="mt-4 inline-block bg-white text-brand-soft-green dark:text-brand-charcoal font-bold px-6 py-2.5 rounded-lg hover:brightness-95 transition-all"
            >
              Go to your Directory →
            </Link>
          </>
        ) : (
          <p className="text-brand-white">
            Check your email for your personalized Directory link
            {matchedGroup
              ? ` — "${matchedGroup.name}" will be right there waiting.`
              : "."}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
      {existingProfile ? (
        <p className="text-sm text-brand-charcoal dark:text-brand-white/80 bg-brand-sand/20 rounded-lg px-4 py-2.5">
          Joining as <b>{existingProfile.name || existingProfile.email}</b>.
        </p>
      ) : (
        <>
          <div>
            <label htmlFor="firstName" className={labelClass}>
              Your first name <RequiredMark />
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alex"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Your email <RequiredMark />
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@amsterdamparentproject.nl"
              required
              className={inputClass}
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="due-month" className={labelClass}>
          When is your baby due? <RequiredMark />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select
            id="due-month"
            value={dueMonth}
            onChange={(e) => setDueMonth(e.target.value)}
            required
            className={selectClass}
          >
            <option value="">Month</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={dueYear}
            onChange={(e) => setDueYear(e.target.value)}
            required
            className={selectClass}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {dueMonth && dueYear && (
          <p className="mt-2 text-xs text-brand-soft-charcoal dark:text-brand-sand italic">
            {matchedGroup
              ? `You'll be placed in: ${matchedGroup.name}`
              : "We don't have a Season Group for that month yet — join anyway and we'll place you as soon as one opens."}
          </p>
        )}
      </div>

      {!existingProfile && (
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
            className="mt-1 w-5 h-5 border-brand-sand rounded accent-brand-soft-green"
          />
          <span className="text-sm text-brand-charcoal dark:text-brand-white">
            <b>Also subscribe me to APP's newsletter</b>: a twice-monthly email
            digest of local activities for families with babies and toddlers.
          </span>
        </label>
      )}

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal font-bold text-lg px-6 py-3 rounded-lg transition-all cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Joining…" : "Join your Season Group"}
      </button>

      {!existingProfile && (
        <p className="text-xs text-center text-brand-soft-charcoal dark:text-brand-sand italic">
          By joining, you agree to keep your group link private — the same rule
          that keeps every group in the directory free of spammers.
        </p>
      )}
    </form>
  );
}

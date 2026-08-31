"use client";

import { useState } from "react";
import { postRequestDirectory } from "@/components/PostToWebhook";
import subscribeToNewsletter from "@/components/Subscribe";
import { SeasonGroup } from "@/app/types/groups-directory";

// ---------------------------------------------------------------------------
// SeasonGroupSignupForm
//
// Scoped to exactly one Season Group — the one the visitor clicked "Join"
// on in SeasonGroupsClient. There's no due-date picker in here: the group
// is already chosen by the time this form renders, so all it needs is a
// name and email. See __claude__/season-groups-join-flow.md for the full
// background on the join pipeline this reuses.
//
// This form only ever renders for a first-time visitor (no app_uid
// cookie). An existing Directory member never reaches it — clicking "Join"
// on a card skips the modal entirely: SeasonGroupsClient.handleJoin merges
// "Season" into their profile directly via updateUserProfile and routes
// them straight to their highlighted /groups-directory entry, since there's
// no ambiguity left to resolve once they've clicked a specific card.
//
// Joining a Season Group goes through the *same* pipeline as every other
// Directory category, not a separate one — postRequestDirectory, the exact
// webhook RequestAccessForm already uses. That workflow hard-requires
// agreedToTerms === "Yes" (silently no-ops otherwise) and overwrites
// categories rather than merging them — fine here since this is always a
// brand-new user. Also sends a seasonGroupId field (this group's id) — as
// of 2026-08-31 the n8n workflow doesn't use this yet; it needs a small
// update to append &group=<seasonGroupId> to the emailed Directory link,
// so a new joiner lands on the same highlighted entry the logged-in
// redirect above gives existing members. See
// __claude__/season-groups-join-flow.md.
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

function RequiredMark() {
  return <span className="text-brand-soft-green ml-0.5">*</span>;
}

interface SeasonGroupSignupFormProps {
  group: SeasonGroup;
}

export default function SeasonGroupSignupForm({
  group,
}: SeasonGroupSignupFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = firstName.trim() !== "" && isEmailValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    setError(null);

    try {
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
      data.append(
        "notes",
        `Joining: ${group.name}${group.platform ? ` (${group.platform})` : ""}`,
      );
      data.append("subscribeNewsletter", subscribeNewsletter ? "Yes" : "No");
      // Passive consent (see file header) rather than a checkbox — this
      // workflow silently drops the submission if it isn't "Yes".
      data.append("agreedToTerms", "Yes");
      // New field for the n8n side: the emailed "personalized Directory
      // link" should append &group=<seasonGroupId> so this joiner lands on
      // the same highlighted entry an existing member gets redirected to
      // (see the file header). Unlike the old due-date-matching flow,
      // there's no ambiguity here — this is always the exact group they
      // clicked "Join" on.
      data.append("seasonGroupId", group.id);

      const response = await postRequestDirectory(data);
      if (!response.success) {
        throw new Error(response.error || "Submission failed");
      }

      setIsSuccess(true);
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
          The link is on its way!
        </h2>
        <p className="text-brand-white">
          Check your email for your personalized Directory link — it&apos;ll
          jump straight to &quot;{group.name}&quot; so you can join.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
      <p className="text-sm text-brand-charcoal dark:text-brand-white/80 bg-brand-sand/20 rounded-lg px-4 py-2.5">
        The Season Group links are managed through APP&apos;s Amsterdam Parent
        Groups Directory: 100+ local groups supporting parents in Amsterdam.
      </p>

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

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={subscribeNewsletter}
          onChange={(e) => setSubscribeNewsletter(e.target.checked)}
          className="mt-1 w-5 h-5 border-brand-sand rounded accent-brand-soft-green"
        />
        <span className="text-sm text-brand-charcoal dark:text-brand-white">
          <b>Also subscribe me to APP&apos;s newsletter</b>: a twice-monthly
          email digest of local activities for families with babies and
          toddlers.
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal font-bold text-lg px-6 py-3 rounded-lg transition-all cursor-pointer hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Joining…" : `Join ${group.name}`}
      </button>

      <p className="text-xs text-center text-brand-soft-charcoal dark:text-brand-sand italic">
        By joining, you agree to keep your group link private — the same rule
        that keeps every group in the directory free of spammers.
      </p>
    </form>
  );
}

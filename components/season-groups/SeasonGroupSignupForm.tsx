"use client";

import { useState } from "react";
import { postSeasonGroupSignup } from "@/components/PostToWebhook";
import subscribeToNewsletter from "@/components/Subscribe";
import { MONTHS, situationYears } from "@/lib/fyp/situation";

// ---------------------------------------------------------------------------
// SeasonGroupSignupForm
//
// Season Groups has no dedicated backend yet (no Supabase table, unlike
// First Year Program's `firstyear`) — this follows the same "form -> n8n
// webhook" pattern groups-directory/RequestAccessForm.tsx already uses for
// exactly this situation, via a new postSeasonGroupSignup wrapper
// (PostToWebhook.tsx). Requires N8N_SEASON_GROUP_SIGNUP_WEBHOOK_URL (and
// TEST_N8N_SEASON_GROUP_SIGNUP_WEBHOOK_URL for local/dev) to be configured —
// until then submissions will fail with a "Configuration error".
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

export default function SeasonGroupSignupForm() {
  const years = situationYears();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [dueMonth, setDueMonth] = useState("");
  const [dueYear, setDueYear] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid =
    firstName.trim() !== "" && isEmailValid && !!dueMonth && !!dueYear;

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
      data.append("firstName", firstName);
      data.append("email", email);
      data.append("dueMonth", dueMonth);
      data.append("dueYear", dueYear);
      data.append("subscribeNewsletter", subscribeNewsletter ? "Yes" : "No");

      const response = await postSeasonGroupSignup(data);
      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.error || "Submission failed");
      }
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
        <p className="text-brand-white">
          We'll add you to your Season Group and email you once it's ready to
          say hi.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
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
      </div>

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
    </form>
  );
}

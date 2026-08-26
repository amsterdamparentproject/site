"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { PROGRAM_START } from "@/lib/fyp/program";
import {
  DEPOSIT_EUR,
  BUNDLE_MULTI_EUR,
  BUNDLE_SINGLE_EUR,
  MONTHLY_MULTI_EUR,
  MONTHLY_SINGLE_EUR,
} from "@/lib/fyp/pricing";
import {
  MONTHS,
  deriveSituation,
  isFutureMonthYear,
  situationYears,
  type Situation,
} from "@/lib/fyp/situation";
import FamilyTypeToggle from "@/components/first-year-program/FamilyTypeToggle";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Flow =
  | "expecting_monthly"
  | "expecting_bundle"
  | "baby_deposit"
  | "baby_monthly"
  | "baby_bundle";
type FamilyType = "single" | "multi";

const isBeforeProgramStart = new Date() < PROGRAM_START;

interface Member {
  firstName: string;
  lastName: string;
  email: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Immediate access for all plans on signup — everything except live event
// invites. Confirmed with Alex 2026-08-02: the 2026-07-29 access-model
// simplification (see fyp-plan-access.md) made all 7 resource guides and
// WhatsApp immediate for every plan too, not gated to billing_start_date —
// live events are the only thing still gated. The specific copy for these
// (built inline in the component below, since the partner line and the
// Postpartum Post link both need render-time state/JSX) used to live in a
// standalone "The full program includes" box further down the page —
// redundant with content shown earlier on the page, so Alex had it cut and
// folded into this checklist instead, right before checkout.
const EVENTS_FEATURE = "Invites to this month's events";

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const labelClass =
  "block text-sm font-medium text-brand-charcoal dark:text-brand-white/80 mb-1";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-brand-sand/60 bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white/80 focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 focus:border-brand-soft-green transition placeholder:text-brand-charcoal/30 dark:placeholder:text-brand-white/30";

const selectClass =
  "w-full px-4 py-2.5 rounded-lg border border-brand-sand/60 bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white/80 focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 focus:border-brand-soft-green transition";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function RequiredMark() {
  return <span className="text-brand-soft-green ml-0.5">*</span>;
}

function Checkmark() {
  return (
    <svg
      className="w-4 h-4 text-brand-soft-green dark:text-brand-goldenrod shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Checkout action
// ---------------------------------------------------------------------------

async function startCheckout(
  flow: Flow,
  familyType: FamilyType,
  dueOrBirthMonth: string,
  dueOrBirthYear: string,
  members: Member[],
) {
  const res = await fetch("/api/checkout/fyp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      flow,
      familyType,
      dueOrBirthMonth,
      dueOrBirthYear,
      members,
    }),
  });
  const data = await res.json();
  if (data.url) {
    window.open(data.url, "_blank");
  } else {
    console.error("Checkout error:", data.error);
  }
}

// ---------------------------------------------------------------------------
// PlanCard
// ---------------------------------------------------------------------------

function PlanCard({
  flow,
  icon,
  name,
  price,
  billing,
  badge,
  selected,
  onSelect,
  disabled,
}: {
  flow: Flow;
  icon: string;
  name: string;
  price: string;
  billing: string;
  badge?: string;
  selected: boolean;
  onSelect: (flow: Flow) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(flow)}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 ${
        disabled
          ? "border-brand-sand/30 bg-white/50 dark:bg-brand-charcoal/30 opacity-50 cursor-not-allowed"
          : selected
            ? "border-brand-soft-green bg-brand-soft-green/10 dark:border-brand-goldenrod dark:bg-brand-goldenrod/10 cursor-pointer"
            : "border-brand-sand/60 bg-white dark:bg-brand-charcoal hover:border-brand-soft-green/40 dark:hover:border-brand-soft-green/40 cursor-pointer"
      }`}
    >
      {/* Icon + badge row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {badge && (
          <span className="text-xs font-medium text-brand-soft-green dark:text-brand-goldenrod bg-brand-soft-green/10 dark:bg-brand-goldenrod/10 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <span className="block text-lg font-semibold text-brand-charcoal dark:text-brand-white/90 leading-tight">
        {name}
      </span>
      <span className="block text-sm font-medium text-brand-charcoal dark:text-brand-white/80 mt-0.5 mb-1">
        {price}
      </span>
      <span className="block text-xs text-brand-charcoal/50 dark:text-brand-white/40">
        {billing}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// FYPJoinForm
// ---------------------------------------------------------------------------

interface FYPJoinFormProps {
  // Prefills the sign-up form's name/email — used by the
  // FTP→legacy-transition email's "Register" button. IMPORTANT: these come
  // from a server-side lookup (app/programs/first-year/page.tsx resolves
  // ?legacyId=<ftp_legacy row id> against the DB and passes the resolved
  // fields down through FirstYearProgramClient.tsx as props) — NOT read
  // directly off the URL. An earlier version of this feature put
  // firstName/lastName/email/due date straight into the query string,
  // which Alex correctly flagged as a privacy problem (PII sitting in
  // browser history, server/CDN access logs, analytics tools, and Referer
  // headers on outbound requests from the page). The URL now carries only
  // an opaque uuid — see lib/emails/fyp-legacy-transition.ts's
  // buildJoinUrl and lib/fyp/legacy-prefill.ts's toLegacyPrefill.
  initialFirstName?: string;
  initialLastName?: string;
  initialEmail?: string;
  // Due/birth month+year — lifted up to FirstYearProgramClient so the new
  // SituationSelector (top of "How you experience the program"), the
  // access-today and pricing sections, and this form all read/write the
  // same state instead of each asking separately. FirstYearProgramClient
  // is also where the legacy-prefill due date and the "fall back to today
  // if invalid" logic now live — see lib/fyp/situation.ts's
  // resolveInitialMonthYear.
  month: string;
  year: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}

export default function FYPJoinForm({
  initialFirstName = "",
  initialLastName = "",
  initialEmail = "",
  month,
  year,
  onMonthChange,
  onYearChange,
}: FYPJoinFormProps) {
  const now = new Date();
  const years = situationYears(now);

  const [members, setMembers] = useState<Member[]>([
    {
      firstName: initialFirstName,
      lastName: initialLastName,
      email: initialEmail,
    },
  ]);
  // Family type — local to this form now; the page-level toggle that used
  // to sit above SituationSelector was removed (Alex simplified "How you
  // experience the program" to drop it), so this is the only place a
  // visitor picks it.
  const [isSingleParent, setIsSingleParent] = useState(false);
  // Mirrors onSituationChange()'s own expecting→bundle / baby_here→bundle
  // default, computed once up front from the (possibly prefilled) date
  // above — without this, a prefilled expecting date would render the
  // "expecting" plan cards (situation, below, is derived from month/year)
  // while selectedFlow was still stuck on "baby_bundle", leaving no card
  // showing as selected.
  const [selectedFlow, setSelectedFlow] = useState<Flow>(() =>
    isFutureMonthYear(month, year, now) ? "expecting_bundle" : "baby_bundle",
  );
  const [submitting, setSubmitting] = useState(false);

  // Derive situation from date. When no date selected, default to "expecting".
  const situation: Situation = deriveSituation(month, year);

  function updateMember(idx: number, field: keyof Member, value: string) {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    );
  }

  const familyType: FamilyType = isSingleParent ? "single" : "multi";
  const isMulti = familyType === "multi";

  const hasDate = month !== "" && year !== "";

  const dateTooOld =
    hasDate &&
    (() => {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      const selectedDate = new Date(
        parseInt(year),
        MONTHS.findIndex((m) => m.value === month),
        1,
      );
      return selectedDate < oneYearAgo;
    })();

  // Everyone gets these on signup regardless of timing — the only thing
  // that's actually gated is event invites, which only apply once the
  // program has started for baby-here families (expecting families still
  // wait for their due date, same as before). The partner-access line only
  // makes sense for partnered families — a single parent isn't paying for
  // a second adult's access.
  const immediateFeatures: React.ReactNode[] = [
    ...(isSingleParent
      ? []
      : ["All-inclusive access for you and your partner"]),
    "A private WhatsApp group for local families, moderated by a psychotherapist",
    <>
      Monthly match via{" "}
      <a
        href="https://postpartumpost.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-brand-soft-green dark:hover:text-brand-goldenrod"
      >
        Postpartum Post
      </a>{" "}
      with someone who gets where you are
    </>,
    "All 7 digital resource guides providing evidence-based context for every stage",
  ];
  const features =
    !isBeforeProgramStart && situation === "baby_here"
      ? [...immediateFeatures, EVENTS_FEATURE]
      : immediateFeatures;

  // Reset selected flow to the bundle when situation changes
  function onSituationChange(newSituation: Situation) {
    setSelectedFlow(
      newSituation === "expecting" ? "expecting_bundle" : "baby_bundle",
    );
  }

  // For expecting bundle: if the month after their due date is before PROGRAM_START,
  // sessions still start in September (not earlier).
  const expectingSessionsStart = (() => {
    if (!month || !year) return "the month after your due date";
    const dueIdx = MONTHS.findIndex((m) => m.value === month);
    const dueYear = parseInt(year);
    const billingIdx = (dueIdx + 1) % 12;
    const billingYear = dueIdx + 1 >= 12 ? dueYear + 1 : dueYear;
    const billingDate = new Date(Date.UTC(billingYear, billingIdx, 1));
    return billingDate < PROGRAM_START
      ? "September 2026"
      : "the month after your due date";
  })();

  const submitLabel = submitting ? "Redirecting…" : "Sign up →";

  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const selectedDate = new Date(
      parseInt(year),
      MONTHS.findIndex((m) => m.value === month),
      1,
    );
    if (selectedDate < oneYearAgo) {
      setValidationError(
        "Our program is for families with babies born in the last year. Contact us if your baby is older.",
      );
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    await startCheckout(selectedFlow, familyType, month, year, members);
    setSubmitting(false);
  }

  return (
    <section id="join" className="scroll-mt-20 md:scroll-mt-32 w-full">
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm p-8 space-y-6"
        >
          {/* Logo + header inside the white card */}
          <div className="flex flex-col items-center pb-2">
            <Logo size="52" style="mb-3" />
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-goldenrod text-center">
              Join the First Year Program
            </h2>
            <p className="text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 italic text-center mt-1 max-w-sm">
              Open to families from pregnancy through your baby&apos;s first
              year. Program starts September 2026.
            </p>
          </div>

          <hr />

          {/* ── Member fields ── */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label htmlFor="first-name" className={labelClass}>
                  First name <RequiredMark />
                </label>
                <input
                  id="first-name"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={members[0].firstName}
                  onChange={(e) => updateMember(0, "firstName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="last-name" className={labelClass}>
                  Last name <RequiredMark />
                </label>
                <input
                  id="last-name"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={members[0].lastName}
                  onChange={(e) => updateMember(0, "lastName", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email <RequiredMark />
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={members[0].email}
                onChange={(e) => updateMember(0, "email", e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Family structure toggle */}
            <div className="mt-4">
              <FamilyTypeToggle
                isSingleParent={isSingleParent}
                onChange={setIsSingleParent}
                hint
              />
            </div>
          </div>

          <hr />

          {/* ── Due date / birthday ── */}
          <div>
            <label htmlFor="due-month" className={labelClass}>
              When is your baby due — or if they&apos;re here, their birthday?{" "}
              <RequiredMark />
            </label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <select
                id="due-month"
                value={month}
                onChange={(e) => {
                  const newMonth = e.target.value;
                  onMonthChange(newMonth);
                  if (newMonth && year) {
                    onSituationChange(
                      isFutureMonthYear(newMonth, year)
                        ? "expecting"
                        : "baby_here",
                    );
                  }
                }}
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
                value={year}
                onChange={(e) => {
                  const newYear = e.target.value;
                  onYearChange(newYear);
                  if (month && newYear) {
                    onSituationChange(
                      isFutureMonthYear(month, newYear)
                        ? "expecting"
                        : "baby_here",
                    );
                  }
                }}
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
            {dateTooOld && (
              <p className="mt-2 italic text-xs text-red-500 dark:text-red-400">
                Our program is for families with babies born in the last year.{" "}
                <a
                  href="mailto:hello@amsterdamparentproject.nl"
                  className="underline"
                >
                  Contact us
                </a>{" "}
                if your baby is older.
              </p>
            )}
          </div>

          <hr />

          {/* ── Plan cards — always shown, disabled until form is complete ── */}
          <div>
            <p className={labelClass}>Choose your plan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {situation === "expecting" ? (
                <>
                  <PlanCard
                    flow="expecting_monthly"
                    icon="📅"
                    name="Monthly"
                    price={
                      isMulti
                        ? `€${DEPOSIT_EUR} deposit, then €${MONTHLY_MULTI_EUR}/month`
                        : `€${DEPOSIT_EUR} deposit, then €${MONTHLY_SINGLE_EUR}/month`
                    }
                    billing={
                      expectingSessionsStart === "September 2026"
                        ? "Monthly billing begins September 2026"
                        : "Monthly billing begins after your due date"
                    }
                    selected={selectedFlow === "expecting_monthly"}
                    onSelect={setSelectedFlow}
                    disabled={false}
                  />
                  <PlanCard
                    flow="expecting_bundle"
                    icon="📦"
                    name="6-month bundle"
                    price={
                      isMulti ? `€${BUNDLE_MULTI_EUR}` : `€${BUNDLE_SINGLE_EUR}`
                    }
                    billing={`Billed today · Save €${DEPOSIT_EUR}`}
                    badge="Best value"
                    selected={selectedFlow === "expecting_bundle"}
                    onSelect={setSelectedFlow}
                    disabled={false}
                  />
                </>
              ) : (
                <>
                  {isBeforeProgramStart ? (
                    <PlanCard
                      flow="baby_deposit"
                      icon="📅"
                      name="Monthly"
                      price={
                        isMulti
                          ? `€${DEPOSIT_EUR} deposit, then €${MONTHLY_MULTI_EUR}/month`
                          : `€${DEPOSIT_EUR} deposit, then €${MONTHLY_SINGLE_EUR}/month`
                      }
                      billing="Monthly billing starts September 2026"
                      selected={selectedFlow === "baby_deposit"}
                      onSelect={setSelectedFlow}
                      disabled={false}
                    />
                  ) : (
                    <PlanCard
                      flow="baby_monthly"
                      icon="📅"
                      name="Monthly"
                      price={
                        isMulti
                          ? `€${MONTHLY_MULTI_EUR}/month`
                          : `€${MONTHLY_SINGLE_EUR}/month`
                      }
                      billing="Billed monthly · Cancel anytime"
                      selected={selectedFlow === "baby_monthly"}
                      onSelect={setSelectedFlow}
                      disabled={false}
                    />
                  )}
                  <PlanCard
                    flow="baby_bundle"
                    icon="📦"
                    name="6-month bundle"
                    price={
                      isMulti ? `€${BUNDLE_MULTI_EUR}` : `€${BUNDLE_SINGLE_EUR}`
                    }
                    billing={`Billed today · Save €${DEPOSIT_EUR}`}
                    badge="Best value"
                    selected={selectedFlow === "baby_bundle"}
                    onSelect={setSelectedFlow}
                    disabled={false}
                  />
                </>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              data-umami-event={
                selectedFlow?.includes("bundle")
                  ? `First Year Program: Join ${situation === "expecting" ? "expecting" : "baby"} bundle`
                  : `First Year Program: Join ${situation === "expecting" ? "expecting" : "baby"} monthly`
              }
              className="mt-4 w-full py-3 rounded-lg font-semibold text-white bg-brand-soft-green hover:bg-brand-soft-green/90 dark:bg-brand-goldenrod dark:hover:bg-brand-goldenrod/90 dark:text-brand-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitLabel}
            </button>

            {selectedFlow !== "baby_monthly" && (
              <p className="mt-2 text-xs text-brand-charcoal/50 dark:text-brand-white/40 text-center">
                {selectedFlow === "expecting_monthly" ||
                selectedFlow === "baby_deposit"
                  ? "Deposit credited to your first monthly invoice · "
                  : ""}
                Fully refundable during pregnancy or before September 1.
              </p>
            )}

            {validationError && (
              <p className="mt-3 text-sm text-red-500 dark:text-red-400">
                {validationError}
              </p>
            )}

            {/* Feature list */}
            <p className="mt-5 text-sm font-medium text-brand-charcoal dark:text-brand-white/80">
              You immediately get:
            </p>
            <ul className="mt-2 space-y-2">
              {features.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs text-brand-charcoal dark:text-brand-white/70"
                >
                  <Checkmark />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </form>

        <p className="text-center text-xs text-brand-charcoal/50 dark:text-brand-white/50 mt-6 max-w-md mx-auto leading-normal">
          Questions or need financial support?{" "}
          <a
            href="mailto:hello@amsterdamparentproject.nl"
            className="text-brand-soft-green hover:text-brand-goldenrod dark:text-brand-goldenrod dark:hover:text-brand-white/80"
          >
            Email us
          </a>{" "}
          — we&apos;re here to help!
        </p>
      </div>
    </section>
  );
}

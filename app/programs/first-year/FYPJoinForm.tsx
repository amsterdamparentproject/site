"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import { PROGRAM_START } from "@/lib/fyp/program";

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
type Situation = "expecting" | "baby_here";

const isBeforeProgramStart = new Date() < PROGRAM_START;

interface Member {
  firstName: string;
  lastName: string;
  email: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTHS = [
  { label: "January", value: "jan" },
  { label: "February", value: "feb" },
  { label: "March", value: "mar" },
  { label: "April", value: "apr" },
  { label: "May", value: "may" },
  { label: "June", value: "jun" },
  { label: "July", value: "jul" },
  { label: "August", value: "aug" },
  { label: "September", value: "sep" },
  { label: "October", value: "oct" },
  { label: "November", value: "nov" },
  { label: "December", value: "dec" },
];

// Immediate access for all plans on signup
const IMMEDIATE_FEATURES = [
  "Access to our parent matching platform",
  "Understanding the Village guide",
];

// Full access from billing_start_date (September 2026 or month after due date)
const FULL_FEATURES = [
  "Access to our parent matching platform",
  "Private WhatsApp community access",
  "All 7 resource guides",
  "Invites to this month's events",
];

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
  description,
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
  description?: string;
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
      {description && (
        <span className="block text-sm text-brand-charcoal/60 dark:text-brand-white/50 leading-relaxed mt-2">
          {description}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// FYPJoinForm
// ---------------------------------------------------------------------------

export default function FYPJoinForm() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [members, setMembers] = useState<Member[]>([
    { firstName: "", lastName: "", email: "" },
  ]);
  const [isSingleParent, setIsSingleParent] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<Flow>("expecting_bundle");
  const [submitting, setSubmitting] = useState(false);

  function setFamilyStructure(single: boolean) {
    setIsSingleParent(single);
  }

  const currentYear = new Date().getFullYear();
  const years = [
    String(currentYear - 1),
    String(currentYear),
    String(currentYear + 1),
  ];

  // Derive situation from date. When no date selected, default to "expecting".
  const situation: Situation = (() => {
    if (!month || !year) return "expecting";
    const now = new Date();
    const yearNum = parseInt(year);
    const monthIdx = MONTHS.findIndex((m) => m.value === month);
    const isFuture =
      yearNum > now.getFullYear() ||
      (yearNum === now.getFullYear() && monthIdx > now.getMonth());
    return isFuture ? "expecting" : "baby_here";
  })();

  function updateMember(idx: number, field: keyof Member, value: string) {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    );
  }

  const familyType: FamilyType = isSingleParent ? "single" : "multi";
  const isMulti = familyType === "multi";

  const allMembersFilled = members.every(
    (m) =>
      m.firstName.trim() &&
      m.lastName.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email),
  );

  const hasDate = month !== "" && year !== "";

  const canCheckout = hasDate && allMembersFilled;

  // Before program start everyone gets immediate features only (full guides unlock on billing_start_date).
  // After program start, baby families get full access immediately; expecting families still unlock on due date.
  const features =
    !isBeforeProgramStart && situation === "baby_here"
      ? FULL_FEATURES
      : IMMEDIATE_FEATURES;

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

  const submitLabel = (() => {
    if (submitting) return "Redirecting…";
    if (selectedFlow === "baby_deposit" || selectedFlow === "expecting_monthly")
      return "Reserve your spot →";
    return "Sign up →";
  })();

  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!allMembersFilled) {
      setValidationError(
        "Please fill in your name and email before continuing.",
      );
      return;
    }
    if (!hasDate) {
      setValidationError(
        "Please enter your due date or baby's birthday before continuing.",
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
        <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm p-8 space-y-6">
          {/* Logo + header inside the white card */}
          <div className="flex flex-col items-center pb-2">
            <Logo size="52" style="mb-3" />
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-goldenrod text-center">
              Join the First Year Program
            </h2>
            <p className="text-sm text-brand-soft-charcoal/70 dark:text-brand-white/60 italic text-center mt-1 max-w-sm">
              Open to families from pregnancy through your baby&apos;s first
              year. Live sessions start September 2026.
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
                value={members[0].email}
                onChange={(e) => updateMember(0, "email", e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Family structure toggle */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(
                [
                  { label: "I have a partner", single: false },
                  { label: "I am a single parent", single: true },
                ] as const
              ).map(({ label, single }) => {
                const active = isSingleParent === single;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFamilyStructure(single)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 ${
                      active
                        ? "border-brand-soft-green bg-brand-soft-green/10 text-brand-soft-green dark:text-brand-goldenrod dark:border-brand-goldenrod dark:bg-brand-goldenrod/10"
                        : "border-brand-sand/60 text-brand-charcoal/60 dark:text-brand-white/40 hover:border-brand-charcoal/30 dark:hover:border-brand-white/30"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {isSingleParent ? (
              <p className="mt-2 text-xs text-brand-charcoal/50 dark:text-brand-white/40">
                We offer a discount to ensure everyone can access support,
                regardless of family structure.
              </p>
            ) : (
              <p className="mt-2 text-xs text-brand-charcoal/50 dark:text-brand-white/40">
                After sign up, you can add your partner(s) to the subscription
                from your profile.
              </p>
            )}
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
                  setMonth(e.target.value);
                  if (e.target.value && year) {
                    const now = new Date();
                    const yearNum = parseInt(year);
                    const monthIdx = MONTHS.findIndex(
                      (m) => m.value === e.target.value,
                    );
                    const isFuture =
                      yearNum > now.getFullYear() ||
                      (yearNum === now.getFullYear() &&
                        monthIdx > now.getMonth());
                    onSituationChange(isFuture ? "expecting" : "baby_here");
                  }
                }}
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
                  setYear(e.target.value);
                  if (month && e.target.value) {
                    const now = new Date();
                    const yearNum = parseInt(e.target.value);
                    const monthIdx = MONTHS.findIndex((m) => m.value === month);
                    const isFuture =
                      yearNum > now.getFullYear() ||
                      (yearNum === now.getFullYear() &&
                        monthIdx > now.getMonth());
                    onSituationChange(isFuture ? "expecting" : "baby_here");
                  }
                }}
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

          <hr />

          {/* ── Plan cards — always shown, disabled until form is complete ── */}
          <div>
            <p className={labelClass}>Choose your plan</p>
            <div className="space-y-3 mt-2">
              {situation === "expecting" ? (
                <>
                  <PlanCard
                    flow="expecting_bundle"
                    icon="📦"
                    name="6-month bundle"
                    price={isMulti ? "€383" : "€305"}
                    billing={
                      isBeforeProgramStart
                        ? "Billed today · Starts September 2026"
                        : "Billed today · save €25"
                    }
                    description={
                      isBeforeProgramStart
                        ? `The program begins ${expectingSessionsStart}. Fully refundable during pregnancy or before September 1.`
                        : "Access begins after your due date. Fully refundable during pregnancy or before September 1."
                    }
                    badge="Save €25"
                    selected={selectedFlow === "expecting_bundle"}
                    onSelect={setSelectedFlow}
                    disabled={false}
                  />
                  <PlanCard
                    flow="expecting_monthly"
                    icon="📅"
                    name="Monthly plan"
                    price={
                      isMulti
                        ? "€25 deposit, then €68/month"
                        : "€25 deposit, then €55/month"
                    }
                    billing={
                      expectingSessionsStart === "in September 2026"
                        ? "Reserve your spot · Monthly billing starts September 2026"
                        : "Billing begins after your due date"
                    }
                    description="Deposit is credited to your first month. Fully refundable during pregnancy or before September 1."
                    selected={selectedFlow === "expecting_monthly"}
                    onSelect={setSelectedFlow}
                    disabled={false}
                  />
                </>
              ) : (
                <>
                  <PlanCard
                    flow="baby_bundle"
                    icon="📦"
                    name="6-month bundle"
                    price={isMulti ? "€383" : "€305"}
                    billing={
                      isBeforeProgramStart
                        ? "Billed today · Starts September 2026"
                        : "Billed today · save €25"
                    }
                    description={
                      isBeforeProgramStart
                        ? "The program begins September 2026. Fully refundable during pregnancy or before September 1."
                        : undefined
                    }
                    badge="Save €25"
                    selected={selectedFlow === "baby_bundle"}
                    onSelect={setSelectedFlow}
                    disabled={false}
                  />
                  {isBeforeProgramStart ? (
                    <PlanCard
                      flow="baby_deposit"
                      icon="📅"
                      name="Monthly plan"
                      price={
                        isMulti
                          ? "€25 deposit, then €68/month"
                          : "€25 deposit, then €55/month"
                      }
                      billing="Reserve your spot · Monthly billing starts September 2026"
                      description="Deposit is credited to your first invoice. Fully refundable during pregnancy or before September 1."
                      selected={selectedFlow === "baby_deposit"}
                      onSelect={setSelectedFlow}
                      disabled={false}
                    />
                  ) : (
                    <PlanCard
                      flow="baby_monthly"
                      icon="📅"
                      name="Monthly plan"
                      price={isMulti ? "€68/month" : "€55/month"}
                      billing="Billed monthly · cancel anytime"
                      selected={selectedFlow === "baby_monthly"}
                      onSelect={setSelectedFlow}
                      disabled={false}
                    />
                  )}
                </>
              )}
            </div>

            {/* Validation error */}
            {validationError && (
              <p className="mt-3 text-sm text-red-500 dark:text-red-400">
                {validationError}
              </p>
            )}

            {/* Submit button */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              data-umami-event={
                selectedFlow?.includes("bundle")
                  ? `First Year Program: Enroll ${situation === "expecting" ? "expecting" : "baby"} bundle`
                  : `First Year Program: Enroll ${situation === "expecting" ? "expecting" : "baby"} monthly`
              }
              className="mt-4 w-full py-3 rounded-lg font-semibold text-sm text-white bg-brand-soft-green hover:bg-brand-soft-green/90 dark:bg-brand-goldenrod dark:hover:bg-brand-goldenrod/90 dark:text-brand-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitLabel}
            </button>

            {/* Feature list */}
            <p className="mt-5 text-sm font-medium text-brand-charcoal dark:text-brand-white/80">
              This is what you immediately get after signing up:
            </p>
            <ul className="mt-2 space-y-2">
              {features.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs text-brand-charcoal dark:text-brand-white/70"
                >
                  <Checkmark />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

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

"use client";

import { useTransition } from "react";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import CancelSubscriptionButton from "@/app/hub/account/CancelSubscriptionButton";
import { getFypCustomerPortalUrl } from "@/app/hub/account/actions";

// Billing tab — plan/status/dates read straight from firstyear.accounts
// (no per-transaction Stripe data beyond the portal link; "next billing
// date" isn't shown since FYP doesn't expose it the way PP does — see
// fyp-hub-plan.md § /hub/account (MVP)). Styled to mirror PP's billing
// card: status row, dates, an <hr>, then a full-width bordered "Manage
// billing" button and a small text-xs "Cancel subscription" link below it.

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "Bundle - Single parent" / "Bundle - Multi-parent" (and same for
// Monthly) — planType alone doesn't distinguish the family-structure
// discount tier chosen at signup (see FYPJoinForm's "I have a partner" /
// "I am a single parent" toggle, stored as accounts.family_type), so
// surface both together rather than just the plan.
function planLabel(planType: string, familyType: string): string {
  const plan = planType.charAt(0).toUpperCase() + planType.slice(1);
  const family = familyType === "single" ? "Single parent" : "Multi-parent";
  return `${plan} - ${family}`;
}

// Mirrors PP's billing-tab status pill styling (text-xs rounded-full
// px-2.5 py-0.5) — FYP's own status lifecycle is simpler than PP's
// Stripe-subscription-status set (active | canceling | canceled, see
// lib/fyp/subscription.ts), so only those three are mapped here.
const STATUS_PILL: Record<
  string,
  { label: string; className: string; title?: string }
> = {
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  canceling: {
    label: "Canceling",
    className: "bg-yellow-100 text-yellow-700",
    title: "Active through the end of the current billing period",
  },
  canceled: { label: "Canceled", className: "bg-gray-100 text-gray-500" },
};

const EXPECTING_COPY =
  "While you're expecting, enjoy free access to Postpartum Post and the resource guides. You'll be invited to the live sessions the month after your baby is due!";

const BABY_COPY =
  "Your membership includes free access to Postpartum Post, live expert sessions and resource guides, in-person socials, and our program's moderated WhatsApp group.";

export default function HubAccountBillingPage() {
  const { member, refetch, accessToken } = useHubAccount();
  const [isPortalPending, startPortalTransition] = useTransition();

  if (!member) return null;

  const billingStartDate = formatDate(member.billingStartDate);
  const bundleExpiresAt = formatDate(member.bundleExpiresAt);
  const signedUpAt = formatDate(member.signedUpAt);
  const benefitsCopy = member.flow.startsWith("expecting")
    ? EXPECTING_COPY
    : BABY_COPY;
  const statusPill = STATUS_PILL[member.accountStatus] ?? {
    label: member.accountStatus,
    className: "bg-gray-100 text-gray-500",
  };

  function handleManageBilling() {
    if (!member?.stripeCustomerId) return;
    startPortalTransition(async () => {
      const url = await getFypCustomerPortalUrl(accessToken ?? "");
      window.location.href = url;
    });
  }

  return (
    <div className="max-w-lg">
      <section className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-brand-charcoal dark:text-brand-white">
          Plan &amp; billing
        </h2>
        <dl className="text-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <dt className="text-brand-charcoal/60 dark:text-brand-white/50">
              Status
            </dt>
            <dd>
              <span
                title={statusPill.title}
                className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${statusPill.className}`}
              >
                {statusPill.label}
              </span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-charcoal/60 dark:text-brand-white/50">
              Plan
            </dt>
            <dd className="text-brand-charcoal dark:text-brand-white font-medium">
              {planLabel(member.planType, member.familyType)}
            </dd>
          </div>
          {signedUpAt && (
            <div className="flex justify-between">
              <dt className="text-brand-charcoal/60 dark:text-brand-white/50">
                Sign up date
              </dt>
              <dd className="text-brand-charcoal dark:text-brand-white font-medium">
                {signedUpAt}
              </dd>
            </div>
          )}
          {billingStartDate && (
            <div className="flex justify-between">
              <dt className="text-brand-charcoal/60 dark:text-brand-white/50">
                Program start
              </dt>
              <dd className="text-brand-charcoal dark:text-brand-white font-medium">
                {billingStartDate}
              </dd>
            </div>
          )}
          {member.planType === "bundle" && bundleExpiresAt && (
            <div className="flex justify-between">
              <dt className="text-brand-charcoal/60 dark:text-brand-white/50">
                Bundle expires
              </dt>
              <dd className="text-brand-charcoal dark:text-brand-white font-medium">
                {bundleExpiresAt}
              </dd>
            </div>
          )}
        </dl>

        <hr className="mt-6 border-brand-sand/60" />

        <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/60">
          {benefitsCopy}
        </p>

        {member.stripeCustomerId && (
          <button
            type="button"
            onClick={handleManageBilling}
            disabled={isPortalPending}
            data-umami-event="Hub: Manage billing"
            className="w-full py-2 px-4 text-sm border border-brand-sand/60 rounded-lg text-brand-charcoal dark:text-brand-white hover:border-brand-soft-green hover:text-brand-soft-green dark:hover:border-brand-goldenrod dark:hover:text-brand-goldenrod transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPortalPending ? "Redirecting…" : "Manage billing →"}
          </button>
        )}

        {member.accountStatus === "active" && (
          <div className="text-center">
            <CancelSubscriptionButton
              planType={member.planType}
              onCanceled={refetch}
            />
          </div>
        )}
      </section>
    </div>
  );
}

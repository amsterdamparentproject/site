"use client";

import { useState, useTransition } from "react";
import { cancelFypSubscription } from "@/app/hub/account/actions";
import { useHubAccount } from "@/app/hub/HubAccountContext";

// RECONSTRUCTED (2026-07-22) — the original of this file was accidentally
// deleted along with the rest of app/hub/account/ and, unlike its
// siblings, its exact source wasn't captured anywhere in the conversation
// this was rebuilt from. This version is written from scratch to match how
// billing/page.tsx calls it (accountId, planType, onCanceled) and
// lib/fyp/subscription.ts's cancelFypAccount() semantics — worth a quick
// sanity check against what was there before, if that matters.
//
// Mirrors MemberCard's inline confirm-then-act pattern (a small text-xs
// trigger that expands into a bordered confirm block) rather than a modal.
// cancelFypAccount() always lands the account in "canceling", not an
// immediate loss of access — monthly plans keep access through the current
// Stripe billing period (cancel_at_period_end), bundle plans keep access
// through their fixed term (DB-only, no Stripe subscription to update) — so
// the copy below is deliberately the same for both rather than claiming an
// immediate cutoff.

export default function CancelSubscriptionButton({
  planType,
  onCanceled,
}: {
  planType: string;
  onCanceled: () => Promise<void>;
}) {
  const { accessToken } = useHubAccount();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await cancelFypSubscription(accessToken ?? "");
      if (!result.success) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      await onCanceled();
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        data-umami-event="Hub: Cancel subscription"
        className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
      >
        Cancel subscription
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 dark:border-red-400/40 bg-red-50 dark:bg-red-950/20 p-4 space-y-2 text-left">
      <p className="text-sm text-brand-charcoal dark:text-brand-white font-medium">
        Cancel your First Year Program{" "}
        {planType === "bundle" ? "bundle" : "subscription"}?
      </p>
      <p className="text-xs text-brand-charcoal/70 dark:text-brand-white/60">
        You&apos;ll keep access through the end of your current{" "}
        {planType === "bundle" ? "bundle term" : "billing period"} — this
        can&apos;t be undone after that.
      </p>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          data-umami-event="Hub: Confirm cancel subscription"
          className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-500/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? "Canceling…" : "Yes, cancel"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs px-3 py-1.5 rounded-lg border border-brand-sand/60 text-brand-charcoal/70 dark:text-brand-white/60 hover:text-brand-charcoal dark:hover:text-brand-white transition-colors cursor-pointer"
        >
          Never mind
        </button>
      </div>
    </div>
  );
}

// Statuses that keep Hub access. Mirrors the status lifecycle in
// lib/fyp/subscription.ts: active -> canceling -> canceled. "canceling" is
// set immediately by the Cancel button but still has real access through
// the end of the current billing period / bundle term (the webhook, or the
// bundle-cancellation sweep, is what eventually flips it to "canceled") —
// so it must keep Hub access same as "active", not just "canceled" losing it.
export function hasHubAccess(status: string): boolean {
  return status === "active" || status === "canceling";
}

// Statuses that keep Hub access. Mirrors the status lifecycle in
// lib/fyp/subscription.ts: active -> canceling -> canceled. "canceling" is
// set immediately by the Cancel button but still has real access through
// the end of the current billing period / bundle term (the webhook, or the
// bundle-cancellation sweep, is what eventually flips it to "canceled") —
// so it must keep Hub access same as "active", not just "canceled" losing it.
export function hasHubAccess(status: string): boolean {
  return status === "active" || status === "canceling";
}

// Non-'member' roles (facilitator, admin — see migration 011) are staff, not
// customers: their Hub access is never tied to accountStatus at all, since
// the placeholder/real account their members row happens to hang off of
// isn't a real subscription in the sense hasHubAccess() cares about. Checked
// wherever hasHubAccess() previously stood alone as the sole gate.
export function isStaffRole(role: string): boolean {
  return role === "facilitator" || role === "admin";
}

// Combined check for "does this member get into the Hub at all" — staff
// roles always pass; regular members fall back to the existing
// status-based hasHubAccess().
export function hasAnyHubAccess(role: string, status: string): boolean {
  return isStaffRole(role) || hasHubAccess(status);
}

// Of the two staff roles, only 'facilitator' gets the reduced Hub nav
// (Home + Resources, no Account/Billing) — added 2026-07-29 alongside the
// Home tab. 'admin' is staff for hasAnyHubAccess's purposes (no real
// subscription) but otherwise sees the full member nav, since Alex is both
// staff and the person who needs to check Account/Billing views. Checked in
// HubAccountTabNav (which tabs render) and the (account) layout (which
// routes staff get force-redirected away from).
export function isLimitedStaffRole(role: string): boolean {
  return role === "facilitator";
}

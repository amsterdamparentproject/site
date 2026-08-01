// Pure decision helpers behind the Hub's two account-status banners
// (app/hub/(account)/layout.tsx's "Live events start..." banner and
// app/hub/(account)/home/page.tsx's Events calendar card) — extracted so
// they're unit-testable directly, same reasoning as
// app/hub/account/postpartum-post-banner.ts (see that file's own docs):
// no React component-render test infra in this repo yet, and these are
// simple enough to be worth testing in isolation from Supabase/context
// wiring.

/**
 * Whether this member's program access has actually started — gated on
 * billing_start_date rather than accountStatus, since bundle accounts flip
 * to "active" immediately at checkout even when their billing_start_date is
 * still months out (see the webhook's expecting_bundle/baby_bundle
 * branches). A null billing_start_date (e.g. a still-`pending` account
 * before the webhook fires) also counts as not-yet-started.
 *
 * `now` is injectable (defaults to `new Date()`) so callers/tests don't need
 * to fake the system clock.
 */
export function hasEventsStarted(
  billingStartDate: string | null,
  now: Date = new Date(),
): boolean {
  return !!billingStartDate && new Date(billingStartDate) <= now;
}

/**
 * "Live events start September 2026" rather than a full date — the banner
 * is about setting expectations, not precision. Falls back to a generic
 * "soon" if billing_start_date somehow isn't set, so the sentence never
 * renders broken.
 */
export function formatEventsStart(billingStartDate: string | null): string {
  if (!billingStartDate) return "soon";
  return new Date(billingStartDate).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Month-only variant for the Events calendar card's "Starting in [month]"
 * button — the card is small, so no year (unlike formatEventsStart's fuller
 * banner copy). Only ever called once billing_start_date is known to be
 * non-null at the call site.
 */
export function formatStartMonth(billingStartDate: string): string {
  return new Date(billingStartDate).toLocaleDateString("en-GB", {
    month: "long",
  });
}

export type WelcomeBannerVariant = "multi" | "single";

/**
 * Which welcome-banner copy/CTA a member gets (app/hub/(account)/layout.tsx's
 * WelcomeBanner) — multi-parent families are nudged to the Account tab to
 * add their partner, everyone else (single-parent accounts, or any
 * unrecognized value) gets the WhatsApp-group nudge instead. Mirrors
 * billing/page.tsx's own familyType handling (anything not exactly
 * "single"/"multi" falls back to the more inclusive "multi-parent" default
 * there; here the fallback is the opposite direction — single — since
 * there's no group/family-size implication either way, just "don't assume
 * there's a partner to add if we don't recognize the value").
 */
export function getWelcomeBannerVariant(
  familyType: string,
): WelcomeBannerVariant {
  return familyType === "multi" ? "multi" : "single";
}

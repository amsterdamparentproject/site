export type PostpartumPostBannerState = {
  text: string;
  disabled: boolean;
  title: string | undefined;
  trackEvent: string | undefined;
  // Generic, name-free status for a sibling's card (see MemberCard's
  // !isSelf banner) — swapped in below sm on a narrow status strip where
  // "<Name> has/hasn't activated Postpartum Post yet" wraps awkwardly.
  // `title`'s fuller, name-bearing phrasing is still used at sm and up.
  shortStatus: string;
};

/**
 * Decides MemberCard's PP banner text/disabled/title/tracking — kept as a
 * standalone, dependency-free pure function (rather than defined inline in
 * MemberCard.tsx) so it's unit-testable without transitively importing
 * MemberCard's Supabase/server-action dependencies just to exercise this
 * decision. See __tests__/utils/postpartumPostBanner.test.ts.
 *
 * Postpartum Post is an individual, personal account (health/postpartum
 * data, not shared family info) — signing someone else in or activating on
 * their behalf, just because they share this FYP account's billing, would
 * leak one member's personal PP session to another. So the banner is only
 * ever clickable for the signed-in member's own card (isSelf); for a
 * sibling's card it shows the exact same text (so a partner can see at a
 * glance whether the other has activated theirs yet) but disabled, with no
 * handler wired up — purely informational, never a way to act on someone
 * else's PP account.
 */
export function getPostpartumPostBannerState({
  isPpActive,
  isSelf,
  isPending,
  firstName,
}: {
  isPpActive: boolean;
  isSelf: boolean;
  isPending: boolean;
  firstName: string;
}): PostpartumPostBannerState {
  if (isPpActive) {
    return {
      text: isSelf && isPending ? "Signing you in…" : "Go to Postpartum Post",
      disabled: !isSelf || isPending,
      title: isSelf ? undefined : `${firstName} has activated Postpartum Post`,
      trackEvent: isSelf ? "Hub: Go to Postpartum Post" : undefined,
      shortStatus: "Postpartum Post activated",
    };
  }

  return {
    text: isSelf && isPending ? "Activating…" : "Activate Postpartum Post",
    disabled: !isSelf || isPending,
    title: isSelf
      ? undefined
      : `${firstName} hasn't activated Postpartum Post yet`,
    trackEvent: isSelf ? "Hub: Activate Postpartum Post" : undefined,
    shortStatus: "Postpartum Post not yet activated",
  };
}

/**
 * getPostpartumPostBannerState() — MemberCard's Postpartum Post banner
 * text/disabled/title/tracking decision (app/hub/account/postpartum-post-banner.ts)
 *
 * Extracted as a pure function so this can be tested directly, without
 * rendering MemberCard (no React component-render test infra in this repo
 * yet) and without transitively importing its Supabase/server-action
 * dependencies.
 *
 * Covers the fix for a real bug (2026-07-24): the banner used to be
 * clickable on any family member's card, letting one FYP member activate
 * or sign into another's personal Postpartum Post account. The self/sibling
 * split below is the regression coverage for that.
 */

import { describe, it, expect } from "vitest";
import { getPostpartumPostBannerState } from "@/app/hub/account/postpartum-post-banner";

describe("getPostpartumPostBannerState", () => {
  describe("signed-in member's own card (isSelf: true)", () => {
    it("is clickable, showing 'Activate Postpartum Post' when not yet linked", () => {
      const state = getPostpartumPostBannerState({
        isPpActive: false,
        isSelf: true,
        isPending: false,
        firstName: "Jane",
      });
      expect(state.text).toBe("Activate Postpartum Post");
      expect(state.disabled).toBe(false);
      expect(state.title).toBeUndefined();
      expect(state.trackEvent).toBe("Hub: Activate Postpartum Post");
    });

    it("shows 'Activating…' and disables while the activation request is pending", () => {
      const state = getPostpartumPostBannerState({
        isPpActive: false,
        isSelf: true,
        isPending: true,
        firstName: "Jane",
      });
      expect(state.text).toBe("Activating…");
      expect(state.disabled).toBe(true);
    });

    it("is clickable, showing 'Go to Postpartum Post' once linked", () => {
      const state = getPostpartumPostBannerState({
        isPpActive: true,
        isSelf: true,
        isPending: false,
        firstName: "Jane",
      });
      expect(state.text).toBe("Go to Postpartum Post");
      expect(state.disabled).toBe(false);
      expect(state.title).toBeUndefined();
      expect(state.trackEvent).toBe("Hub: Go to Postpartum Post");
    });

    it("shows 'Signing you in…' and disables while the sign-in link request is pending", () => {
      const state = getPostpartumPostBannerState({
        isPpActive: true,
        isSelf: true,
        isPending: true,
        firstName: "Jane",
      });
      expect(state.text).toBe("Signing you in…");
      expect(state.disabled).toBe(true);
    });
  });

  describe("another family member's card (isSelf: false)", () => {
    it("shows 'Activate Postpartum Post' disabled, with an explanatory title, when they haven't linked yet", () => {
      const state = getPostpartumPostBannerState({
        isPpActive: false,
        isSelf: false,
        isPending: false,
        firstName: "Sam",
      });
      expect(state.text).toBe("Activate Postpartum Post");
      expect(state.disabled).toBe(true);
      expect(state.title).toBe("Sam hasn't activated Postpartum Post yet");
      expect(state.trackEvent).toBeUndefined();
    });

    it("shows 'Go to Postpartum Post' disabled, with an explanatory title, once they've linked", () => {
      const state = getPostpartumPostBannerState({
        isPpActive: true,
        isSelf: false,
        isPending: false,
        firstName: "Sam",
      });
      expect(state.text).toBe("Go to Postpartum Post");
      expect(state.disabled).toBe(true);
      expect(state.title).toBe("Sam has activated Postpartum Post");
      expect(state.trackEvent).toBeUndefined();
    });

    it("stays disabled and shows the plain (non-pending) text regardless of isPending — a sibling's card never has a request in flight", () => {
      const activating = getPostpartumPostBannerState({
        isPpActive: false,
        isSelf: false,
        isPending: true,
        firstName: "Sam",
      });
      expect(activating.text).toBe("Activate Postpartum Post");
      expect(activating.disabled).toBe(true);

      const signingIn = getPostpartumPostBannerState({
        isPpActive: true,
        isSelf: false,
        isPending: true,
        firstName: "Sam",
      });
      expect(signingIn.text).toBe("Go to Postpartum Post");
      expect(signingIn.disabled).toBe(true);
    });
  });
});

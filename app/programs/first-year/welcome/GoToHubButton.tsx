"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { getWelcomeHubSignInLink } from "./actions";

// Same-tab navigation (unlike MemberCard's "Go to Postpartum Post", which
// opens a new tab to keep the Hub session alive in this one) — there's no
// Hub session to preserve here, the whole point is landing in one.
//
// Falls back to a plain /hub link (normal sign-in form) if there's no
// session_id in the URL, or if the sign-in link couldn't be generated —
// see actions.ts's docs for why that fallback matters here specifically.
export default function GoToHubButton() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!sessionId) {
      window.location.href = "/hub";
      return;
    }
    startTransition(async () => {
      const result = await getWelcomeHubSignInLink(sessionId);
      window.location.href = result.success ? result.url : "/hub";
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      data-umami-event="FYP Welcome: Go to Hub"
      className="inline-block rounded-full bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal font-medium px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {isPending ? "Taking you to your Hub…" : "Go to your First Year Hub →"}
    </button>
  );
}

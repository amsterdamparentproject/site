"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getWelcomeHubSignInLink } from "./actions";

// Renamed from GoToHubButton.tsx 2026-07-31 — simplified from a button the
// family had to click into an auto-fire-on-mount redirect, no click
// required. Stripe's success_url still points at this route (generating
// the Hub magic-link needs a server call keyed off session_id, so there's
// no way to skip landing here entirely), but the family never has to do
// anything: this fires immediately on mount and they're in /hub/home a
// moment later with its welcome banner, instead of reading marketing copy
// and clicking a button first.
//
// Same fallback behavior as the old button had: no session_id in the URL,
// or the sign-in link couldn't be generated → plain /hub (normal sign-in
// form) rather than a dead end.
export default function AutoHubRedirect() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      window.location.href = "/hub";
      return;
    }
    getWelcomeHubSignInLink(sessionId).then((result) => {
      window.location.href = result.success ? result.url : "/hub";
    });
  }, [sessionId]);

  return <p className="text-center text-sm py-16">Setting up your Hub…</p>;
}

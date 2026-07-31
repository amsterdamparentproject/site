import { Suspense } from "react";
import { genPageMetadata } from "app/seo";
import AutoHubRedirect from "./AutoHubRedirect";

export const metadata = genPageMetadata({
  title: "Welcome to the First Year Program",
  robots: {
    index: false,
    follow: false,
  },
});

// Simplified 2026-07-31 — no more marketing copy or a button to click
// through here. Stripe's success_url still points at this route (see
// AutoHubRedirect's docs for why it can't be skipped entirely), but in
// practice the family never sees anything but a brief "Setting up your
// Hub…" beat before landing on /hub/home with its welcome banner.
export default function FirstYearWelcomePage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-sm py-16">Setting up your Hub…</p>
      }
    >
      <AutoHubRedirect />
    </Suspense>
  );
}

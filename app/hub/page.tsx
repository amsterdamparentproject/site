"use client";

import Link from "@/components/Link";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import HubLoginForm from "@/app/hub/HubLoginForm";
import SignOutButton from "@/app/hub/SignOutButton";

// MVP scope for this commit: prove the signup → magic link → account flow
// end to end. Showing the member, activating Postpartum Post, and billing
// / cancel land in /hub/account in a follow-up commit — see
// __claude__/fyp-hub-plan.md.
export default function HubPage() {
  const { loading, member } = useHubAccount();

  if (loading) {
    return <p className="text-center text-sm py-16">Loading…</p>;
  }

  if (!member) {
    return (
      <div className="py-12">
        <h1 className="text-center text-3xl font-extrabold text-brand-charcoal dark:text-brand-white mb-8">
          First Year Hub
        </h1>
        <HubLoginForm />
      </div>
    );
  }

  if (member.accountStatus !== "active") {
    return (
      <div className="max-w-sm mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-brand-charcoal dark:text-brand-white">
          Your membership isn&apos;t active
        </h2>
        <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/60">
          We couldn&apos;t find an active First Year Program subscription for
          this account.
        </p>
        <Link
          href="/programs/first-year"
          className="inline-block text-brand-soft-green dark:text-brand-goldenrod font-medium underline"
        >
          Visit the First Year Program →
        </Link>
        <div>
          <SignOutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto text-center py-16 space-y-4">
      <h1 className="text-3xl font-extrabold text-brand-charcoal dark:text-brand-white">
        Welcome, {member.firstName}!
      </h1>
      <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/60">
        Signed in as {member.email}
      </p>
      <div>
        <SignOutButton />
      </div>
    </div>
  );
}

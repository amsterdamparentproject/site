"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import HubLoginForm from "@/app/hub/HubLoginForm";

// /hub is just the sign-in gate now. Any signed-in member — active or
// not — is redirected straight into /hub/account, which mirrors
// Postpartum Post's tabbed account experience (Profile/Billing) and
// handles the inactive-membership state itself (see
// app/hub/account/layout.tsx). A real /hub "homepage" experience is
// planned for later — see __claude__/fyp-hub-plan.md.
export default function HubPage() {
  const router = useRouter();
  const { loading, member } = useHubAccount();

  useEffect(() => {
    if (!loading && member) {
      router.replace("/hub/account");
    }
  }, [loading, member, router]);

  if (loading || member) {
    return <p className="text-center text-sm py-16">Loading…</p>;
  }

  return (
    <div className="py-12">
      <h1 className="text-center text-3xl font-extrabold text-brand-charcoal dark:text-brand-white mb-8">
        First Year Hub
      </h1>
      <HubLoginForm />
    </div>
  );
}

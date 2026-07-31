"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import HubLoginForm from "@/app/hub/HubLoginForm";

// /hub is just the sign-in gate now. Any signed-in member — active or
// not, any role — is redirected straight into /hub/home, the Home tab
// (quick links: WhatsApp/events/contact — see app/hub/(account)/home).
// Home mirrors Postpartum Post's tabbed account experience's landing spot
// and handles the inactive-membership state itself (see
// app/hub/(account)/layout.tsx).
export default function HubPage() {
  const router = useRouter();
  const { loading, member } = useHubAccount();

  useEffect(() => {
    if (!loading && member) {
      router.replace("/hub/home");
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

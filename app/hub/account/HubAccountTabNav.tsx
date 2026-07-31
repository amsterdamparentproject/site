"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/app/hub/SignOutButton";
import { isLimitedStaffRole } from "@/lib/fyp/hub-access";

// Structurally mirrors postpartum-post/components/AccountTabNav.tsx — real
// routes (not client-side tab state), active tab derived from usePathname().
// Recolored to Hub's own brand tokens (soft-green/goldenrod, sand borders)
// rather than importing PP's literal coral/cream palette, since Hub already
// has its own distinct brand system elsewhere.
//
// No global "Save changes" button here (unlike PP's AccountTabNav) — Hub's
// editing is scoped per-card (see MemberCard.tsx's pencil toggle, which
// swaps to inline "Save changes"/"Discard changes" buttons in the card's
// own header), not a page-wide save state surfaced in the nav.

const MEMBER_TABS = [
  { href: "/hub/account", label: "Account" },
  { href: "/hub/billing", label: "Billing" },
  { href: "/hub/resources", label: "Resources" },
];

// Only 'facilitator' gets the reduced view (Resources only) — 'admin' sees
// the full MEMBER_TABS (see isLimitedStaffRole's comment). No new
// functionality is built for facilitators — just fewer tabs, since
// Account/Billing don't apply to non-customers. Enforced here (what's
// rendered) and in the shared (account) layout (what's reachable by direct
// URL).
const FACILITATOR_TABS = [{ href: "/hub/resources", label: "Resources" }];

export default function HubAccountTabNav({ role }: { role: string }) {
  const pathname = usePathname();
  const tabs = isLimitedStaffRole(role) ? FACILITATOR_TABS : MEMBER_TABS;

  return (
    <nav className="flex items-center gap-1 border-b border-brand-sand/60 mb-8">
      {tabs.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              active
                ? "border-brand-soft-green dark:border-brand-goldenrod text-brand-soft-green dark:text-brand-goldenrod"
                : "border-transparent text-brand-charcoal/60 dark:text-brand-white/50 hover:text-brand-charcoal dark:hover:text-brand-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <div className="ml-auto">
        <SignOutButton />
      </div>
    </nav>
  );
}

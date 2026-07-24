"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/app/hub/SignOutButton";

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

const TABS = [
  { href: "/hub/account", label: "Account" },
  { href: "/hub/billing", label: "Billing" },
  { href: "/hub/resources", label: "Resources" },
];

export default function HubAccountTabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b border-brand-sand/60 mb-8">
      {TABS.map(({ href, label }) => {
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

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "@/components/Link";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import {
  hasHubAccess,
  isStaffRole,
  isLimitedStaffRole,
} from "@/lib/fyp/hub-access";
import HubAccountTabNav from "@/app/hub/account/HubAccountTabNav";

// Shared shell for /hub/account, /hub/billing, and /hub/resources — a
// (account) route group (mirrors postpartum-post/app/(account)/layout.tsx
// exactly, including the parens trick: the folder groups these three
// sibling routes under one layout without adding "/account" to any of
// their URLs). One auth/member gate here instead of duplicated in every
// tab page; tab nav rendered once so children don't need to re-check
// `member` themselves.
//
// Unlike the old single-page /hub/account, this does NOT bounce inactive
// members back to /hub — /hub now redirects members straight into here
// regardless of status (see app/hub/page.tsx), so bouncing back here would
// infinite-loop. Instead, an inactive membership gets a banner and reduced
// functionality within Account/Billing rather than being redirected away.
export default function HubAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, member } = useHubAccount();
  const staff = !!member && isStaffRole(member.role);
  const limitedStaff = !!member && isLimitedStaffRole(member.role);

  useEffect(() => {
    if (!loading && !member) {
      router.replace("/hub");
    }
  }, [loading, member, router]);

  // Only the 'facilitator' role is limited to Home + Resources — no new
  // functionality is built for them, just gating. Direct navigation to
  // /hub/account or /hub/billing bounces to /hub/resources rather than
  // rendering member-only content that doesn't apply to non-customers.
  // 'admin' (staff but not limitedStaff) reaches every route normally.
  useEffect(() => {
    if (
      limitedStaff &&
      (pathname === "/hub/account" || pathname === "/hub/billing")
    ) {
      router.replace("/hub/resources");
    }
  }, [limitedStaff, pathname, router]);

  if (loading || !member) {
    return <p className="text-center text-sm py-16">Loading…</p>;
  }

  const accessible = hasHubAccess(member.accountStatus);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <p className="mb-2 text-2xl font-extrabold text-brand-goldenrod text-center">
        First Year Program
      </p>
      <h1 className="mb-8 text-3xl leading-9 font-extrabold tracking-tight text-brand-charcoal md:px-6 md:text-6xl md:leading-14 dark:text-gray-100 text-center">
        First Year Hub
      </h1>

      <HubAccountTabNav role={member.role} />

      {!staff && !accessible && (
        <div className="mb-8 rounded-2xl border border-brand-sand/60 bg-brand-white/60 dark:bg-brand-soft-charcoal p-4 text-sm text-brand-charcoal/80 dark:text-brand-white/70">
          Your membership isn&apos;t active, so some account features are
          limited.{" "}
          <Link
            href="/programs/first-year"
            className="text-brand-soft-green dark:text-brand-goldenrod font-medium underline"
          >
            Visit the First Year Program →
          </Link>
        </div>
      )}

      {children}
    </div>
  );
}

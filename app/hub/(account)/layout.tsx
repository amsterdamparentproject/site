"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "@/components/Link";
import Image from "@/components/Image";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import { getFypWhatsAppUrl } from "@/app/hub/actions";
import {
  formatEventsStart,
  getWelcomeBannerVariant,
  hasEventsStarted,
} from "@/app/hub/hub-banners";
import { isStaffRole, isLimitedStaffRole } from "@/lib/fyp/hub-access";
import HubAccountTabNav from "@/app/hub/account/HubAccountTabNav";
import SignOutButton from "@/app/hub/SignOutButton";

// Shown once, right after checkout — see AutoHubRedirect (checkout →
// welcome page) and the FYP routine welcome email (lib/emails/fyp-welcome.ts)
// for the two places that land here with ?welcome=1. Lives here (rather
// than on the home page itself) so it renders above the inactive-membership
// banner below — both banners can be visible together for a brand-new,
// not-yet-active member landing on /hub/home right after checkout, and the
// welcome should read first. Wrapped in its own Suspense boundary
// (useSearchParams requirement) so it doesn't force the whole layout into a
// loading state while this specific param is read. Strips the param via
// router.replace once shown, so a refresh or a bookmarked/forwarded link
// doesn't keep re-showing it.
//
// Copy branches on familyType rather than repeating the events-start banner
// below — this is about the very next action to take, not membership
// status, so multi-parent families are nudged to add their partner
// (Account tab) and single-parent families are nudged toward the WhatsApp
// group instead of a generic "take a look around."
function WelcomeBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { member, accessToken } = useHubAccount();
  // Captured once at mount, not re-derived from searchParams every render —
  // the cleanup effect below strips ?welcome=1 from the URL right after
  // mount, which would otherwise flip this back to false on the very next
  // render and hide the banner instantly instead of leaving it up.
  const [showBanner] = useState(() => searchParams.get("welcome") === "1");
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);

  useEffect(() => {
    if (showBanner) {
      router.replace("/hub/home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showBanner || !member) return null;

  const variant = getWelcomeBannerVariant(member.familyType);

  async function handleJoinWhatsApp() {
    if (!accessToken) return;
    setWhatsAppLoading(true);
    try {
      const result = await getFypWhatsAppUrl(accessToken);
      if (result.success) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        console.error(
          "[Hub welcome banner] WhatsApp link failed:",
          result.error,
        );
      }
    } finally {
      setWhatsAppLoading(false);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-brand-soft-green/40 bg-brand-soft-green/10 dark:bg-brand-soft-green/10 p-4 text-sm text-brand-charcoal dark:text-brand-white text-center">
      {variant === "multi" ? (
        <>
          Welcome to the First Year Program! This is your <b>First Year Hub</b>,
          where you&apos;ll find all of the program&apos;s resources and
          subscription details. Our recommended first step: head on over to the{" "}
          <Link
            href="/hub/account"
            className="text-brand-soft-green dark:text-brand-goldenrod font-medium underline"
          >
            Account
          </Link>{" "}
          tab to add your partner so they can start getting set up, too.
        </>
      ) : (
        <>
          Welcome to the First Year Program! This is your <b>First Year Hub</b>,
          where you&apos;ll find all of the program&apos;s resources and
          subscription details. Our recommended first step: join the{" "}
          <button
            type="button"
            onClick={handleJoinWhatsApp}
            disabled={whatsAppLoading}
            data-umami-event="Hub: Welcome banner WhatsApp link"
            className="text-brand-soft-green dark:text-brand-goldenrod font-medium underline disabled:opacity-60 disabled:cursor-wait cursor-pointer"
          >
            {whatsAppLoading ? "Loading…" : "WhatsApp group"}
          </button>{" "}
          to start meeting the other parents in the program.
        </>
      )}
    </div>
  );
}

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

  const eventsStarted = hasEventsStarted(member.billingStartDate);

  return (
    <div className="max-w-6xl mx-auto pt-4 pb-12 px-6 md:pt-12">
      <div className="mb-8 flex justify-center">
        <Image
          src="/email-images/fyp-logo.png"
          alt="First Year Program"
          width={680}
          height={221}
          className="h-24 w-auto md:h-28"
          priority
        />
      </div>

      <HubAccountTabNav role={member.role} />

      {pathname === "/hub/home" && (
        <Suspense fallback={null}>
          <WelcomeBanner />
        </Suspense>
      )}

      {!staff && !eventsStarted && (
        <div className="mb-8 rounded-2xl border border-brand-sand/60 bg-brand-white/60 dark:bg-brand-soft-charcoal p-4 text-sm text-brand-charcoal/80 dark:text-brand-white/70">
          Live events start {formatEventsStart(member.billingStartDate)}. In the
          meantime, you have full access to{" "}
          <Link
            href="/hub/account"
            className="text-brand-soft-green dark:text-brand-goldenrod font-medium underline"
          >
            1:1 matching via Postpartum Post
          </Link>
          , expert guides, and our WhatsApp community. Take a look around!
        </div>
      )}

      {children}

      <div className="mt-12 flex justify-center border-t border-brand-sand/60 pt-6">
        <SignOutButton />
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "@/components/Link";
import Modal from "@/components/Modal";
import SubscribeForm from "@/components/SubscribeForm";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import { getFypWhatsAppUrl } from "@/app/hub/actions";

// Home tab — landing spot for every signed-in Hub visitor (all roles, see
// app/hub/page.tsx's redirect). Quick-link blocks, recolored copies of
// components/homepage/HighlightSection.tsx's cards (same rounded-3xl/p-8
// layout, same brand-color-at-15%-opacity treatment) rather than that
// exact component, since most of these link Hub-only actions
// (WhatsApp/mailto) instead of site routes. Newsletter/Groups Directory
// (added 2026-07-29) do link ordinary site routes/behavior, but are kept as
// plain divs here too rather than importing HighlightSection/NewsletterCard
// directly — those carry "order-2 md:order-1"-style classes tuned for the
// homepage's specific mobile/desktop reordering, which would fight this
// page's own 2-column grid.
//
// This replaces the quick-links row that used to sit atop the Resources
// tab (moved here 2026-07-29) — Resources now only holds the guide
// accordion.
const LUMA_CALENDAR_URL = process.env.NEXT_PUBLIC_FYP_LUMA_CALENDAR_URL;

// Shown once, right after checkout — see AutoHubRedirect (checkout →
// welcome page) and the FYP routine welcome email (lib/emails/fyp-welcome.ts)
// for the two places that land here with ?welcome=1. Wrapped in its own
// Suspense boundary (useSearchParams requirement) so it doesn't force the
// whole page into a loading state while this specific param is read.
// Strips the param via router.replace once shown, so a refresh or a
// bookmarked/forwarded link doesn't keep re-showing it.
function WelcomeBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Captured once at mount, not re-derived from searchParams every render —
  // the cleanup effect below strips ?welcome=1 from the URL right after
  // mount, which would otherwise flip this back to false on the very next
  // render and hide the banner instantly instead of leaving it up.
  const [showBanner] = useState(() => searchParams.get("welcome") === "1");

  useEffect(() => {
    if (showBanner) {
      router.replace("/hub/home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showBanner) return null;

  return (
    <div className="mb-8 rounded-2xl border border-brand-soft-green/40 bg-brand-soft-green/10 dark:bg-brand-soft-green/10 p-4 text-sm text-brand-charcoal dark:text-brand-white text-center">
      Welcome to the First Year Program! Your Hub is all set — take a look
      around below.
    </div>
  );
}

export default function HubHomePage() {
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const { accessToken } = useHubAccount();

  return (
    <div className="space-y-10">
      <Suspense fallback={null}>
        <WelcomeBanner />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-soft-green/15 dark:bg-brand-violet/10 rounded-3xl p-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
            FYP WhatsApp group
          </h2>
          <p className="text-brand-charcoal dark:text-brand-white mb-6">
            Connect with other families in the program between sessions
          </p>
          <button
            type="button"
            disabled={whatsAppLoading}
            data-umami-event="Hub: WhatsApp quick link"
            className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors disabled:opacity-60 disabled:cursor-wait cursor-pointer"
            onClick={async () => {
              if (!accessToken) return;
              setWhatsAppLoading(true);
              try {
                const result = await getFypWhatsAppUrl(accessToken);
                if (result.success) {
                  window.open(result.url, "_blank", "noopener,noreferrer");
                } else {
                  console.error(
                    "[Hub home] WhatsApp link failed:",
                    result.error,
                  );
                }
              } finally {
                setWhatsAppLoading(false);
              }
            }}
          >
            {whatsAppLoading ? "Loading…" : "Join the group"}
          </button>
        </div>

        <div className="bg-brand-goldenrod/15 dark:bg-brand-soft-green/10 rounded-3xl p-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
            Events calendar
          </h2>
          <p className="text-brand-charcoal dark:text-brand-white mb-6">
            See and register for every upcoming session and social
          </p>
          {LUMA_CALENDAR_URL && (
            <a
              href={LUMA_CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="Hub: Luma quick link"
              className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors"
            >
              View the calendar
            </a>
          )}
        </div>

        <div className="bg-brand-sand/40 dark:bg-brand-sand/10 rounded-3xl p-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
            Questions?
          </h2>
          <p className="text-brand-charcoal dark:text-brand-white mb-6">
            We&apos;re here to help with anything about the program
          </p>
          <a
            href="mailto:hello@amsterdamparentproject.nl"
            data-umami-event="Hub: Contact quick link"
            className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors"
          >
            Contact us
          </a>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-brand-charcoal dark:text-brand-white mb-4">
          Other APP stuff
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-sand/40 dark:bg-brand-sand/10 rounded-3xl p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
              Newsletter
            </h2>
            <p className="text-brand-charcoal dark:text-brand-white mb-6">
              Expert advice and local activities for parents of babies and
              toddlers in Amsterdam
            </p>
            <button
              type="button"
              onClick={() => setNewsletterOpen(true)}
              data-umami-event="Hub: Newsletter quick link"
              className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors cursor-pointer"
            >
              Subscribe
            </button>
          </div>

          <div className="bg-brand-goldenrod/15 dark:bg-brand-soft-green/10 rounded-3xl p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
              Groups Directory
            </h2>
            <p className="text-brand-charcoal dark:text-brand-white mb-6">
              Discover your local parent communities: 80+ groups and counting
            </p>
            <Link
              href="/groups-directory"
              data-umami-event="Hub: Groups Directory quick link"
              className="font-semibold text-brand-soft-green dark:text-brand-goldenrod hover:text-brand-goldenrod dark:hover:text-brand-violet font-medium transition-colors"
            >
              Find your groups
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
        title="Subscribe to Just a Phase"
        description="Expert advice and local events for parents of babies and toddlers in Amsterdam, sent every other Monday at 3pm."
        size="sm"
      >
        <SubscribeForm tag="fyp-hub" hideCtaLabel={true} fullWidth={true} />
      </Modal>
    </div>
  );
}

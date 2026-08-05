"use client";

import { useState } from "react";
import Link from "@/components/Link";
import Modal from "@/components/Modal";
import SubscribeForm from "@/components/SubscribeForm";
import { useHubAccount } from "@/app/hub/HubAccountContext";
import { getFypQaFormUrl, getFypWhatsAppUrl } from "@/app/hub/actions";
import { formatStartMonth, hasEventsStarted } from "@/app/hub/hub-banners";

// Home tab — landing spot for every signed-in Hub visitor (all roles, see
// app/hub/page.tsx's redirect). Quick-link blocks, kept as plain divs
// rather than importing HighlightSection/NewsletterCard directly — those
// carry "order-2 md:order-1"-style classes tuned for the homepage's
// specific mobile/desktop reordering, which would fight this page's own
// 2-column grid.
//
// Restyled 2026-08-01 to match the rest of the Hub's card language (white
// bg/sand border, e.g. MemberCard.tsx, the Resources accordion) instead of
// the homepage HighlightSection's colored-tint/rounded-3xl treatment —
// CTA moved from an inline text link into a full-width bottom banner
// button, same shape as MemberCard's Postpartum Post banner. Top row
// (WhatsApp/Events/Contact) is goldenrod, "Connect with APP" row
// (Newsletter/Groups Directory) is green — same soft-green/goldenrod pair
// as that banner, just swapped per row to tell the two groups apart.
// Deliberately no h-full/flex-1 stretch on the card or its content block —
// that combination was leaving a big empty gap between the description and
// the button (content stretched to fill the card, text stayed pinned to
// the top of that stretched space) — cards now just hug their own content.
//
// This replaces the quick-links row that used to sit atop the Resources
// tab (moved here 2026-07-29) — Resources now only holds the guide
// accordion.
const LUMA_CALENDAR_URL = process.env.NEXT_PUBLIC_FYP_LUMA_CALENDAR_URL;

// The ?welcome=1 banner (shown once right after checkout, see
// AutoHubRedirect and lib/emails/fyp-welcome.ts) now lives in the shared
// (account) layout instead of here — it needs to render above the
// layout's inactive-membership banner, which this page doesn't control.

// Live events (and this calendar) don't start until billing_start_date —
// before that, swap the "View the calendar" link for a disabled "Starting
// in [month]" button rather than sending members to an empty/future Luma
// calendar. Bundle accounts are set to status "active" immediately on
// checkout (see the webhook's expecting_bundle/baby_bundle branches) even
// though their program access is deferred, so accountStatus/hasHubAccess
// can't be used to gate this — billing_start_date is the only source of
// truth for when events actually start.
//
// A still-`pending` account (webhook hasn't fired yet, see
// app/api/checkout/fyp/route.ts) has billing_start_date = null — treated
// here as "not started" rather than "started", so a brand-new signup never
// briefly shows a working calendar link before the date is known. See
// app/hub/hub-banners.ts for hasEventsStarted/formatStartMonth themselves —
// shared with the layout's own "Live events start..." banner so both stay
// in sync off the same billing_start_date logic.

export default function HubHomePage() {
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  const [qaFormLoading, setQaFormLoading] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const { accessToken, member } = useHubAccount();

  const hasStarted = hasEventsStarted(member?.billingStartDate ?? null);
  const startMonth = member?.billingStartDate
    ? formatStartMonth(member.billingStartDate)
    : null;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm flex flex-col">
          <div className="p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
              FYP WhatsApp group
            </h2>
            <p className="text-brand-charcoal dark:text-brand-white mb-2">
              Connect with other families in the program between sessions
            </p>
          </div>
          <button
            type="button"
            disabled={whatsAppLoading}
            data-umami-event="Hub: WhatsApp quick link"
            className="block w-full text-center text-sm font-medium bg-brand-goldenrod dark:bg-brand-soft-green text-brand-charcoal dark:text-white py-3 hover:opacity-90 transition-opacity border-t border-brand-sand/60 rounded-b-2xl disabled:opacity-60 disabled:cursor-wait cursor-pointer"
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

        <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm flex flex-col">
          <div className="p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
              Events calendar
            </h2>
            <p className="text-brand-charcoal dark:text-brand-white mb-2">
              Register for upcoming expert sessions and local socials
            </p>
          </div>
          {hasStarted ? (
            LUMA_CALENDAR_URL && (
              <a
                href={LUMA_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-umami-event="Hub: Luma quick link"
                className="block w-full text-center text-sm font-medium bg-brand-goldenrod dark:bg-brand-soft-green text-brand-charcoal dark:text-white py-3 hover:opacity-90 transition-opacity border-t border-brand-sand/60 rounded-b-2xl"
              >
                View the calendar
              </a>
            )
          ) : (
            <div
              className="block w-full text-center text-sm font-medium bg-brand-charcoal text-white py-3 border-t border-brand-sand/60 rounded-b-2xl"
              title="Live events start once the program begins"
            >
              {startMonth ? `Starting in ${startMonth}` : "Starting soon"}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm flex flex-col">
          <div className="p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
              Q&A form
            </h2>
            <p className="text-brand-charcoal dark:text-brand-white mb-2">
              Submit your questions (anonymously) for our experts
            </p>
          </div>
          <button
            type="button"
            disabled={qaFormLoading}
            data-umami-event="Hub: Q&A form quick link"
            className="block w-full text-center text-sm font-medium bg-brand-goldenrod dark:bg-brand-soft-green text-brand-charcoal dark:text-white py-3 hover:opacity-90 transition-opacity border-t border-brand-sand/60 rounded-b-2xl disabled:opacity-60 disabled:cursor-wait cursor-pointer"
            onClick={async () => {
              if (!accessToken) return;
              setQaFormLoading(true);
              try {
                const result = await getFypQaFormUrl(accessToken);
                if (result.success) {
                  window.open(result.url, "_blank", "noopener,noreferrer");
                } else {
                  console.error(
                    "[Hub home] Q&A form link failed:",
                    result.error,
                  );
                }
              } finally {
                setQaFormLoading(false);
              }
            }}
          >
            {qaFormLoading ? "Loading…" : "Submit a question"}
          </button>
        </div>

        <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm flex flex-col">
          <div className="p-8 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
              Contact us
            </h2>
            <p className="text-brand-charcoal dark:text-brand-white mb-2">
              Alex and Miriam are here to help with anything about the program
            </p>
          </div>
          <a
            href="mailto:hello@amsterdamparentproject.nl"
            data-umami-event="Hub: Contact quick link"
            className="block w-full text-center text-sm font-medium bg-brand-goldenrod dark:bg-brand-soft-green text-brand-charcoal dark:text-white py-3 hover:opacity-90 transition-opacity border-t border-brand-sand/60 rounded-b-2xl"
          >
            Contact us
          </a>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-brand-charcoal dark:text-brand-white mb-4">
          Connect with APP
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm flex flex-col">
            <div className="p-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
                Newsletter
              </h2>
              <p className="text-brand-charcoal dark:text-brand-white mb-2">
                Expert advice and local activities for parents of babies and
                toddlers in Amsterdam
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewsletterOpen(true)}
              data-umami-event="Hub: Newsletter quick link"
              className="block w-full text-center text-sm font-medium bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal py-3 hover:opacity-90 transition-opacity border-t border-brand-sand/60 rounded-b-2xl cursor-pointer"
            >
              Subscribe
            </button>
          </div>

          <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm flex flex-col">
            <div className="p-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-4">
                Groups Directory
              </h2>
              <p className="text-brand-charcoal dark:text-brand-white mb-2">
                Discover your local parent communities: 80+ groups and counting
              </p>
            </div>
            <Link
              href="/groups-directory"
              data-umami-event="Hub: Groups Directory quick link"
              className="block w-full text-center text-sm font-medium bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal py-3 hover:opacity-90 transition-opacity border-t border-brand-sand/60 rounded-b-2xl"
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

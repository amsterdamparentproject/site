"use client";

import { useEffect, useState, useTransition } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/client";
import {
  updateFypMemberProfile,
  deleteFypMember,
  type HubMemberProfile,
} from "@/app/hub/actions";
import {
  activateMemberPostpartumPost,
  getPostpartumPostSignInLink,
} from "@/app/hub/account/actions";
import { getPostpartumPostBannerState } from "@/app/hub/account/postpartum-post-banner";

// Mirrors postpartum-post/app/(account)/matches/page.tsx's MatchedCard
// visual language (card shell, top-right square icon buttons, full-width
// bottom banner button) recolored to Hub's own brand tokens rather than
// PP's literal coral/cream — same reasoning as HubAccountTabNav.
//
// PP activation is per-member (not a separate section), so it lives as
// this card's bottom banner rather than its own card — text and
// destination depend on whether this member already has a linked PP
// account.

export const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-brand-sand/60 bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-brand-white/80 focus:outline-none focus:ring-2 focus:ring-brand-soft-green/40 focus:border-brand-soft-green transition";

export const iconButtonClass =
  "p-2 rounded-lg border border-brand-sand/60 text-brand-charcoal/60 dark:text-brand-white/50 hover:text-brand-charcoal dark:hover:text-brand-white hover:border-brand-charcoal dark:hover:border-brand-white transition-colors";

function formatJoinedDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PencilIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function XIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function MemberCard({
  member,
  accessible,
  refetch,
  isSelf = true,
}: {
  member: HubMemberProfile;
  accessible: boolean;
  refetch: () => Promise<void>;
  // Whether this card belongs to the signed-in session itself vs. another
  // member on the same account (see MemberRoster.tsx, which renders this
  // same component for every "other member" too, rather than a separate
  // list style). Only changes delete behavior: removing yourself signs the
  // session out (there's no member row left for it to resolve to);
  // removing someone else just refreshes the roster in place.
  isSelf?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [whatsapp, setWhatsapp] = useState(member.whatsapp ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavePending, startSaveTransition] = useTransition();

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isActivatePending, startActivateTransition] = useTransition();
  const [activateError, setActivateError] = useState<string | null>(null);

  const [isPpLinkPending, startPpLinkTransition] = useTransition();
  const [ppLinkError, setPpLinkError] = useState<string | null>(null);

  const canDelete = member.memberCount > 1;

  useEffect(() => {
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setWhatsapp(member.whatsapp ?? "");
  }, [member.firstName, member.lastName, member.whatsapp]);

  function handleStartEdit() {
    setConfirmingDelete(false);
    setEditing(true);
  }

  function handleDiscard() {
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setWhatsapp(member.whatsapp ?? "");
    setSaveError(null);
    setEditing(false);
  }

  function handleSave() {
    setSaveError(null);
    startSaveTransition(async () => {
      const result = await updateFypMemberProfile(
        member.id,
        firstName,
        lastName,
        whatsapp,
      );
      if (!result.success) {
        setSaveError(result.error);
        return;
      }
      await refetch();
      setEditing(false);
    });
  }

  function handleConfirmDelete() {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteFypMember(member.id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      if (isSelf) {
        // No member row left for this session to resolve to — sign out
        // rather than leave the UI in a stale "logged in" state.
        await createAuthBrowserClient().auth.signOut();
      } else {
        // Removing someone else doesn't touch the viewer's own session —
        // just refresh the roster so their card disappears.
        await refetch();
      }
    });
  }

  function handleActivatePostpartumPost() {
    setActivateError(null);
    startActivateTransition(async () => {
      const result = await activateMemberPostpartumPost(member.id);
      if (!result.success) {
        setActivateError(result.error);
        return;
      }
      await refetch();
    });
  }

  function handleGoToPostpartumPost() {
    setPpLinkError(null);
    startPpLinkTransition(async () => {
      // Pass the caller's own access token; the server derives the email from
      // it and mints the sign-in link only for this signed-in member (audit
      // S1). This button is isSelf-only, so member.email === the caller's email.
      const {
        data: { session },
      } = await createAuthBrowserClient().auth.getSession();
      if (!session) {
        setPpLinkError("Please sign in again.");
        return;
      }
      const result = await getPostpartumPostSignInLink(session.access_token);
      if (!result.success) {
        setPpLinkError(result.error);
        return;
      }
      // New tab — keeps the Hub session alive here while PP's own
      // /auth/confirm consumes the one-time link over there.
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  const isPpActive = !!member.postpartumpostMemberId;
  const ppBanner = getPostpartumPostBannerState({
    isPpActive,
    isSelf,
    isPending: isPpActive ? isPpLinkPending : isActivatePending,
    firstName: member.firstName,
  });

  return (
    <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm relative">
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-brand-charcoal dark:text-brand-white">
            {member.firstName} {member.lastName}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSavePending}
                  title="Save changes"
                  data-umami-event="Hub: Save member changes"
                  className={`${iconButtonClass} hover:text-brand-soft-green dark:hover:text-brand-goldenrod hover:border-brand-soft-green dark:hover:border-brand-goldenrod disabled:opacity-60`}
                >
                  <CheckIcon />
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={isSavePending}
                  title="Discard changes"
                  data-umami-event="Hub: Discard member changes"
                  className={`${iconButtonClass} disabled:opacity-60`}
                >
                  <XIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                title="Edit member"
                data-umami-event="Hub: Toggle edit member"
                className={iconButtonClass}
              >
                <PencilIcon />
              </button>
            )}
          </div>
        </div>

        {!editing && (
          <div className="text-sm text-brand-charcoal/60 dark:text-brand-white/50 space-y-0.5">
            <p>{member.email}</p>
            {member.whatsapp && <p>WhatsApp: {member.whatsapp}</p>}
            <p>Joined {formatJoinedDate(member.signedUpAt)}</p>
          </div>
        )}

        {editing && (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="hub-profile-first-name"
                  className="block text-xs font-medium text-brand-charcoal/60 dark:text-brand-white/50 mb-1"
                >
                  First name
                </label>
                <input
                  id="hub-profile-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="hub-profile-last-name"
                  className="block text-xs font-medium text-brand-charcoal/60 dark:text-brand-white/50 mb-1"
                >
                  Last name
                </label>
                <input
                  id="hub-profile-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="hub-profile-email"
                className="block text-xs font-medium text-brand-charcoal/60 dark:text-brand-white/50 mb-1"
              >
                Email
              </label>
              <input
                id="hub-profile-email"
                type="email"
                value={member.email}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
              <p className="mt-1 text-xs text-brand-charcoal/50 dark:text-brand-white/40">
                Your email is tied to how you sign in and can&apos;t be changed
                here — contact us if you need it updated.
              </p>
            </div>
            <div>
              <label
                htmlFor="hub-profile-whatsapp"
                className="block text-xs font-medium text-brand-charcoal/60 dark:text-brand-white/50 mb-1"
              >
                WhatsApp number (optional)
              </label>
              <input
                id="hub-profile-whatsapp"
                type="tel"
                placeholder="+31 6 12345678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className={inputClass}
              />
            </div>
            {saveError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {saveError}
              </p>
            )}

            {canDelete && (
              <>
                <hr className="mt-6 border-brand-sand/60" />

                {!confirmingDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    data-umami-event="Hub: Remove member"
                    className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                  >
                    Delete member
                  </button>
                )}

                {confirmingDelete && (
                  <div className="rounded-xl border border-red-200 dark:border-red-400/40 bg-red-50 dark:bg-red-950/20 p-4 space-y-2">
                    <p className="text-sm text-brand-charcoal dark:text-brand-white font-medium">
                      Remove {member.firstName} from this account?
                    </p>
                    <p className="text-xs text-brand-charcoal/70 dark:text-brand-white/60">
                      This can&apos;t be undone.
                      {isSelf && " You'll be signed out."}
                    </p>
                    {deleteError && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {deleteError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        disabled={isDeletePending}
                        data-umami-event="Hub: Confirm remove member"
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-500/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isDeletePending ? "Removing…" : "Yes, remove"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(false)}
                        disabled={isDeletePending}
                        className="text-xs px-3 py-1.5 rounded-lg border border-brand-sand/60 text-brand-charcoal/70 dark:text-brand-white/60 hover:text-brand-charcoal dark:hover:text-brand-white transition-colors cursor-pointer"
                      >
                        Never mind
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activateError && (
          <p className="text-xs text-red-500 dark:text-red-400">
            {activateError}
          </p>
        )}

        {ppLinkError && (
          <p className="text-xs text-red-500 dark:text-red-400">
            {ppLinkError}
          </p>
        )}
      </div>

      {accessible && (
        <button
          type="button"
          onClick={
            isSelf
              ? isPpActive
                ? handleGoToPostpartumPost
                : handleActivatePostpartumPost
              : undefined
          }
          disabled={ppBanner.disabled}
          title={ppBanner.title}
          data-umami-event={ppBanner.trackEvent}
          className="block w-full text-center text-sm font-medium bg-brand-soft-green dark:bg-brand-goldenrod text-white dark:text-brand-charcoal py-3 hover:opacity-90 transition-opacity border-t border-brand-sand/60 rounded-b-2xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {ppBanner.text}
        </button>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getFypAccountMembers,
  addFypMember,
  type HubAccountMemberSummary,
  type HubMemberProfile,
} from "@/app/hub/actions";
import MemberCard, {
  inputClass,
  iconButtonClass,
  CheckIcon,
  XIcon,
} from "@/app/hub/account/MemberCard";
import { useHubAccount } from "@/app/hub/HubAccountContext";

// "Other members" + add-member form for the Account tab — the self-serve
// counterpart to FYPJoinForm's checkout-time promise ("After sign up, you
// can add your partner(s) to the subscription from your profile"). Only
// rendered for multi-family accounts (gated by the caller,
// app/hub/(account)/account/page.tsx, via member.familyType).
//
// Other members render as the exact same MemberCard used for the
// signed-in member's own card (isSelf={false} — see MemberCard's own docs
// for the one behavior difference that toggles) rather than a separate,
// lighter list style, so editing/removing a sibling feels identical to
// editing yourself. The add-member trigger is a plain, unboxed link
// (deliberately not a card) until clicked, at which point it expands into
// a card styled to match MemberCard's own editing view exactly.
//
// Deliberately a separate fetch from HubAccountContext's `member` — that
// context only ever resolves the signed-in session's own row, never the
// full account roster. onRosterChange lets the caller refetch its own
// profile too, since adding/removing a sibling changes memberCount, which
// gates the signed-in member's own "Delete member" affordance.

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

const labelClass =
  "block text-xs font-medium text-brand-charcoal/60 dark:text-brand-white/50 mb-1";

// Builds a full HubMemberProfile for a sibling by borrowing the
// signed-in member's account-level fields (status, plan, billing dates,
// familyType, memberCount — identical for everyone on the same account)
// and swapping in the sibling's own per-member fields.
function toSiblingProfile(
  self: HubMemberProfile,
  m: HubAccountMemberSummary,
): HubMemberProfile {
  return {
    ...self,
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.email,
    whatsapp: m.whatsapp,
    postpartumpostMemberId: m.postpartumpostMemberId,
    signedUpAt: m.signedUpAt,
  };
}

export default function MemberRoster({
  selfMember,
  accessible,
  onRosterChange,
}: {
  selfMember: HubMemberProfile;
  accessible: boolean;
  onRosterChange: () => Promise<void>;
}) {
  const { accessToken } = useHubAccount();
  const [members, setMembers] = useState<HubAccountMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAddPending, startAddTransition] = useTransition();

  const refetchRoster = useCallback(async () => {
    // Account is always the caller's own, resolved server-side from the
    // token (audit S2) — selfMember.accountId is only used to filter the
    // signed-in member's own card out of the returned roster below.
    const all = await getFypAccountMembers(accessToken ?? "");
    setMembers(all.filter((m) => m.id !== selfMember.id));
  }, [accessToken, selfMember.id]);

  useEffect(() => {
    setLoading(true);
    refetchRoster().finally(() => setLoading(false));
  }, [refetchRoster]);

  // Passed as each sibling MemberCard's `refetch` — covers both a saved
  // edit (reload their updated fields) and a removal (isSelf={false}
  // skips signing the viewer out and calls this instead, so the removed
  // card just disappears). Also refreshes the signed-in member's own
  // profile, since memberCount changes on add/remove and gates their own
  // "Delete member" affordance.
  const refetchAfterSiblingChange = useCallback(async () => {
    await refetchRoster();
    await onRosterChange();
  }, [refetchRoster, onRosterChange]);

  function resetAddForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setWhatsapp("");
    setAddError(null);
    setAdding(false);
  }

  function handleAddMember() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setAddError("First name, last name, and email are required");
      return;
    }
    setAddError(null);
    startAddTransition(async () => {
      const result = await addFypMember(
        accessToken ?? "",
        firstName,
        lastName,
        email,
        whatsapp,
      );
      if (!result.success) {
        setAddError(result.error);
        return;
      }
      resetAddForm();
      await refetchAfterSiblingChange();
    });
  }

  if (loading) return null;

  return (
    <div className="space-y-6">
      {members.map((m) => (
        <MemberCard
          key={m.id}
          member={toSiblingProfile(selfMember, m)}
          accessible={accessible}
          refetch={refetchAfterSiblingChange}
          isSelf={false}
        />
      ))}

      {/* Add member — a plain link until clicked (deliberately not boxed,
          left-aligned with MemberCard's own p-6 inner content via px-6),
          then expands into a card matching MemberCard's editing view. */}
      {adding ? (
        <div className="bg-white dark:bg-brand-soft-charcoal rounded-2xl border border-brand-sand/60 shadow-sm relative">
          <div className="p-6 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-brand-charcoal dark:text-brand-white">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : "New member"}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={isAddPending}
                  title="Add member"
                  data-umami-event="Hub: Save new member"
                  className={`${iconButtonClass} hover:text-brand-soft-green dark:hover:text-brand-goldenrod hover:border-brand-soft-green dark:hover:border-brand-goldenrod disabled:opacity-60`}
                >
                  <CheckIcon />
                </button>
                <button
                  type="button"
                  onClick={resetAddForm}
                  disabled={isAddPending}
                  title="Discard"
                  data-umami-event="Hub: Discard new member"
                  className={`${iconButtonClass} disabled:opacity-60`}
                >
                  <XIcon />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="hub-add-member-first-name"
                    className={labelClass}
                  >
                    First name
                    <RequiredMark />
                  </label>
                  <input
                    id="hub-add-member-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="hub-add-member-last-name"
                    className={labelClass}
                  >
                    Last name
                    <RequiredMark />
                  </label>
                  <input
                    id="hub-add-member-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="hub-add-member-email" className={labelClass}>
                  Email
                  <RequiredMark />
                </label>
                <input
                  id="hub-add-member-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="hub-add-member-whatsapp" className={labelClass}>
                  WhatsApp number
                </label>
                <input
                  id="hub-add-member-whatsapp"
                  type="tel"
                  placeholder="+31 6 12345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={inputClass}
                />
              </div>
              {addError && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {addError}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          data-umami-event="Hub: Toggle add member"
          className="px-6 text-sm font-medium text-brand-soft-green dark:text-brand-goldenrod hover:opacity-80 transition-opacity cursor-pointer"
        >
          + Add member
        </button>
      )}
    </div>
  );
}

"use client";

import { useHubAccount } from "@/app/hub/HubAccountContext";
import { hasHubAccess } from "@/lib/fyp/hub-access";
import MemberCard from "@/app/hub/account/MemberCard";
import MemberRoster from "@/app/hub/account/MemberRoster";

// Account tab (labeled "Account" in the nav, route stays /hub/account) —
// shows the signed-in member as a card mirroring PP's match-card style
// (see MemberCard.tsx), with inline edit (pencil) and remove (disabled
// while it's the account's only member) actions, plus a per-member
// Postpartum Post activation banner. Multi-family accounts additionally
// get MemberRoster below — the other members on the account, plus an
// "Add member" form (see FYPJoinForm's "add your partner(s) ... from your
// profile" promise). Loading/redirect and the inactive-membership banner
// live in the shared layout.
export default function HubAccountProfilePage() {
  const { member, refetch } = useHubAccount();

  if (!member) return null;

  const accessible = hasHubAccess(member.accountStatus);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-brand-charcoal dark:text-brand-white">
          You
        </h2>
        <MemberCard member={member} accessible={accessible} refetch={refetch} />
      </div>

      {member.familyType === "multi" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-brand-charcoal dark:text-brand-white">
            Your family
          </h2>
          <p className="text-sm text-brand-charcoal/70 dark:text-brand-white/60">
            Your First Year Program plan includes all members of your family:
            moms, dads, partners included. If you&apos;d like to add other
            caregivers to your plan, please reach out to{" "}
            <a
              href="mailto:hello@amsterdamparentproject.nl"
              className="text-brand-soft-green dark:text-brand-goldenrod font-medium underline"
            >
              hello@amsterdamparentproject.nl
            </a>
            .
          </p>
          <MemberRoster
            selfMember={member}
            accessible={accessible}
            onRosterChange={refetch}
          />
        </div>
      )}
    </div>
  );
}

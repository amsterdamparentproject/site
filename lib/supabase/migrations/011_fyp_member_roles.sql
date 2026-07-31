-- Migration 011: firstyear.members.role
--
-- Adds a lightweight role flag to firstyear.members, mirroring the existing
-- directory.groups_contacts.is_admin pattern (migration 003) rather than
-- inventing a new permissions system. Unconstrained text, same convention as
-- accounts.flow/status/plan_type elsewhere in this schema.
--
-- Values in practice: 'member' (default, every real paying family), plus
-- 'facilitator' (Miriam, Danielle — rotating expert-discussion/social hosts)
-- and 'admin' (Alex's own Hub account). Non-'member' roles are staff, not
-- customers: they get a stripped-down Hub view (Resources + WhatsApp/Luma
-- quick links only, no Account/Billing) regardless of the account.status on
-- whatever placeholder/real account their members row happens to hang off
-- of — see lib/fyp/hub-access.ts, updated in the same change as this
-- migration to bypass the status check entirely for these roles.
--
-- Deliberately no CHECK constraint: exactly 3 people need a non-default
-- value today, not worth the migration churn of a real enum for that.
--
-- Run in Supabase SQL editor (production and test environments separately).

ALTER TABLE firstyear.members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';

CREATE INDEX IF NOT EXISTS members_role_idx ON firstyear.members(role) WHERE role <> 'member';

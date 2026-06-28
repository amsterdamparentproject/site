-- Migration 006: Add firstyear.members table; remove email from accounts;
--               add member_details view.
--
-- Email, first name, and last name are now collected on the join form and
-- stored in firstyear.members (one row per family member / parent).
-- An account can have multiple members (e.g. two parents in a multi-parent family).
--
-- Member status is intentionally omitted from this table — it is always
-- identical to the parent account's status (pending → active), so we derive
-- it via the member_details view rather than storing and syncing a redundant copy.
--
-- Prerequisites: Run 004_firstyear_schema.sql and 005_fyp_email_nullable.sql first.
-- Run in Supabase SQL editor (production and test environments separately).

-- 1. Create the members table (no status column — derived from accounts)
CREATE TABLE IF NOT EXISTS firstyear.members (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id    uuid        NOT NULL REFERENCES firstyear.accounts(id) ON DELETE CASCADE,
  first_name    text        NOT NULL,
  last_name     text        NOT NULL,
  email         text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS members_account_id_idx ON firstyear.members(account_id);
CREATE INDEX IF NOT EXISTS members_email_idx      ON firstyear.members(email);

GRANT ALL ON firstyear.members TO service_role;
GRANT ALL ON firstyear.members TO authenticated;

-- 2. View: member_details — members with status derived from their account.
--    Use this view wherever code needs to filter or display member status.
CREATE OR REPLACE VIEW firstyear.member_details AS
  SELECT
    m.id,
    m.account_id,
    m.first_name,
    m.last_name,
    m.email,
    m.created_at,
    a.status
  FROM firstyear.members m
  JOIN firstyear.accounts a ON a.id = m.account_id;

GRANT SELECT ON firstyear.member_details TO service_role;
GRANT SELECT ON firstyear.member_details TO authenticated;

-- 3. Remove email from accounts
-- Email is now owned by firstyear.members; the accounts table is email-free.
ALTER TABLE firstyear.accounts DROP COLUMN IF EXISTS email;
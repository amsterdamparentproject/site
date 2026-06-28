-- Migration 006: Add firstyear.members table; remove email from accounts.
--
-- Email, first name, and last name are now collected on the join form and
-- stored in firstyear.members (one row per family member / parent).
-- An account can have multiple members (e.g. two parents in a multi-parent family).
--
-- Prerequisites: Run 004_firstyear_schema.sql and 005_fyp_email_nullable.sql first.
-- Run in Supabase SQL editor (production and test environments separately).

-- 1. Create the members table
CREATE TABLE IF NOT EXISTS firstyear.members (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id    uuid        NOT NULL REFERENCES firstyear.accounts(id) ON DELETE CASCADE,
  first_name    text        NOT NULL,
  last_name     text        NOT NULL,
  email         text        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS members_account_id_idx ON firstyear.members(account_id);
CREATE INDEX IF NOT EXISTS members_email_idx      ON firstyear.members(email);
CREATE INDEX IF NOT EXISTS members_status_idx     ON firstyear.members(status);

GRANT ALL ON firstyear.members TO service_role;
GRANT ALL ON firstyear.members TO authenticated;

-- 2. Remove email from accounts
-- Email is now owned by firstyear.members; the accounts table is email-free.
ALTER TABLE firstyear.accounts DROP COLUMN IF EXISTS email;

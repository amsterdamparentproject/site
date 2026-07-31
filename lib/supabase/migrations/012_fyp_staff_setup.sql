-- Migration 012: FYP Hub staff rows (Miriam, Danielle, Alex)
--
-- Data setup, not schema — run after 011_fyp_member_roles.sql. Creates
-- placeholder firstyear.accounts rows for Miriam and Danielle (they aren't
-- customers, but firstyear.members.account_id is a NOT NULL FK, so they
-- need *some* account row to hang off of) and firstyear.members rows with
-- role = 'facilitator'. Alex's own row is a plain UPDATE, not an insert —
-- she already has a real members row from testing the signup flow; this
-- just retags it 'admin' rather than creating a duplicate.
--
-- account.status is set to 'staff' (not 'active') on purpose — these
-- aren't real subscriptions, and hub-access.ts's isStaffRole() bypasses the
-- status check entirely for facilitator/admin roles, so 'staff' keeps them
-- out of any future report/query that counts "active" as "paying
-- subscriber" (see lib/fyp/hub-access.ts's hasAnyHubAccess()).
--
-- ⚠ Fill in real values before running:
--   - <MIRIAM_EMAIL>, <DANIELLE_EMAIL> — Miriam and Danielle's real emails
--   - <ALEX_EMAIL> — whichever email Alex used when she tested the FYP
--     signup flow (this is an UPDATE keyed on that existing email, not an
--     insert — nothing happens if it doesn't match an existing row)
--
-- Run in Supabase SQL editor (production and test environments separately).

-- Miriam
WITH new_account AS (
  -- accounts has no email column (dropped in migration 006 — email lives on
  -- members only); stripe_session_id just needs to be unique, not a real session.
  INSERT INTO firstyear.accounts (stripe_session_id, flow, plan_type, family_type, status)
  VALUES ('staff-miriam-placeholder', 'facilitator', 'facilitator', 'single', 'staff')
  RETURNING id
)
INSERT INTO firstyear.members (account_id, first_name, last_name, email, role)
SELECT id, 'Dr. Irena Miriam', 'Domachowska', '<MIRIAM_EMAIL>', 'facilitator'
FROM new_account;

-- Danielle
WITH new_account AS (
  INSERT INTO firstyear.accounts (stripe_session_id, flow, plan_type, family_type, status)
  VALUES ('staff-danielle-placeholder', 'facilitator', 'facilitator', 'single', 'staff')
  RETURNING id
)
INSERT INTO firstyear.members (account_id, first_name, last_name, email, role)
SELECT id, 'Danielle', 'Bensky', '<DANIELLE_EMAIL>', 'facilitator'
FROM new_account;

-- Alex — retag her existing real signup-flow member row, don't create a new one.
-- Corrected 2026-07-29: no real charge was ever made — she used a Stripe
-- test/dev coupon at signup, not a real payment, so no refund is needed.
-- Still worth canceling the underlying Stripe subscription via /api/fyp/cancel
-- for tidiness (so it doesn't sit in the dashboard looking like a live
-- customer), but that's optional cleanup, not a financial fix — this
-- statement only touches the Hub role, not billing either way.
UPDATE firstyear.members
SET role = 'admin'
WHERE email = '<ALEX_EMAIL>';

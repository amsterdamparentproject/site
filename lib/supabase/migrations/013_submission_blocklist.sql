-- Migration 013: Event-submission spam blocklist
--
-- /calendar/submit-event has no anti-spam controls today, so repeat spam
-- senders reach the n8n webhook -> Slack review -> Desk card pipeline on
-- every submission. This table lets known bad emails/domains be excluded
-- server-side (in postEvent, components/PostToWebhook.tsx) before the
-- Supabase Storage upload or the webhook POST happen, so a blocked
-- submission costs nothing and never reaches review.
--
-- Lives in the "activities" schema since that's what postEvent already uses
-- for the event-image Storage bucket and what lib/supabase/queries/events.ts
-- uses for calendar data — no new schema needed.
--
-- To block a sender: insert a row with value = lowercased full email
-- (match_type 'email') or lowercased bare domain (match_type 'domain'),
-- e.g. ('spammer@example.com', 'email') or ('example.com', 'domain').
-- Edit directly in the Supabase table editor — no redeploy required.
--
-- Run in Supabase SQL editor (production and test environments separately).

CREATE TABLE activities.submission_blocklist (
  id         bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  value      text NOT NULL,
  match_type text NOT NULL CHECK (match_type IN ('email', 'domain')),
  reason     text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX submission_blocklist_value_idx
  ON activities.submission_blocklist (lower(value));

ALTER TABLE activities.submission_blocklist ENABLE ROW LEVEL SECURITY;
GRANT ALL ON activities.submission_blocklist TO service_role;

-- Migration 007: firstyear.ftp_legacy
-- Legacy record of Fourth Trimester Program participants.
-- Populated manually in Supabase; read by n8n to drive the deposit
-- cancellation email flow and to preserve historical participant data.
--
-- The row id (uuid) doubles as the one-time response token embedded in
-- button URLs — no PII in query strings.
-- apply_url / refund_url are written by scripts/generate-deposit-tokens.ts
-- after rows are created, so n8n can read them directly as template variables.
--
-- cohort:  the cohort the participant signed up for (e.g. 'july-2026')
-- status:  tracks deposit outcome — 'pending' | 'deposit' | 'credit' | 'refund' | 'paid'
--
-- Run in Supabase SQL editor (production and test environments separately).

DROP TABLE IF EXISTS firstyear.ftp_legacy;

CREATE TABLE firstyear.ftp_legacy (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  email            text        NOT NULL,
  due_birth_date   date,
  neighborhood     text,
  referral_source  text,
  cohort           text,
  status           text        NOT NULL DEFAULT 'pending',  -- pending | credit | refund | paid
  apply_url        text,
  refund_url       text,
  apply_url_test   text,
  refund_url_test  text,
  responded_at     timestamptz,
  expires_at       timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ftp_legacy_email_idx  ON firstyear.ftp_legacy (email);
CREATE INDEX IF NOT EXISTS ftp_legacy_status_idx ON firstyear.ftp_legacy (status);

CREATE OR REPLACE TRIGGER ftp_legacy_updated_at
  BEFORE UPDATE ON firstyear.ftp_legacy
  FOR EACH ROW EXECUTE FUNCTION firstyear.set_updated_at();

GRANT ALL ON firstyear.ftp_legacy TO service_role;

ALTER TABLE firstyear.ftp_legacy ENABLE ROW LEVEL SECURITY;

-- Auto-populate apply_url and refund_url on insert
CREATE OR REPLACE FUNCTION firstyear.set_ftp_legacy_urls()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.apply_url       := 'https://amsterdamparentproject.nl/api/fyp/deposit-response?token=' || NEW.id || '&action=credit';
  NEW.refund_url      := 'https://amsterdamparentproject.nl/api/fyp/deposit-response?token=' || NEW.id || '&action=refund';
  NEW.apply_url_test  := 'https://feature-ftp-deposit-emails--amsterdamparentproject.netlify.app/api/fyp/deposit-response?token=' || NEW.id || '&action=credit';
  NEW.refund_url_test := 'https://feature-ftp-deposit-emails--amsterdamparentproject.netlify.app/api/fyp/deposit-response?token=' || NEW.id || '&action=refund';
  RETURN NEW;
END;
$$;

CREATE TRIGGER ftp_legacy_set_urls
  BEFORE INSERT ON firstyear.ftp_legacy
  FOR EACH ROW EXECUTE FUNCTION firstyear.set_ftp_legacy_urls();

-- First Year Program schema
-- Run in Supabase SQL editor (production and test environments separately).

CREATE SCHEMA IF NOT EXISTS firstyear;

CREATE TABLE firstyear.accounts (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact
  email                  text NOT NULL,

  -- Stripe
  stripe_customer_id     text UNIQUE,
  stripe_session_id      text UNIQUE NOT NULL,
  stripe_subscription_id text,                      -- monthly flows only

  -- Enrollment
  flow                   text NOT NULL,             -- expecting_monthly | expecting_bundle | baby_monthly | baby_bundle
  plan_type              text NOT NULL,             -- monthly | bundle
  family_type            text NOT NULL,             -- single | multi
  
  -- Timing
  due_or_birth_month     text,                      -- jan–dec; due month for expecting flows, birth month for baby flows
  due_or_birth_year      text,                      -- e.g. "2025"; paired with due_or_birth_month
  billing_start_date     date,                      -- when the program starts; 1st of month after due date (expecting) or today (baby)
  bundle_expires_at      date,                      -- bundle flows: billing_start_date + 6 months

  -- Status
  status                 text NOT NULL DEFAULT 'active',  -- active | canceled

  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION firstyear.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER firstyear_accounts_updated_at
  BEFORE UPDATE ON firstyear.accounts
  FOR EACH ROW EXECUTE FUNCTION firstyear.set_updated_at();

-- Indexes for common lookups
CREATE INDEX ON firstyear.accounts (email);
CREATE INDEX ON firstyear.accounts (stripe_customer_id);
CREATE INDEX ON firstyear.accounts (status);
CREATE INDEX ON firstyear.accounts (flow);
CREATE INDEX ON firstyear.accounts (bundle_expires_at) WHERE bundle_expires_at IS NOT NULL;

-- RLS: service role only (webhook writes, no public reads)
ALTER TABLE firstyear.accounts ENABLE ROW LEVEL SECURITY;

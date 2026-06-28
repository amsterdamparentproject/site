-- Allow email to be null for pending records created at checkout time.
-- The webhook fills in the email once the customer completes payment.
-- Run in Supabase SQL editor (production and test environments separately).

ALTER TABLE firstyear.accounts ALTER COLUMN email DROP NOT NULL;

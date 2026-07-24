-- Migration 010: firstyear.members.whatsapp
--
-- Optional WhatsApp contact number per member, collected from the Hub's
-- account edit UI (not the signup join form) — used so we can reach
-- members in the program's WhatsApp group without relying on the same
-- number as their email/login identity.
--
-- Deliberately nullable, free-text (no phone-format constraint at the DB
-- level) — validation, if any, happens client-side; different members may
-- enter numbers in different international formats and we don't want a
-- rigid CHECK constraint rejecting a legitimate one.
--
-- Run in Supabase SQL editor (production and test environments separately).

ALTER TABLE firstyear.members
  ADD COLUMN IF NOT EXISTS whatsapp text;

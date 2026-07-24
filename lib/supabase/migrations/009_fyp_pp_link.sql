-- Migration 009: firstyear.members.postpartumpost_member_id
--
-- Pins a parent's Postpartum Post member identity once, at activation time
-- (matched-by-email or freshly created via postpartum-post's
-- /api/fyp/activate route) — never re-derived from a live email join
-- afterward. See __claude__/fyp-improvements-plan.md § "Postpartum Post
-- integration (backend)" for why: email doubles as an editable Hub profile
-- field, so a live join on "whatever email is on the profile right now"
-- would let editing that email silently orphan the link.
--
-- Deliberately a plain uuid, NOT a foreign key into postpartumpost.members
-- — even though both schemas currently live in the same Supabase project,
-- the architecture decision (same doc) is that site never queries the
-- postpartumpost schema directly; the two schemas are coupled only through
-- postpartum-post's own API. A cross-schema FK would work at the DB level
-- but contradicts that intentional decoupling, and would break if the two
-- schemas ever end up in separate projects.
--
-- Run in Supabase SQL editor (production and test environments separately).

ALTER TABLE firstyear.members
  ADD COLUMN IF NOT EXISTS postpartumpost_member_id uuid;

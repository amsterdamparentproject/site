-- Add reported flag to directory.groups
-- Marks whether a group has been reported by a directory user.

ALTER TABLE directory.groups
  ADD COLUMN IF NOT EXISTS reported boolean NOT NULL DEFAULT false;

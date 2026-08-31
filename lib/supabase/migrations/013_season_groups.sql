-- Season Groups: cohorts of expecting families grouped by due-date range,
-- surfaced on /season-groups. Represented as ordinary directory.groups rows
-- (categories includes "Season" — see app/types/groups-directory.ts for why
-- it's "Season" and not "Season Groups") with a due date range attached so
-- the page can recommend the right cohort from a visitor's due date.
-- due_start/due_end stay NULL for every group that isn't a Season Group.
--
-- get_groups_directory / get_user_recommendations need no changes: both
-- already return full rows via to_jsonb(), so these columns flow through
-- automatically. See lib/supabase/rpcs/get_season_groups.sql for the public,
-- pre-access listing used by /season-groups itself.
ALTER TABLE directory.groups
  ADD COLUMN due_start date,
  ADD COLUMN due_end date;

COMMENT ON COLUMN directory.groups.due_start IS 'Season Groups only: first due date this cohort covers.';
COMMENT ON COLUMN directory.groups.due_end IS 'Season Groups only: last due date this cohort covers.';

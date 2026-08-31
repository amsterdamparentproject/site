-- Public listing for /season-groups. Unlike get_groups_directory, this
-- takes no uid and requires none: /season-groups is a pre-access splash
-- page for expecting families who may not have Directory access yet.
-- Deliberately omits `link` (and admin/report columns) so invite links
-- are never exposed to a visitor who hasn't gone through the "Join" ->
-- request-access flow. Joining is always via that flow, never a raw link
-- shown on this page — same anti-spam reasoning that gates the rest of
-- the directory.
CREATE OR REPLACE FUNCTION directory.get_season_groups()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    season_groups jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'name', name,
            'description', description,
            'categories', categories,
            'platform', platform,
            'due_start', due_start,
            'due_end', due_end
        )
        ORDER BY due_start ASC NULLS LAST
    ) INTO season_groups
    FROM groups
    WHERE due_start IS NOT NULL;

    RETURN COALESCE(season_groups, '[]'::jsonb);
END;
$$;

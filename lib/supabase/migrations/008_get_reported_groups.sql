-- Public RPC returning all groups currently flagged with a broken link
-- (directory.groups.reported = true). Unlike get_groups_directory, this
-- takes no user_id and requires no auth — it powers the public
-- /groups-directory/broken-links page, which lets anyone (logged in or
-- not) see broken-link groups and submit a fixed invite link.

CREATE OR REPLACE FUNCTION directory.get_reported_groups()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reported_groups jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'name', name,
            'categories', categories,
            'description', description,
            'platform', platform,
            'link', link
        )
        ORDER BY name ASC
    ) INTO reported_groups
    FROM directory.groups
    WHERE reported = true;

    RETURN COALESCE(reported_groups, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION get_user_recommendations(user_id_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_interests text[];
    recommended_groups jsonb;
BEGIN
    -- 1. Get user's interests
    SELECT categories 
    INTO user_interests 
    FROM users 
    WHERE public_id = user_id_input;

    -- 2. Fetch only the groups that match (Case-Insensitive)
    SELECT jsonb_agg(
        to_jsonb(g) || jsonb_build_object('recommended', true)
        ORDER BY g.name ASC
    ) INTO recommended_groups
    FROM groups g
    WHERE EXISTS (
        SELECT 1 
        FROM unnest(g.categories) AS gc
        WHERE LOWER(gc) = ANY (SELECT LOWER(uc) FROM unnest(COALESCE(user_interests, '{}'::text[])) AS uc)
    );

    -- 3. Return the array (or an empty array if no matches)
    RETURN COALESCE(recommended_groups, '[]'::jsonb);
END;
$$;
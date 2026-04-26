CREATE OR REPLACE FUNCTION get_groups_directory(user_id_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_interests text[];
    user_name text;
    user_email text;
    recommended_groups jsonb;
    all_groups jsonb;
BEGIN
    -- 1. Get user details
    SELECT name, email, categories 
    INTO user_name, user_email, user_interests 
    FROM users 
    WHERE public_id = user_id_input;

    -- 2. Fetch recommended groups
    -- '||' merges the original row object with our new boolean
    SELECT jsonb_agg(
        to_jsonb(g) || jsonb_build_object('recommended', true)
        ORDER BY g.name ASC
    ) INTO recommended_groups
    FROM groups g
    WHERE g.categories && COALESCE(user_interests, '{}'::text[]);

    -- 3. Fetch all groups
    SELECT jsonb_agg(
        to_jsonb(a) || jsonb_build_object(
            'recommended', (a.categories && COALESCE(user_interests, '{}'::text[]))
        )
        ORDER BY a.name ASC
    ) INTO all_groups
    FROM groups a;

    -- 4. Final Return
    RETURN jsonb_build_object(
        'recommended', COALESCE(recommended_groups, '[]'::jsonb),
        'all', COALESCE(all_groups, '[]'::jsonb),
        'user_interests', COALESCE(user_interests, '{}'::text[]),
        'user_name', COALESCE(user_name, ''),
        'user_email', COALESCE(user_email, ''),
        'user_email_masked', (
            CASE 
                WHEN user_email LIKE '%@%' THEN
                    SUBSTRING(user_email FROM 1 FOR 2) || '*****' || SUBSTRING(user_email FROM POSITION('@' IN user_email))
                ELSE '***@***.com'
            END
        )
    );
END;
$$;
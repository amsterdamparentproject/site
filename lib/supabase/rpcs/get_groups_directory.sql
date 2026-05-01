CREATE OR REPLACE FUNCTION get_groups_directory(user_id_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_interests text[];
    user_name text;
    user_email text;
    recommended_groups jsonb; -- This will be populated by the other RPC
    all_groups jsonb;
BEGIN
    -- 1. Get user details
    SELECT name, email, categories 
    INTO user_name, user_email, user_interests 
    FROM users 
    WHERE public_id = user_id_input;

    -- 2. Call the second RPC to get recommendations
    -- We pass the same input ID
    recommended_groups := get_user_recommendations(user_id_input);

    -- 3. Fetch all groups (keep the boolean logic here)
    SELECT jsonb_agg(
        to_jsonb(a) || jsonb_build_object(
            'recommended', EXISTS (
                SELECT 1 
                FROM unnest(a.categories) AS ac
                WHERE LOWER(ac) = ANY (SELECT LOWER(uc) FROM unnest(COALESCE(user_interests, '{}'::text[])) AS uc)
            )
        )
        ORDER BY a.name ASC
    ) INTO all_groups
    FROM groups a;

    -- 4. Final Return (Masking logic remains same)
    RETURN jsonb_build_object(
        'recommended', recommended_groups,
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
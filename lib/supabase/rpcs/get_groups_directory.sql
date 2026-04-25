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
    -- 1. Get the name, email, and interests for the user
    SELECT name, email, categories 
    INTO user_name, user_email, user_interests 
    FROM users 
    WHERE public_id = user_id_input;

    -- 2. Fetch recommended groups
    SELECT jsonb_agg(g.* ORDER BY g.name ASC) INTO recommended_groups
    FROM groups g
    WHERE g.categories && COALESCE(user_interests, '{}'::text[]);

    -- 3. Fetch all groups
    SELECT jsonb_agg(all_g.* ORDER BY all_g.name ASC) INTO all_groups
    FROM groups all_g;

    -- 4. Return as a JSON object with user details included
    RETURN jsonb_build_object(
        'recommended', COALESCE(recommended_groups, '[]'::jsonb),
        'all', COALESCE(all_groups, '[]'::jsonb),
        'user_interests', COALESCE(user_interests, '{}'::text[]),
        'user_name', COALESCE(user_name, ''),
        'user_email_masked', (
            SELECT 
                CASE 
                    WHEN user_email LIKE '%@%' THEN
                        -- Take first 2 chars, add 5 stars, then add everything from '@' onwards
                        SUBSTRING(user_email FROM 1 FOR 2) || '*****' || SUBSTRING(user_email FROM POSITION('@' IN user_email))
                    ELSE '***@***.com' -- Fallback for invalid emails
                END
        )
    );
END;
$$;
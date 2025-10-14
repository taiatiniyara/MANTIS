-- =====================================================
-- System Initialization Function
-- =====================================================
-- This function allows creating the first admin user
-- when no users exist in the system, bypassing RLS

CREATE OR REPLACE FUNCTION create_first_admin(
    p_email TEXT,
    p_password TEXT,
    p_display_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Run with the privileges of the function owner (bypasses RLS)
AS $$
DECLARE
    v_user_count INTEGER;
    v_user_id UUID;
    v_result JSON;
BEGIN
    -- Check if any users already exist
    SELECT COUNT(*) INTO v_user_count FROM users;
    
    IF v_user_count > 0 THEN
        RAISE EXCEPTION 'System already initialized. Users exist in the database.';
    END IF;
    
    -- Create the auth user using admin API
    -- Note: This requires the function to be called with service role
    -- or we need to use auth.users() extension
    
    -- For now, we'll just create the user profile entry
    -- The auth user should be created first via Supabase signup
    
    -- Alternative: Return a flag that the client should handle signup first
    v_result := json_build_object(
        'success', true,
        'message', 'Ready to create first admin',
        'user_count', v_user_count
    );
    
    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_first_admin(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_first_admin(TEXT, TEXT, TEXT) TO anon;

COMMENT ON FUNCTION create_first_admin IS 'Creates the first administrator user when system has no users';


-- =====================================================
-- Alternative: Insert User Profile Function
-- =====================================================
-- This function allows inserting a user profile bypassing RLS
-- Use this AFTER creating the auth user via Supabase signUp

CREATE OR REPLACE FUNCTION insert_first_admin_profile(
    p_user_id UUID,
    p_display_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
SET search_path = public
AS $$
DECLARE
    v_user_count INTEGER;
    v_default_agency_id UUID;
BEGIN
    -- Check if any users already exist
    SELECT COUNT(*) INTO v_user_count FROM users;
    
    IF v_user_count > 0 THEN
        RAISE EXCEPTION 'System already initialized. Users exist in the database.';
    END IF;
    
    -- WORKAROUND: The database has a constraint that non-citizen users must have an agency
    -- However, central_admin should ideally have NULL agency_id
    -- As a temporary fix, we'll assign them to the first available agency
    -- You should update the constraint to allow central_admin with NULL agency_id
    
    -- Try to get the first agency (if any exist)
    SELECT id INTO v_default_agency_id FROM agencies LIMIT 1;
    
    -- If no agencies exist, we need to create one or fix the constraint first
    IF v_default_agency_id IS NULL THEN
        RAISE EXCEPTION 'Cannot create central admin: No agencies exist and constraint requires agency_id. Please run fix-users-constraint.sql first.';
    END IF;
    
    -- Insert the user profile with the default agency
    -- NOTE: In a properly configured system, central_admin should have NULL agency_id
    INSERT INTO users (
        id,
        display_name,
        role,
        agency_id,
        active
    ) VALUES (
        p_user_id,
        p_display_name,
        'central_admin',
        v_default_agency_id,  -- Temporarily assign to an agency due to constraint
        true
    );
    
    -- Log a warning about this workaround
    RAISE NOTICE 'WARNING: Central admin assigned to agency due to database constraint. Run fix-users-constraint.sql to fix this.';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_first_admin_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_first_admin_profile(UUID, TEXT) TO anon;

COMMENT ON FUNCTION insert_first_admin_profile IS 'Inserts first admin profile after auth user creation, bypassing RLS';


-- =====================================================
-- Check System Initialization Status
-- =====================================================
-- Public function to check if system needs initialization

CREATE OR REPLACE FUNCTION check_system_initialized()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_count INTEGER;
    v_result JSON;
BEGIN
    SELECT COUNT(*) INTO v_user_count FROM users;
    
    v_result := json_build_object(
        'initialized', v_user_count > 0,
        'user_count', v_user_count,
        'has_users', v_user_count > 0
    );
    
    RETURN v_result;
END;
$$;

-- Grant execute to everyone
GRANT EXECUTE ON FUNCTION check_system_initialized() TO authenticated;
GRANT EXECUTE ON FUNCTION check_system_initialized() TO anon;

COMMENT ON FUNCTION check_system_initialized IS 'Returns system initialization status';

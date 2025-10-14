-- =====================================================
-- System Initialization Functions (v2 - Fixed)
-- =====================================================
-- Run fix-users-constraint.sql BEFORE running this file!
--
-- This version assumes the constraint has been fixed to allow
-- central_admin with NULL agency_id

-- =====================================================
-- Insert First Admin Profile (Fixed Version)
-- =====================================================
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
BEGIN
    -- Check if any users already exist
    SELECT COUNT(*) INTO v_user_count FROM users;
    
    IF v_user_count > 0 THEN
        RAISE EXCEPTION 'System already initialized. Users exist in the database.';
    END IF;
    
    -- Insert the user profile
    -- Central admin has NULL agency_id (manages entire system)
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
        NULL,  -- Central admin has no specific agency
        true
    );
    
    RAISE NOTICE 'First admin profile created successfully with NULL agency_id';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_first_admin_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_first_admin_profile(UUID, TEXT) TO anon;

COMMENT ON FUNCTION insert_first_admin_profile IS 'Inserts first admin profile after auth user creation, bypassing RLS (requires fixed constraint)';


-- =====================================================
-- Check System Initialization Status
-- =====================================================
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


-- =====================================================
-- Verification
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Functions created/updated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'To verify:';
    RAISE NOTICE '  SELECT check_system_initialized();';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Test the system initialization in the web app';
END $$;

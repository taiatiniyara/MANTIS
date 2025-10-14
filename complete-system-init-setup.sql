-- =====================================================
-- COMPLETE SYSTEM INITIALIZATION SETUP
-- =====================================================
-- This script combines all necessary fixes for system initialization
-- Run this ONCE in your Supabase SQL Editor
--
-- What this does:
-- 1. Fixes the users table constraint
-- 2. Creates system initialization functions
-- 3. Verifies everything works
--
-- =====================================================

-- =====================================================
-- PART 1: Fix Users Table Constraint
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'PART 1: Fixing Users Table Constraint';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
END $$;

-- Drop the old constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_officer_must_have_agency;

-- Add the corrected constraint
-- Central admins can have NULL agency_id (they oversee all agencies)
-- Officers and agency_admins must have an agency_id
ALTER TABLE users
ADD CONSTRAINT users_officer_must_have_agency CHECK (
    role IN ('citizen', 'central_admin') OR agency_id IS NOT NULL
);

COMMENT ON CONSTRAINT users_officer_must_have_agency ON users IS 
'Officers and agency admins must have an agency. Central admins and citizens can have NULL agency_id.';

DO $$
BEGIN
    RAISE NOTICE '✓ Constraint updated successfully';
    RAISE NOTICE '  Central admins can now have NULL agency_id';
    RAISE NOTICE '';
END $$;


-- =====================================================
-- PART 2: Create System Initialization Functions
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'PART 2: Creating System Functions';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
END $$;

-- Function to insert first admin profile (bypasses RLS)
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
    
    RAISE NOTICE 'First admin profile created successfully';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_first_admin_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_first_admin_profile(UUID, TEXT) TO anon;

COMMENT ON FUNCTION insert_first_admin_profile IS 'Inserts first admin profile after auth user creation, bypassing RLS';

DO $$
BEGIN
    RAISE NOTICE '✓ Function insert_first_admin_profile() created';
END $$;


-- Function to check system initialization status
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

DO $$
BEGIN
    RAISE NOTICE '✓ Function check_system_initialized() created';
    RAISE NOTICE '';
END $$;


-- =====================================================
-- PART 3: Verification
-- =====================================================
DO $$
DECLARE
    v_constraint_def TEXT;
    v_function_count INTEGER;
    v_status JSON;
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'PART 3: Verification';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    
    -- Check constraint
    SELECT pg_get_constraintdef(oid) INTO v_constraint_def
    FROM pg_constraint 
    WHERE conname = 'users_officer_must_have_agency';
    
    RAISE NOTICE 'Constraint Definition:';
    RAISE NOTICE '  %', v_constraint_def;
    RAISE NOTICE '';
    
    -- Check functions
    SELECT COUNT(*) INTO v_function_count
    FROM information_schema.routines
    WHERE routine_name IN ('insert_first_admin_profile', 'check_system_initialized');
    
    RAISE NOTICE 'Functions Created: % of 2', v_function_count;
    RAISE NOTICE '';
    
    -- Check system status
    SELECT check_system_initialized() INTO v_status;
    RAISE NOTICE 'System Status: %', v_status;
    RAISE NOTICE '';
    
    IF v_function_count = 2 THEN
        RAISE NOTICE '================================================';
        RAISE NOTICE '✅ SUCCESS! Setup Complete';
        RAISE NOTICE '================================================';
        RAISE NOTICE '';
        RAISE NOTICE 'Next Steps:';
        RAISE NOTICE '1. Clear your browser cache';
        RAISE NOTICE '2. Go to the MANTIS web app';
        RAISE NOTICE '3. Navigate to login page';
        RAISE NOTICE '4. Click "Initialize System"';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '================================================';
        RAISE NOTICE '⚠️  WARNING: Not all functions were created';
        RAISE NOTICE '================================================';
        RAISE NOTICE 'Please check for errors above';
    END IF;
END $$;


-- =====================================================
-- Optional: Test the Constraint (Uncomment to test)
-- =====================================================
/*
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'OPTIONAL: Testing Constraint';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    
    -- Test 1: Central admin with NULL agency (should succeed)
    BEGIN
        INSERT INTO users (id, display_name, role, agency_id, active)
        VALUES (gen_random_uuid(), 'Test Central Admin', 'central_admin', NULL, true);
        
        DELETE FROM users WHERE display_name = 'Test Central Admin';
        RAISE NOTICE '✓ Test 1 Passed: Central admin with NULL agency_id works';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Test 1 Failed: %', SQLERRM;
    END;
    
    -- Test 2: Officer with NULL agency (should fail)
    BEGIN
        INSERT INTO users (id, display_name, role, agency_id, active)
        VALUES (gen_random_uuid(), 'Test Officer', 'officer', NULL, true);
        
        DELETE FROM users WHERE display_name = 'Test Officer';
        RAISE NOTICE '✗ Test 2 Failed: Officer with NULL agency_id should not work';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE '✓ Test 2 Passed: Officer with NULL agency_id correctly rejected';
    END;
    
    RAISE NOTICE '';
END $$;
*/

-- System Initialization Testing SQL Scripts
-- Use these scripts to test the system initialization feature

-- =====================================================
-- TEST 1: Check Current User Count
-- =====================================================
-- This query shows how many users currently exist
SELECT COUNT(*) as user_count FROM users;

-- This query shows all users with their roles
SELECT 
    id,
    display_name,
    role,
    agency_id,
    active,
    created_at
FROM users
ORDER BY created_at DESC;

-- =====================================================
-- TEST 2: Clear All Users (DANGER - Development Only!)
-- =====================================================
-- WARNING: This will delete ALL users from the system
-- Only use this in development/testing environments
-- NEVER run this in production!

-- First, disable triggers and constraints temporarily
BEGIN;

-- Delete user profiles
DELETE FROM users;

-- Delete auth users (requires admin privileges)
-- This needs to be done through Supabase Dashboard or API
-- auth.users cannot be directly deleted via SQL for security

COMMIT;

-- Alternative: Clear specific test user
-- DELETE FROM users WHERE id = 'specific-user-id-here';

-- =====================================================
-- TEST 3: Verify First Admin Creation
-- =====================================================
-- After running system initialization, verify the admin was created correctly

-- Check if the admin user exists
SELECT 
    u.id,
    u.display_name,
    u.role,
    u.agency_id,
    u.active,
    u.created_at,
    au.email,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE au.email = 'taiatiniyara@gmail.com';

-- Expected result:
-- display_name: Taia Tiniyara
-- role: central_admin
-- agency_id: NULL (central admin has no specific agency)
-- active: true
-- email: taiatiniyara@gmail.com

-- =====================================================
-- TEST 4: Check User Permissions
-- =====================================================
-- Verify the admin has correct permissions

-- Check if user can access all tables (as central_admin should)
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- TEST 5: Simulate Different User Counts
-- =====================================================

-- Create a test officer user (for testing with 1 user)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'test.officer@police.gov.fj',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);

-- Then create the profile
INSERT INTO users (
    id,
    display_name,
    role,
    agency_id,
    active
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'test.officer@police.gov.fj'),
    'Test Officer',
    'officer',
    (SELECT id FROM agencies WHERE code = 'POLICE' LIMIT 1),
    true
);

-- =====================================================
-- TEST 6: Audit Log Verification
-- =====================================================
-- Check if login/logout events are being logged correctly

SELECT 
    al.id,
    al.action,
    al.entity_type,
    al.created_at,
    u.display_name as actor_name,
    al.new_data
FROM audit_logs al
JOIN users u ON al.actor_user_id = u.id
WHERE al.action IN ('LOGIN', 'LOGOUT')
ORDER BY al.created_at DESC
LIMIT 10;

-- =====================================================
-- TEST 7: Check Agency Assignment
-- =====================================================
-- Verify central admin has no agency (should be NULL)

SELECT 
    u.display_name,
    u.role,
    u.agency_id,
    a.name as agency_name
FROM users u
LEFT JOIN agencies a ON u.agency_id = a.id
WHERE u.role = 'central_admin';

-- Expected: agency_id should be NULL for central_admin

-- =====================================================
-- TEST 8: Cleanup Test Data
-- =====================================================
-- Remove test users after testing

-- Remove specific test user
DELETE FROM users 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('test.officer@police.gov.fj')
);

-- Then remove from auth.users (via Supabase Dashboard)

-- =====================================================
-- TEST 9: Check RLS Policies
-- =====================================================
-- Verify Row Level Security policies are working

-- Check what policies exist for users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- =====================================================
-- TEST 10: System Status Function
-- =====================================================
-- Create a helper function to quickly check system status

CREATE OR REPLACE FUNCTION check_system_status()
RETURNS TABLE (
    total_users BIGINT,
    total_admins BIGINT,
    active_users BIGINT,
    inactive_users BIGINT,
    has_central_admin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_users,
        COUNT(*) FILTER (WHERE role IN ('central_admin', 'agency_admin'))::BIGINT as total_admins,
        COUNT(*) FILTER (WHERE active = true)::BIGINT as active_users,
        COUNT(*) FILTER (WHERE active = false)::BIGINT as inactive_users,
        EXISTS(SELECT 1 FROM users WHERE role = 'central_admin') as has_central_admin
    FROM users;
END;
$$ LANGUAGE plpgsql;

-- Use the function
SELECT * FROM check_system_status();

-- =====================================================
-- TEST 11: Performance Check
-- =====================================================
-- Measure query performance for system status check

EXPLAIN ANALYZE
SELECT COUNT(*) FROM users;

-- Should be very fast (< 1ms for small datasets)

-- =====================================================
-- TEST 12: Concurrent User Creation Test
-- =====================================================
-- Verify that only one initialization can happen

-- This should be tested at the application level
-- by clicking "Initialize System" button multiple times rapidly

-- =====================================================
-- DEVELOPMENT HELPERS
-- =====================================================

-- Quick reset for development (use with caution!)
DO $$
BEGIN
    -- Delete all users
    DELETE FROM users;
    
    -- Reset sequences if needed
    -- (users table uses UUID, so no sequences to reset)
    
    RAISE NOTICE 'System reset complete. User count: %', (SELECT COUNT(*) FROM users);
END $$;

-- Quick check: Is system initialized?
DO $$
DECLARE
    user_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count = 0 THEN
        RAISE NOTICE 'System NOT initialized. No users found.';
    ELSE
        RAISE NOTICE 'System IS initialized. Found % user(s).', user_count;
    END IF;
END $$;

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- Monitor recent user creations
SELECT 
    u.id,
    u.display_name,
    u.role,
    u.created_at,
    au.email,
    au.created_at as auth_created_at,
    EXTRACT(EPOCH FROM (NOW() - u.created_at)) as seconds_ago
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.created_at > NOW() - INTERVAL '1 hour'
ORDER BY u.created_at DESC;

-- Monitor failed authentication attempts
-- (Requires Supabase Auth logs access via Dashboard)

-- Check system health
SELECT 
    'Total Users' as metric,
    COUNT(*)::TEXT as value
FROM users
UNION ALL
SELECT 
    'Active Users',
    COUNT(*)::TEXT
FROM users
WHERE active = true
UNION ALL
SELECT 
    'Central Admins',
    COUNT(*)::TEXT
FROM users
WHERE role = 'central_admin'
UNION ALL
SELECT 
    'Agency Admins',
    COUNT(*)::TEXT
FROM users
WHERE role = 'agency_admin'
UNION ALL
SELECT 
    'Officers',
    COUNT(*)::TEXT
FROM users
WHERE role = 'officer'
UNION ALL
SELECT 
    'Citizens',
    COUNT(*)::TEXT
FROM users
WHERE role = 'citizen';

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- 1. Always backup production data before running any DELETE queries
-- 2. Test scripts should only be run in development/staging environments
-- 3. Use Supabase Dashboard for auth.users management
-- 4. Monitor audit_logs table for security events
-- 5. Check RLS policies are enabled in production
-- 
-- =====================================================

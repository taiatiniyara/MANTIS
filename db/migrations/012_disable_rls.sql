-- ========================================
-- DISABLE ALL RLS POLICIES
-- This removes Row Level Security completely
-- ========================================

-- WARNING: This will make ALL data accessible to ALL authenticated users
-- Only use this if you understand the security implications

-- Step 1: Disable RLS first (this prevents new policies from blocking)
ALTER TABLE IF EXISTS agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS infringement_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS infringement_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS infringements DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on each table (comprehensive list)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables in public schema
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 3: Drop helper functions
DROP FUNCTION IF EXISTS public.user_role() CASCADE;
DROP FUNCTION IF EXISTS public.user_agency_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_agency_admin() CASCADE;

-- Step 4: Grant full access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 5: Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'agencies', 'locations', 'users', 'teams', 'routes',
    'team_routes', 'team_members', 'infringement_categories',
    'infringement_types', 'infringements'
  )
ORDER BY tablename;

-- Expected: All tables should show rls_enabled = false

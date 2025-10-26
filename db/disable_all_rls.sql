-- ============================================================================================
-- Disable ALL Row Level Security (RLS)
-- ============================================================================================
-- This script disables RLS on all tables in the public schema
-- Run this in Supabase SQL Editor
-- ============================================================================================

-- Disable RLS on all tables (skip system tables)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
            RAISE NOTICE 'Disabled RLS on: %', r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on: % (Error: %)', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
ORDER BY tablename;

-- Expected: All tables should show rls_enabled = false

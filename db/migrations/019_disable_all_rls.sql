-- ============================================================================================
-- Migration 019: Disable All Row Level Security (RLS)
-- ============================================================================================
-- This migration disables RLS on all user tables in the public schema
-- Run this if you want to disable RLS enforcement across the entire application
-- ============================================================================================

-- Disable RLS on all tables (skip PostGIS system tables)
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
            RAISE NOTICE 'Disabled RLS on table: %', r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not disable RLS on table %: %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Optional: Drop all existing RLS policies (uncomment if you want to remove policies entirely)
/*
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                r.policyname, r.schemaname, r.tablename);
            RAISE NOTICE 'Dropped policy % on table %', r.policyname, r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop policy % on table %: %', 
                r.policyname, r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;
*/

-- Verify RLS status
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
ORDER BY tablename;

-- ========================================
-- DIAGNOSTIC QUERIES - Run in Supabase SQL Editor
-- ========================================

-- 1. Check if helper functions exist and work
SELECT 
  'user_role' as function_name,
  public.user_role() as result;

SELECT 
  'user_agency_id' as function_name,
  public.user_agency_id() as result;

SELECT 
  'is_super_admin' as function_name,
  public.is_super_admin() as result;

SELECT 
  'is_agency_admin' as function_name,
  public.is_agency_admin() as result;

-- 2. Check current auth user
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_email;

-- 3. Check if user exists in users table
SELECT 
  id,
  email,
  role,
  agency_id,
  created_at
FROM users 
WHERE id = auth.uid();

-- 4. List all policies on infringement_categories table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'infringement_categories';

-- 5. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'agencies',
    'users', 
    'infringement_categories',
    'infringement_types',
    'infringements'
  );

-- 6. Test direct query (bypassing RLS temporarily)
SELECT count(*) as category_count 
FROM infringement_categories;

-- ========================================
-- EXPECTED RESULTS:
-- ========================================
-- 1. Functions should return your role, agency_id, and true for is_super_admin
-- 2. Should show your user ID and email
-- 3. Should show your user record with role='super_admin' or 'agency_admin'
-- 4. Should show at least 4 policies for infringement_categories
-- 5. All tables should have rowsecurity=true
-- 6. Should show number of categories (might fail with permission error)

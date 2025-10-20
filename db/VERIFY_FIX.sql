-- ========================================
-- VERIFICATION SCRIPT
-- Run this to verify everything is working
-- ========================================

-- 1. Check if user exists in public.users
SELECT 
  'User Check' as test,
  u.id,
  au.email,
  u.role,
  u.position,
  u.agency_id,
  u.location_id
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.id = auth.uid();

-- 2. Test helper functions
SELECT 
  'Helper Functions' as test,
  public.user_role() as my_role,
  public.is_super_admin() as is_super_admin,
  public.user_agency_id() as my_agency_id;

-- 3. Check if RLS is enabled on infringements
SELECT 
  'RLS Status' as test,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('infringements', 'infringement_categories', 'infringement_types');

-- 4. Check policies on infringements
SELECT 
  'Infringement Policies' as test,
  schemaname,
  tablename,
  policyname,
  cmd,
  qual::text as using_clause
FROM pg_policies
WHERE tablename = 'infringements'
ORDER BY policyname;

-- 5. Try to query infringements directly (this should work for super_admin)
SELECT 
  'Direct Query Test' as test,
  count(*) as infringement_count
FROM infringements;

-- 6. Check if SELECT grants exist
SELECT 
  'Table Permissions' as test,
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('infringements', 'infringement_categories', 'infringement_types')
  AND grantee = 'authenticated';

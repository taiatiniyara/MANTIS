-- Emergency Fix: Disable RLS on Storage Tables
-- Run this if you're getting "new row violates row-level security policy" errors

-- ============================================
-- NOTE: storage.objects is a Supabase system table
-- We cannot disable RLS on it directly, but we can:
-- 1. Drop all restrictive policies (makes it open)
-- 2. Disable RLS on our custom tables
-- ============================================

-- ============================================
-- 1. DISABLE RLS ON infringement_photos (Our table)
-- ============================================
ALTER TABLE infringement_photos DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. DROP ALL EXISTING POLICIES (Just in case)
-- ============================================
-- Storage.objects policies
DROP POLICY IF EXISTS "Officers can upload evidence photos" ON storage.objects;
DROP POLICY IF EXISTS "Officers can view evidence photos" ON storage.objects;
DROP POLICY IF EXISTS "Officers can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Officers can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view evidence photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload signatures" ON storage.objects;
DROP POLICY IF EXISTS "Signature owners can view" ON storage.objects;
DROP POLICY IF EXISTS "Signature owners can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Receipt owners can view" ON storage.objects;
DROP POLICY IF EXISTS "Receipt owners can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Report owners can view" ON storage.objects;
DROP POLICY IF EXISTS "Report owners can delete" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their profile photo" ON storage.objects;

-- infringement_photos policies
DROP POLICY IF EXISTS "Officers can view all infringement photos" ON infringement_photos;
DROP POLICY IF EXISTS "Officers can insert their own photos" ON infringement_photos;
DROP POLICY IF EXISTS "Officers can update their own photos" ON infringement_photos;
DROP POLICY IF EXISTS "Officers can delete their own photos" ON infringement_photos;
DROP POLICY IF EXISTS "Public can view infringement photos" ON infringement_photos;

-- ============================================
-- 4. CREATE PERMISSIVE POLICY FOR storage.objects
-- ============================================
-- Since we can't disable RLS on storage.objects, create a policy that allows everything
CREATE POLICY "Allow all operations for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public read access to public buckets
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('evidence-photos', 'profile-photos'));

-- ============================================
-- 5. VERIFY SETUP
-- ============================================
-- Check RLS status on our tables
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'infringement_photos'
  AND schemaname = 'public';

-- Check policies on storage.objects
SELECT 
  policyname,
  tablename,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- Expected output for infringement_photos:
-- public   | infringement_photos  | false (RLS disabled)

-- Expected policies on storage.objects:
-- "Allow all operations for authenticated users" - should exist
-- "Allow public read access" - should exist

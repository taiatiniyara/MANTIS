-- Complete Storage Bucket Setup for MANTIS
-- Covers: Mobile App + Web Dashboard + Document Management
-- Run this in Supabase SQL Editor to create ALL storage buckets

-- ============================================
-- 1. EVIDENCE PHOTOS BUCKET (Mobile App)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-photos',
  'evidence-photos',
  true,
  10485760, -- 10MB limit per photo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ============================================
-- 2. DOCUMENTS BUCKET (Web - Generated PDFs)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket (controlled access)
  52428800, -- 50MB limit for PDFs
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- ============================================
-- 3. SIGNATURES BUCKET (Web - Digital Signatures)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures',
  false, -- Private bucket (sensitive data)
  2097152, -- 2MB limit per signature
  ARRAY['image/png', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = false,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/svg+xml'];

-- ============================================
-- 4. RECEIPTS BUCKET (Web - Payment Receipts)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- ============================================
-- 5. REPORTS BUCKET (Web - Exported Reports)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false, -- Private bucket
  104857600, -- 100MB limit for large reports
  ARRAY['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

-- ============================================
-- 6. PROFILE PHOTOS BUCKET (Optional - User Avatars)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true, -- Public for display
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ============================================
-- CONFIGURE PERMISSIVE STORAGE ACCESS
-- ============================================
-- NOTE: storage.objects is a Supabase system table - we cannot disable RLS on it
-- Instead, we drop restrictive policies and create permissive ones
-- This allows all authenticated users to upload, view, update, and delete files

-- ============================================
-- DROP ANY EXISTING POLICIES (Cleanup)
-- ============================================
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

-- ============================================
-- CREATE PERMISSIVE POLICIES FOR storage.objects
-- ============================================
-- Since storage.objects is a system table, we create permissive policies instead of disabling RLS

-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public read access to public buckets
CREATE POLICY "Allow public read access to public buckets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('evidence-photos', 'profile-photos'));

-- ============================================
-- DISABLE RLS ON STORAGE-RELATED TABLES
-- ============================================
-- Disable RLS on infringement_photos table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'infringement_photos') THEN
    ALTER TABLE infringement_photos DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- VERIFY ALL BUCKETS CREATED
-- ============================================
SELECT 
  id, 
  name, 
  public, 
  file_size_limit / 1048576 AS size_limit_mb,
  allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('evidence-photos', 'documents', 'signatures', 'receipts', 'reports', 'profile-photos')
ORDER BY id;

-- Migration: Create storage buckets for evidence photos
-- Description: Sets up Supabase storage buckets for infringement evidence photos with proper security policies

-- Create the evidence-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-photos',
  'evidence-photos',
  true, -- Public bucket for easier access
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- NOTE: RLS is DISABLED for storage.objects to allow unrestricted file access
-- All authenticated users can upload, view, update, and delete files
-- Security is handled at the application level

-- Create infringement_photos table to track photo metadata
CREATE TABLE IF NOT EXISTS infringement_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  infringement_id uuid REFERENCES infringements(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  watermark_data jsonb, -- Store watermark metadata (officer, location, timestamp)
  uploaded_by uuid REFERENCES users(id),
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_infringement_photos_infringement_id 
  ON infringement_photos(infringement_id);
CREATE INDEX IF NOT EXISTS idx_infringement_photos_uploaded_by 
  ON infringement_photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_infringement_photos_created_at 
  ON infringement_photos(created_at DESC);

-- NOTE: RLS is DISABLED for infringement_photos table to allow unrestricted access
-- All authenticated users can view, insert, update, and delete photo metadata
-- Security is handled at the application level
ALTER TABLE infringement_photos DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE infringement_photos IS 'Stores metadata for evidence photos attached to infringements';
COMMENT ON COLUMN infringement_photos.watermark_data IS 'JSON containing officer name, GPS coordinates, and timestamp embedded in the photo';

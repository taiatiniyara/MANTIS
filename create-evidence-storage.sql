-- Create storage bucket for evidence (photos/documents)
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload evidence
CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

-- Allow authenticated users to view evidence
CREATE POLICY "Authenticated users can view evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence');

-- Allow users to delete their own agency's evidence
CREATE POLICY "Officers can delete their agency evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidence' AND
  EXISTS (
    SELECT 1 FROM infringements i
    JOIN users u ON u.id = auth.uid()
    WHERE i.id::text = (string_to_array(name, '/'))[1]
    AND i.issuing_agency_id = u.agency_id
  )
);

COMMENT ON TABLE storage.buckets IS 'Storage buckets including evidence bucket for infringement photos';

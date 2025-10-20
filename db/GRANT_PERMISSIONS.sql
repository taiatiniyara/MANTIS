-- ========================================
-- GRANT PERMISSIONS FIX
-- Run this to grant table permissions to authenticated users
-- ========================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant usage on sequences (for auto-increment IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify grants
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
ORDER BY table_name, privilege_type;

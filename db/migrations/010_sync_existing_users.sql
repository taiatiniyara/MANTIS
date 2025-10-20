-- ============================================================================================
-- Sync Existing Auth Users
-- ============================================================================================
-- This script creates records in public.users for any auth.users that don't have one yet
-- Run this AFTER running migration 009
-- ============================================================================================

-- Insert missing users from auth.users into public.users
INSERT INTO public.users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  NULL,                -- No agency assigned yet
  'officer',           -- Default role is officer  
  'Pending Assignment', -- Default position
  NULL                 -- No location assigned yet
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Display results
DO $$
DECLARE
  synced_count INTEGER;
  total_auth_users INTEGER;
  total_public_users INTEGER;
BEGIN
  -- Count how many were synced
  SELECT COUNT(*) INTO total_auth_users FROM auth.users;
  SELECT COUNT(*) INTO total_public_users FROM public.users;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'User Sync Complete';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total auth.users: %', total_auth_users;
  RAISE NOTICE 'Total public.users: %', total_public_users;
  RAISE NOTICE '==============================================';
  
  IF total_auth_users = total_public_users THEN
    RAISE NOTICE 'SUCCESS: All auth users have profiles!';
  ELSE
    RAISE WARNING 'MISMATCH: Some auth users may be missing profiles';
  END IF;
END $$;

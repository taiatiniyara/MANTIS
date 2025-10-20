-- ========================================
-- Emergency User Sync - Run this if you get permission errors
-- ========================================
-- This syncs your auth user to the public.users table

-- Insert or update the current logged-in user
INSERT INTO public.users (
  id,
  role,
  position,
  created_at
)
SELECT 
  id,
  CASE 
    WHEN email LIKE '%admin%' THEN 'super_admin'
    ELSE 'officer'
  END as role,
  'System Administrator' as position,
  created_at
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) 
DO UPDATE SET
  role = 'super_admin',
  position = 'System Administrator';

-- Verify the user was created/updated
SELECT 
  u.id,
  au.email,
  u.role,
  u.position,
  u.agency_id,
  u.location_id
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.id = auth.uid();

-- ========================================
-- Expected Result:
-- Should show your user with role='super_admin'
-- If agency_id is NULL, that's okay for super_admin
-- ========================================

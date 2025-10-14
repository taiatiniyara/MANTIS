-- ============================================================================
-- Quick User Profile Creation Script
-- ============================================================================
-- After creating users in Supabase Auth Dashboard, run this script
-- Replace the UUIDs with actual auth.users IDs

-- Step 1: Check what auth users exist
SELECT 
  id, 
  email, 
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Step 2: Create user profiles
-- Copy this template for each user and update the values

-- TEMPLATE:
-- INSERT INTO users (id, agency_id, role, display_name, driver_licence_number, phone, active) 
-- VALUES (
--   'paste-auth-user-id-here',          -- From auth.users.id
--   'agency-uuid-or-null',               -- Agency ID (NULL for central_admin and citizen)
--   'role_name',                         -- officer, agency_admin, central_admin, or citizen
--   'Display Name Here',                 -- User's full name
--   'DL123456',                          -- Driver license (NULL for non-citizens)
--   '+679 999 0000',                     -- Phone number
--   true                                 -- Active status
-- );

-- Example: Central Admin (no agency)
INSERT INTO users (id, agency_id, role, display_name, driver_licence_number, phone, active) 
VALUES (
  'YOUR-ADMIN-UUID-HERE',
  NULL,
  'central_admin',
  'System Administrator',
  NULL,
  '+679 999 0001',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  active = EXCLUDED.active;

-- Example: Police Officer
INSERT INTO users (id, agency_id, role, display_name, driver_licence_number, phone, active) 
VALUES (
  'YOUR-POLICE-OFFICER-UUID-HERE',
  'a1111111-1111-1111-1111-111111111111',  -- Fiji Police Force
  'officer',
  'Officer John Tiko',
  NULL,
  '+679 999 0002',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  agency_id = EXCLUDED.agency_id,
  active = EXCLUDED.active;

-- Example: LTA Officer
INSERT INTO users (id, agency_id, role, display_name, driver_licence_number, phone, active) 
VALUES (
  'YOUR-LTA-OFFICER-UUID-HERE',
  'a2222222-2222-2222-2222-222222222222',  -- Land Transport Authority
  'officer',
  'Officer Maria Vuki',
  NULL,
  '+679 999 0003',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  agency_id = EXCLUDED.agency_id,
  active = EXCLUDED.active;

-- Example: Agency Admin
INSERT INTO users (id, agency_id, role, display_name, driver_licence_number, phone, active) 
VALUES (
  'YOUR-AGENCY-ADMIN-UUID-HERE',
  'a1111111-1111-1111-1111-111111111111',  -- Fiji Police Force
  'agency_admin',
  'Police Admin Singh',
  NULL,
  '+679 999 0004',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  agency_id = EXCLUDED.agency_id,
  active = EXCLUDED.active;

-- Example: Citizen
INSERT INTO users (id, agency_id, role, display_name, driver_licence_number, phone, active) 
VALUES (
  'YOUR-CITIZEN-UUID-HERE',
  NULL,  -- Citizens don't belong to agencies
  'citizen',
  'John Citizen',
  'DL123456',
  '+679 999 0005',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  driver_licence_number = EXCLUDED.driver_licence_number,
  active = EXCLUDED.active;

-- Step 3: Verify users were created
SELECT 
  u.id,
  u.display_name,
  u.role,
  a.name as agency_name,
  u.phone,
  u.active,
  au.email
FROM users u
LEFT JOIN agencies a ON u.agency_id = a.id
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.role, u.display_name;

-- Step 4: Check if any auth users don't have profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN u.id IS NULL THEN '❌ Missing Profile' ELSE '✅ Has Profile' END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- ============================================================================
-- Quick Reference: Agency IDs
-- ============================================================================
-- Fiji Police Force:        a1111111-1111-1111-1111-111111111111
-- Land Transport Authority: a2222222-2222-2222-2222-222222222222
-- Suva City Council:        a3333333-3333-3333-3333-333333333333

-- ============================================================================
-- Roles:
-- ============================================================================
-- 'central_admin'  - Full system access, no agency
-- 'agency_admin'   - Manage agency users and data
-- 'officer'        - Create infringements, process payments
-- 'citizen'        - View own data only, use mobile app

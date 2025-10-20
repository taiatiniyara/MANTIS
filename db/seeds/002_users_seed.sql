-- ============================
-- SEED USERS FOR MANTIS
-- ============================
-- This file creates test users with different roles for development and testing
-- 
-- IMPORTANT: In production, users should be created through the sign-up flow
-- These test users use a simple password: "Password123!"
--
-- Users Created:
-- 1. Super Admin - full system access
-- 2. Agency Admins - one for each major agency
-- 3. Officers - field users for testing
-- ============================

-- ============================
-- CREATE AUTH USERS
-- ============================
-- Note: In Supabase, we need to use the auth.users table
-- The password hash below is for "Password123!" 
-- In a real environment, use Supabase Dashboard or API to create users

-- Super Admin User
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@mantis.gov.fj',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Fiji Police Force - Agency Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'fpf.admin@mantis.gov.fj',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Land Transport Authority - Agency Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'lta.admin@mantis.gov.fj',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Suva City Council - Agency Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'suva.admin@mantis.gov.fj',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Police Officers
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'officer.john@fpf.gov.fj',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'officer.sarah@fpf.gov.fj',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- LTA Officers
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'inspector.mike@lta.gov.fj',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- ============================
-- LINK USERS TO AGENCIES
-- ============================

-- Super Admin (no agency assignment - has access to all)
INSERT INTO users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  NULL,
  'super_admin',
  'System Administrator',
  NULL
FROM auth.users au
WHERE au.email = 'admin@mantis.gov.fj'
ON CONFLICT (id) DO NOTHING;

-- Fiji Police Force - Agency Admin
INSERT INTO users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  a.id,
  'agency_admin',
  'Chief Inspector',
  (SELECT l.id FROM locations l WHERE l.agency_id = a.id AND l.name = 'Central Division' LIMIT 1)
FROM auth.users au
CROSS JOIN agencies a
WHERE au.email = 'fpf.admin@mantis.gov.fj'
  AND a.name = 'Fiji Police Force'
ON CONFLICT (id) DO NOTHING;

-- Land Transport Authority - Agency Admin
INSERT INTO users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  a.id,
  'agency_admin',
  'Senior Transport Officer',
  (SELECT l.id FROM locations l WHERE l.agency_id = a.id AND l.name = 'Central Region' LIMIT 1)
FROM auth.users au
CROSS JOIN agencies a
WHERE au.email = 'lta.admin@mantis.gov.fj'
  AND a.name = 'Land Transport Authority'
ON CONFLICT (id) DO NOTHING;

-- Suva City Council - Agency Admin
INSERT INTO users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  a.id,
  'agency_admin',
  'City Parking Manager',
  (SELECT l.id FROM locations l WHERE l.agency_id = a.id AND l.type = 'council' LIMIT 1)
FROM auth.users au
CROSS JOIN agencies a
WHERE au.email = 'suva.admin@mantis.gov.fj'
  AND a.name = 'Suva City Council'
ON CONFLICT (id) DO NOTHING;

-- Police Officer - John
INSERT INTO users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  a.id,
  'officer',
  'Police Constable',
  (SELECT l.id FROM locations l WHERE l.agency_id = a.id AND l.name = 'Central Division' LIMIT 1)
FROM auth.users au
CROSS JOIN agencies a
WHERE au.email = 'officer.john@fpf.gov.fj'
  AND a.name = 'Fiji Police Force'
ON CONFLICT (id) DO NOTHING;

-- Police Officer - Sarah
INSERT INTO users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  a.id,
  'officer',
  'Police Corporal',
  (SELECT l.id FROM locations l WHERE l.agency_id = a.id AND l.name = 'Western Division' LIMIT 1)
FROM auth.users au
CROSS JOIN agencies a
WHERE au.email = 'officer.sarah@fpf.gov.fj'
  AND a.name = 'Fiji Police Force'
ON CONFLICT (id) DO NOTHING;

-- LTA Inspector - Mike
INSERT INTO users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  a.id,
  'officer',
  'Transport Inspector',
  (SELECT l.id FROM locations l WHERE l.agency_id = a.id AND l.name = 'Central Region' LIMIT 1)
FROM auth.users au
CROSS JOIN agencies a
WHERE au.email = 'inspector.mike@lta.gov.fj'
  AND a.name = 'Land Transport Authority'
ON CONFLICT (id) DO NOTHING;

-- ============================
-- VERIFICATION QUERY
-- ============================
-- Uncomment to verify the seeded users:
/*
SELECT 
  au.email,
  u.role,
  u.position,
  a.name as agency,
  l.name as location
FROM users u
JOIN auth.users au ON u.id = au.id
LEFT JOIN agencies a ON u.agency_id = a.id
LEFT JOIN locations l ON u.location_id = l.id
ORDER BY 
  CASE u.role 
    WHEN 'super_admin' THEN 1 
    WHEN 'agency_admin' THEN 2 
    WHEN 'officer' THEN 3 
  END,
  au.email;
*/

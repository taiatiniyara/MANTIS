-- ============================================================================================
-- MANTIS Complete Database Setup - Seeds EVERYTHING
-- ============================================================================================
-- This SQL seeds agencies, locations, and users in the correct order
-- Run this in Supabase SQL Editor
-- ============================================================================================

-- Step 1: Temporarily disable RLS on all tables
ALTER TABLE public.agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================================================================
-- Step 2: Seed Agencies
-- ============================================================================================

INSERT INTO public.agencies (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Fiji Police Force'),
  ('22222222-2222-2222-2222-222222222222', 'Land Transport Authority'),
  ('33333333-3333-3333-3333-333333333333', 'Suva City Council'),
  ('44444444-4444-4444-4444-444444444444', 'Lautoka City Council'),
  ('55555555-5555-5555-5555-555555555555', 'Nadi Town Council'),
  ('66666666-6666-6666-6666-666666666666', 'Labasa Town Council')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================================================
-- Step 3: Seed Locations
-- ============================================================================================

-- Police Divisions
INSERT INTO public.locations (id, agency_id, type, name) VALUES
  ('10000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'division', 'Central Division'),
  ('10000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'division', 'Western Division'),
  ('10000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'division', 'Northern Division'),
  ('10000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'division', 'Eastern Division')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- LTA Regions
INSERT INTO public.locations (id, agency_id, type, name) VALUES
  ('20000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'region', 'Central Region'),
  ('20000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'region', 'Western Region'),
  ('20000002-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'region', 'Northern Region')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================================================
-- Step 4: Seed Users
-- ============================================================================================

-- Admin user (super_admin) - No agency needed
INSERT INTO public.users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  NULL,
  'super_admin',
  'System Administrator',
  NULL
FROM auth.users au
WHERE au.email = 'admin@mantis.gov.fj'
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, 
    position = EXCLUDED.position;

-- FPF Admin (agency_admin for Fiji Police Force)
INSERT INTO public.users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'agency_admin',
  'Chief Inspector',
  '10000001-0000-0000-0000-000000000001'::uuid
FROM auth.users au
WHERE au.email = 'fpf.admin@mantis.gov.fj'
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, 
    position = EXCLUDED.position,
    agency_id = EXCLUDED.agency_id,
    location_id = EXCLUDED.location_id;

-- LTA Admin (agency_admin for Land Transport Authority)
INSERT INTO public.users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'agency_admin',
  'Senior Transport Officer',
  '20000002-0000-0000-0000-000000000001'::uuid
FROM auth.users au
WHERE au.email = 'lta.admin@mantis.gov.fj'
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, 
    position = EXCLUDED.position,
    agency_id = EXCLUDED.agency_id,
    location_id = EXCLUDED.location_id;

-- Suva City Council Admin (agency_admin)
INSERT INTO public.users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'agency_admin',
  'City Parking Manager',
  NULL
FROM auth.users au
WHERE au.email = 'suva.admin@mantis.gov.fj'
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, 
    position = EXCLUDED.position,
    agency_id = EXCLUDED.agency_id,
    location_id = EXCLUDED.location_id;

-- Officer John (Fiji Police Force)
INSERT INTO public.users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'officer',
  'Police Constable',
  '10000001-0000-0000-0000-000000000001'::uuid
FROM auth.users au
WHERE au.email = 'officer.john@fpf.gov.fj'
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, 
    position = EXCLUDED.position,
    agency_id = EXCLUDED.agency_id,
    location_id = EXCLUDED.location_id;

-- Officer Sarah (Fiji Police Force)
INSERT INTO public.users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'officer',
  'Police Corporal',
  '10000001-0000-0000-0000-000000000002'::uuid
FROM auth.users au
WHERE au.email = 'officer.sarah@fpf.gov.fj'
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, 
    position = EXCLUDED.position,
    agency_id = EXCLUDED.agency_id,
    location_id = EXCLUDED.location_id;

-- Inspector Mike (Land Transport Authority)
INSERT INTO public.users (id, agency_id, role, position, location_id)
SELECT 
  au.id,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'officer',
  'Transport Inspector',
  '20000002-0000-0000-0000-000000000001'::uuid
FROM auth.users au
WHERE au.email = 'inspector.mike@lta.gov.fj'
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, 
    position = EXCLUDED.position,
    agency_id = EXCLUDED.agency_id,
    location_id = EXCLUDED.location_id;

-- ============================================================================================
-- Step 5: Re-enable RLS on all tables
-- ============================================================================================

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================================
-- Step 6: Verify everything was created
-- ============================================================================================

-- Count agencies
SELECT 'Agencies' as table_name, COUNT(*) as count FROM public.agencies
UNION ALL
SELECT 'Locations' as table_name, COUNT(*) as count FROM public.locations
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users;

-- Show all users with their agencies
SELECT 
  u.id,
  au.email,
  u.role,
  u.position,
  a.name as agency_name,
  l.name as location_name
FROM public.users u
JOIN auth.users au ON au.id = u.id
LEFT JOIN public.agencies a ON a.id = u.agency_id
LEFT JOIN public.locations l ON l.id = u.location_id
ORDER BY 
  CASE u.role 
    WHEN 'super_admin' THEN 1 
    WHEN 'agency_admin' THEN 2 
    WHEN 'officer' THEN 3 
  END,
  au.email;

-- ============================================================================================
-- Expected Result:
-- ============================================================================================
-- First query should show:
--   Agencies: 6
--   Locations: 7
--   Users: 7
--
-- Second query should show all 7 users with their full details
--
-- If you see this, EVERYTHING IS WORKING! 🎉
--
-- Test login at: http://localhost:3001/auth/login
-- Email: admin@mantis.gov.fj
-- Password: Password123!
-- ============================================================================================

-- ============================================================================
-- MANTIS Database Seed Data
-- ============================================================================
-- This script creates sample data for testing the MANTIS system
-- Run this after deploying the schema.sql

-- ============================================================================
-- AGENCIES
-- ============================================================================

INSERT INTO agencies (id, name, code, active) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Fiji Police Force', 'POLICE', true),
  ('a2222222-2222-2222-2222-222222222222', 'Land Transport Authority', 'LTA', true),
  ('a3333333-3333-3333-3333-333333333333', 'Suva City Council', 'SUVA_CC', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- USERS (Profiles - auth.users must be created via Supabase Auth first)
-- ============================================================================
-- Instructions: 
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create users with these emails:
--    - admin@mantis.gov.fj (password: Admin123!)
--    - officer1@police.gov.fj (password: Officer123!)
--    - officer2@lta.gov.fj (password: Officer123!)
--    - admin@police.gov.fj (password: Admin123!)
--    - citizen@example.com (password: Citizen123!)
-- 3. Copy their UUIDs and update the INSERT statements below
-- 4. Run this seed script

-- Example user profiles (replace UUIDs with actual auth.users IDs)
-- Uncomment and update after creating auth users:

/*
INSERT INTO users (id, agency_id, role, display_name, driver_licence_number, phone, active) VALUES
  -- Central Admin (no agency)
  ('replace-with-auth-user-id-1', NULL, 'central_admin', 'System Administrator', NULL, '+679 999 0001', true),
  
  -- Police Officer
  ('replace-with-auth-user-id-2', 'a1111111-1111-1111-1111-111111111111', 'officer', 'Officer John Tiko', NULL, '+679 999 0002', true),
  
  -- LTA Officer
  ('replace-with-auth-user-id-3', 'a2222222-2222-2222-2222-222222222222', 'officer', 'Officer Maria Vuki', NULL, '+679 999 0003', true),
  
  -- Agency Admin (Police)
  ('replace-with-auth-user-id-4', 'a1111111-1111-1111-1111-111111111111', 'agency_admin', 'Police Admin Singh', NULL, '+679 999 0004', true),
  
  -- Citizen
  ('replace-with-auth-user-id-5', NULL, 'citizen', 'John Citizen', 'DL123456', '+679 999 0005', true)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- OFFENCES CATALOG
-- ============================================================================

INSERT INTO offences (id, code, description, base_fine_amount, category, active) VALUES
  ('o1111111-1111-1111-1111-111111111111', 'SPD001', 'Speeding in 50km/h zone', 150.00, 'speeding', true),
  ('o2222222-2222-2222-2222-222222222222', 'SPD002', 'Speeding in 80km/h zone', 300.00, 'speeding', true),
  ('o3333333-3333-3333-3333-333333333333', 'PARK001', 'Illegal parking', 75.00, 'parking', true),
  ('o4444444-4444-4444-4444-444444444444', 'PARK002', 'Parking in disabled bay', 200.00, 'parking', true),
  ('o5555555-5555-5555-5555-555555555555', 'LIC001', 'Expired warrant of fitness', 450.00, 'license', true),
  ('o6666666-6666-6666-6666-666666666666', 'SAFE001', 'Seatbelt violation', 200.00, 'safety', true),
  ('o7777777-7777-7777-7777-777777777777', 'SAFE002', 'Mobile phone while driving', 300.00, 'safety', true),
  ('o8888888-8888-8888-8888-888888888888', 'LIC002', 'Driving without license', 500.00, 'license', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- VEHICLES (Sample vehicles)
-- ============================================================================

INSERT INTO vehicles (id, reg_number, owner_user_id, make, model, year, color, active) VALUES
  ('v1111111-1111-1111-1111-111111111111', 'FH1289', NULL, 'Toyota', 'Corolla', 2020, 'White', true),
  ('v2222222-2222-2222-2222-222222222222', 'LG4421', NULL, 'Nissan', 'March', 2018, 'Blue', true),
  ('v3333333-3333-3333-3333-333333333333', 'MT0932', NULL, 'Holden', 'Commodore', 2015, 'Black', true),
  ('v4444444-4444-4444-4444-444444444444', 'CE3330', NULL, 'Ford', 'Ranger', 2019, 'Silver', true),
  ('v5555555-5555-5555-5555-555555555555', 'HA9876', NULL, 'Honda', 'Civic', 2021, 'Red', true)
ON CONFLICT (reg_number) DO NOTHING;

-- ============================================================================
-- SAMPLE INFRINGEMENTS (Requires actual user IDs from auth.users)
-- ============================================================================
-- Uncomment and update after creating auth users:

/*
INSERT INTO infringements (
  id, infringement_number, issuing_agency_id, officer_user_id, vehicle_id,
  driver_licence_number, offence_id, fine_amount, status, 
  location_description, issued_at
) VALUES
  (
    'i1111111-1111-1111-1111-111111111111',
    'INF-2025-000001',
    'a1111111-1111-1111-1111-111111111111', -- Police
    'replace-with-officer-user-id',
    'v1111111-1111-1111-1111-111111111111', -- FH1289
    'DL123456',
    'o2222222-2222-2222-2222-222222222222', -- Speeding 80km
    300.00,
    'issued',
    'Kings Road, Suva',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'i2222222-2222-2222-2222-222222222222',
    'INF-2025-000002',
    'a3333333-3333-3333-3333-333333333333', -- Suva CC
    'replace-with-officer-user-id',
    'v2222222-2222-2222-2222-222222222222', -- LG4421
    'DL789012',
    'o3333333-3333-3333-3333-333333333333', -- Illegal parking
    75.00,
    'disputed',
    'Victoria Parade, Suva',
    NOW() - INTERVAL '1 day'
  ),
  (
    'i3333333-3333-3333-3333-333333333333',
    'INF-2025-000003',
    'a2222222-2222-2222-2222-222222222222', -- LTA
    'replace-with-officer-user-id',
    'v3333333-3333-3333-3333-333333333333', -- MT0932
    NULL,
    'o5555555-5555-5555-5555-555555555555', -- Expired warrant
    450.00,
    'issued',
    'LTA Office, Suva',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (infringement_number) DO NOTHING;
*/

-- ============================================================================
-- SAMPLE PAYMENTS (Requires actual infringement and user IDs)
-- ============================================================================
-- Uncomment after creating infringements:

/*
INSERT INTO payments (
  id, infringement_id, amount, method, provider_ref,
  status, receipt_number, paid_by_user_id, paid_at
) VALUES
  (
    'p1111111-1111-1111-1111-111111111111',
    'i3333333-3333-3333-3333-333333333333',
    450.00,
    'mpaisa',
    'MP20250001234',
    'success',
    'RCP-2025-000001',
    'replace-with-citizen-user-id',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (receipt_number) DO NOTHING;

-- Update the infringement status to paid
UPDATE infringements 
SET status = 'paid'
WHERE id = 'i3333333-3333-3333-3333-333333333333';
*/

-- ============================================================================
-- SAMPLE DISPUTES (Requires actual infringement and user IDs)
-- ============================================================================
-- Uncomment after creating infringements:

/*
INSERT INTO disputes (
  id, infringement_id, citizen_user_id, reason, status
) VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'i2222222-2222-2222-2222-222222222222',
    'replace-with-citizen-user-id',
    'I was not parking illegally. There were no signs indicating no parking zone.',
    'open'
  )
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Agencies created:' as status, COUNT(*) as count FROM agencies;
SELECT 'Offences created:' as status, COUNT(*) as count FROM offences;
SELECT 'Vehicles created:' as status, COUNT(*) as count FROM vehicles;
-- SELECT 'Users created:' as status, COUNT(*) as count FROM users;
-- SELECT 'Infringements created:' as status, COUNT(*) as count FROM infringements;

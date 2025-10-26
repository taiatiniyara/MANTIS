-- ============================================================================================
-- MANTIS Dummy Data - Simplified Version
-- ============================================================================================
-- Run this AFTER users have been created
-- ============================================================================================

-- Disable RLS on all tables (skip system tables)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
        EXCEPTION WHEN OTHERS THEN
            -- Skip tables we don't own or can't modify
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================================================================
-- Teams
-- ============================================================================================

-- Fiji Police Force Teams
INSERT INTO public.teams (id, agency_id, name, leader_id) VALUES
  ('30000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Central Division Patrol Alpha', (SELECT id FROM users WHERE role = 'officer' LIMIT 1)),
  ('30000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Central Division Patrol Bravo', NULL),
  ('30000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Western Division Traffic Unit', NULL),
  ('30000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Northern Division Patrol', NULL),
  ('30000001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Eastern Division Coastal Unit', NULL)
ON CONFLICT (id) DO NOTHING;

-- Land Transport Authority Teams
INSERT INTO public.teams (id, agency_id, name, leader_id) VALUES
  ('30000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Central Region Inspection Team', NULL),
  ('30000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Western Region Traffic Wardens', NULL),
  ('30000002-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Northern Region Transport Team', NULL)
ON CONFLICT (id) DO NOTHING;

-- Suva City Council Teams
INSERT INTO public.teams (id, agency_id, name, leader_id) VALUES
  ('30000003-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'CBD Parking Enforcement', NULL),
  ('30000003-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Toorak Parking Wardens', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================================
-- Routes
-- ============================================================================================

-- FPF Routes
INSERT INTO public.routes (id, agency_id, name, description, location_id, start_location_id, end_location_id, coverage_area) VALUES
  (
    '40000001-0000-0000-0000-000000000001', 
    '11111111-1111-1111-1111-111111111111', 
    'Suva City Centre Patrol',
    'Main business district patrol route covering Victoria Parade and surrounding streets',
    '10000001-0000-0000-0000-000000000001',
    '10000001-0000-0000-0000-000000000001',
    '10000001-0000-0000-0000-000000000001',
    '[{"lat": -18.1416, "lng": 178.4419}, {"lat": -18.1425, "lng": 178.4450}, {"lat": -18.1450, "lng": 178.4440}, {"lat": -18.1440, "lng": 178.4410}]'::jsonb
  ),
  (
    '40000001-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Kings Road Highway Patrol',
    'Highway patrol from Suva to Nausori covering major traffic routes',
    '10000001-0000-0000-0000-000000000001',
    '10000001-0000-0000-0000-000000000001',
    '10000001-0000-0000-0000-000000000001',
    '[{"lat": -18.1416, "lng": 178.4419}, {"lat": -18.0730, "lng": 178.5592}, {"lat": -18.0850, "lng": 178.5650}, {"lat": -18.1500, "lng": 178.4500}]'::jsonb
  ),
  (
    '40000001-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Lautoka City Patrol',
    'Patrol route covering Lautoka city centre and industrial area',
    '10000001-0000-0000-0000-000000000002',
    '10000001-0000-0000-0000-000000000002',
    '10000001-0000-0000-0000-000000000002',
    '[{"lat": -17.6100, "lng": 177.4500}, {"lat": -17.6150, "lng": 177.4600}, {"lat": -17.6200, "lng": 177.4550}, {"lat": -17.6150, "lng": 177.4480}]'::jsonb
  ),
  (
    '40000001-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'Nadi Airport Security Zone',
    'Security patrol around Nadi International Airport precinct',
    '10000001-0000-0000-0000-000000000002',
    '10000001-0000-0000-0000-000000000002',
    '10000001-0000-0000-0000-000000000002',
    '[{"lat": -17.7554, "lng": 177.4433}, {"lat": -17.7600, "lng": 177.4500}, {"lat": -17.7650, "lng": 177.4450}, {"lat": -17.7580, "lng": 177.4400}]'::jsonb
  ),
  (
    '40000001-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'Labasa Town Patrol',
    'Northern division patrol covering Labasa town and surroundings',
    '10000001-0000-0000-0000-000000000003',
    '10000001-0000-0000-0000-000000000003',
    '10000001-0000-0000-0000-000000000003',
    '[{"lat": -16.4167, "lng": 179.3833}, {"lat": -16.4200, "lng": 179.3900}, {"lat": -16.4250, "lng": 179.3850}, {"lat": -16.4200, "lng": 179.3800}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- LTA Routes
INSERT INTO public.routes (id, agency_id, name, description, location_id, start_location_id, end_location_id, coverage_area) VALUES
  (
    '40000002-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Queens Road Vehicle Inspection',
    'Mobile inspection zone along Queens Road corridor',
    '20000002-0000-0000-0000-000000000001',
    '20000002-0000-0000-0000-000000000001',
    '20000002-0000-0000-0000-000000000001',
    '[{"lat": -18.1416, "lng": 178.4419}, {"lat": -18.0500, "lng": 177.9500}, {"lat": -18.0600, "lng": 177.9600}, {"lat": -18.1500, "lng": 178.4500}]'::jsonb
  ),
  (
    '40000002-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'Nadi Town Transport Check',
    'Transport compliance checks in Nadi town area',
    '20000002-0000-0000-0000-000000000002',
    '20000002-0000-0000-0000-000000000002',
    '20000002-0000-0000-0000-000000000002',
    '[{"lat": -17.8000, "lng": 177.4167}, {"lat": -17.8050, "lng": 177.4250}, {"lat": -17.8100, "lng": 177.4200}, {"lat": -17.8050, "lng": 177.4150}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Suva City Council Routes
INSERT INTO public.routes (id, agency_id, name, description, location_id, coverage_area) VALUES
  (
    '40000003-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'CBD Parking Enforcement Zone A',
    'Victoria Parade and Renwick Road parking enforcement',
    NULL,
    '[{"lat": -18.1416, "lng": 178.4419}, {"lat": -18.1425, "lng": 178.4450}, {"lat": -18.1435, "lng": 178.4440}, {"lat": -18.1425, "lng": 178.4410}]'::jsonb
  ),
  (
    '40000003-0000-0000-0000-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'Toorak Residential Parking',
    'Residential area parking enforcement in Toorak',
    NULL,
    '[{"lat": -18.1300, "lng": 178.4600}, {"lat": -18.1350, "lng": 178.4650}, {"lat": -18.1400, "lng": 178.4600}, {"lat": -18.1350, "lng": 178.4550}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================================
-- Route Waypoints (for routes that use waypoints instead of polygons)
-- ============================================================================================

-- Suva City Centre Patrol waypoints
INSERT INTO public.route_waypoints (route_id, latitude, longitude, waypoint_order, name) VALUES
  ('40000001-0000-0000-0000-000000000001', -18.1416, 178.4419, 1, 'Victoria Parade Start'),
  ('40000001-0000-0000-0000-000000000001', -18.1425, 178.4450, 2, 'Ratu Sukuna Park'),
  ('40000001-0000-0000-0000-000000000001', -18.1450, 178.4440, 3, 'Government Buildings'),
  ('40000001-0000-0000-0000-000000000001', -18.1440, 178.4410, 4, 'Municipal Market'),
  ('40000001-0000-0000-0000-000000000001', -18.1416, 178.4419, 5, 'Return to Start')
ON CONFLICT DO NOTHING;

-- Kings Road Highway Patrol waypoints
INSERT INTO public.route_waypoints (route_id, latitude, longitude, waypoint_order, name) VALUES
  ('40000001-0000-0000-0000-000000000002', -18.1416, 178.4419, 1, 'Suva Start Point'),
  ('40000001-0000-0000-0000-000000000002', -18.1200, 178.4800, 2, 'Nasinu Junction'),
  ('40000001-0000-0000-0000-000000000002', -18.0900, 178.5200, 3, 'Nausori Bridge'),
  ('40000001-0000-0000-0000-000000000002', -18.0730, 178.5592, 4, 'Nausori Town')
ON CONFLICT DO NOTHING;

-- ============================================================================================
-- Team Routes Assignments
-- ============================================================================================

INSERT INTO public.team_routes (team_id, route_id) VALUES
  -- FPF Team assignments
  ('30000001-0000-0000-0000-000000000001', '40000001-0000-0000-0000-000000000001'),
  ('30000001-0000-0000-0000-000000000002', '40000001-0000-0000-0000-000000000002'),
  ('30000001-0000-0000-0000-000000000003', '40000001-0000-0000-0000-000000000003'),
  ('30000001-0000-0000-0000-000000000003', '40000001-0000-0000-0000-000000000004'),
  ('30000001-0000-0000-0000-000000000004', '40000001-0000-0000-0000-000000000005'),
  
  -- LTA Team assignments
  ('30000002-0000-0000-0000-000000000001', '40000002-0000-0000-0000-000000000001'),
  ('30000002-0000-0000-0000-000000000002', '40000002-0000-0000-0000-000000000002'),
  
  -- Suva City Council assignments
  ('30000003-0000-0000-0000-000000000001', '40000003-0000-0000-0000-000000000001'),
  ('30000003-0000-0000-0000-000000000002', '40000003-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- ============================================================================================
-- Team Members Assignments
-- ============================================================================================

-- Assign officers to teams (will need to be adjusted based on actual user IDs)
-- This is a template - actual IDs will come from your auth.users table

INSERT INTO public.team_members (team_id, user_id)
SELECT 
  '30000001-0000-0000-0000-000000000001',
  u.id
FROM users u
WHERE u.agency_id = '11111111-1111-1111-1111-111111111111'
  AND u.role = 'officer'
LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO public.team_members (team_id, user_id)
SELECT 
  '30000001-0000-0000-0000-000000000002',
  u.id
FROM users u
WHERE u.agency_id = '11111111-1111-1111-1111-111111111111'
  AND u.role = 'officer'
  AND u.id NOT IN (SELECT user_id FROM team_members WHERE team_id = '30000001-0000-0000-0000-000000000001')
LIMIT 2
ON CONFLICT DO NOTHING;

-- ============================================================================================
-- Infringement Categories
-- ============================================================================================

INSERT INTO public.infringement_categories (id, name, description) VALUES
  ('50000001-0000-0000-0000-000000000001', 'Traffic Violations', 'Moving and stationary traffic offences'),
  ('50000001-0000-0000-0000-000000000002', 'Parking Violations', 'Illegal parking and related offences'),
  ('50000001-0000-0000-0000-000000000003', 'Vehicle Compliance', 'Vehicle registration, fitness, and compliance issues'),
  ('50000001-0000-0000-0000-000000000004', 'Driver Violations', 'Driver licensing and compliance issues'),
  ('50000001-0000-0000-0000-000000000005', 'Safety Violations', 'Safety equipment and regulation violations'),
  ('50000001-0000-0000-0000-000000000006', 'Commercial Vehicle', 'Commercial transport and PSV violations')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================================
-- Infringement Types
-- ============================================================================================

-- Traffic Violations
INSERT INTO public.infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code) VALUES
  ('60000001-0000-0000-0000-000000000001', '50000001-0000-0000-0000-000000000001', 'SPEED001', 'Speeding 1-15 km/h over limit', 'Exceeding speed limit by 1 to 15 kilometers per hour', 100.00, 2, 'GL-TRF-001'),
  ('60000001-0000-0000-0000-000000000002', '50000001-0000-0000-0000-000000000001', 'SPEED002', 'Speeding 16-30 km/h over limit', 'Exceeding speed limit by 16 to 30 kilometers per hour', 200.00, 4, 'GL-TRF-002'),
  ('60000001-0000-0000-0000-000000000003', '50000001-0000-0000-0000-000000000001', 'SPEED003', 'Speeding 31+ km/h over limit', 'Exceeding speed limit by more than 31 kilometers per hour', 400.00, 6, 'GL-TRF-003'),
  ('60000001-0000-0000-0000-000000000004', '50000001-0000-0000-0000-000000000001', 'REDLIGHT', 'Red Light Violation', 'Failing to stop at red traffic signal', 150.00, 3, 'GL-TRF-004'),
  ('60000001-0000-0000-0000-000000000005', '50000001-0000-0000-0000-000000000001', 'DANGEROUS', 'Dangerous Driving', 'Driving in a dangerous manner', 500.00, 8, 'GL-TRF-005'),
  ('60000001-0000-0000-0000-000000000006', '50000001-0000-0000-0000-000000000001', 'CARELESS', 'Careless Driving', 'Driving without due care and attention', 250.00, 4, 'GL-TRF-006'),
  ('60000001-0000-0000-0000-000000000007', '50000001-0000-0000-0000-000000000001', 'NOYIELD', 'Failure to Yield', 'Failing to give way at intersection or roundabout', 120.00, 3, 'GL-TRF-007'),
  ('60000001-0000-0000-0000-000000000008', '50000001-0000-0000-0000-000000000001', 'WRONGLANE', 'Wrong Lane Usage', 'Driving in incorrect lane or illegal lane change', 100.00, 2, 'GL-TRF-008')
ON CONFLICT (id) DO NOTHING;

-- Parking Violations
INSERT INTO public.infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code) VALUES
  ('60000002-0000-0000-0000-000000000001', '50000001-0000-0000-0000-000000000002', 'PARK001', 'Parking Meter Expired', 'Parking with expired meter', 30.00, 0, 'GL-PRK-001'),
  ('60000002-0000-0000-0000-000000000002', '50000001-0000-0000-0000-000000000002', 'PARK002', 'No Parking Zone', 'Parking in designated no parking zone', 80.00, 0, 'GL-PRK-002'),
  ('60000002-0000-0000-0000-000000000003', '50000001-0000-0000-0000-000000000002', 'PARK003', 'Disabled Parking Violation', 'Unauthorized parking in disabled spot', 200.00, 0, 'GL-PRK-003'),
  ('60000002-0000-0000-0000-000000000004', '50000001-0000-0000-0000-000000000002', 'PARK004', 'Double Parking', 'Parking alongside another parked vehicle', 100.00, 0, 'GL-PRK-004'),
  ('60000002-0000-0000-0000-000000000005', '50000001-0000-0000-0000-000000000002', 'PARK005', 'Blocking Driveway', 'Parking blocking private or public driveway', 150.00, 0, 'GL-PRK-005'),
  ('60000002-0000-0000-0000-000000000006', '50000001-0000-0000-0000-000000000002', 'PARK006', 'Yellow Line Parking', 'Parking on yellow line restricted area', 60.00, 0, 'GL-PRK-006')
ON CONFLICT (id) DO NOTHING;

-- Vehicle Compliance
INSERT INTO public.infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code) VALUES
  ('60000003-0000-0000-0000-000000000001', '50000001-0000-0000-0000-000000000003', 'VEH001', 'Unregistered Vehicle', 'Operating vehicle without valid registration', 300.00, 0, 'GL-VEH-001'),
  ('60000003-0000-0000-0000-000000000002', '50000001-0000-0000-0000-000000000003', 'VEH002', 'No Fitness Certificate', 'Vehicle without valid fitness certificate', 250.00, 0, 'GL-VEH-002'),
  ('60000003-0000-0000-0000-000000000003', '50000001-0000-0000-0000-000000000003', 'VEH003', 'No Insurance', 'Operating vehicle without valid insurance', 500.00, 0, 'GL-VEH-003'),
  ('60000003-0000-0000-0000-000000000004', '50000001-0000-0000-0000-000000000003', 'VEH004', 'Defective Vehicle', 'Operating vehicle with significant defects', 200.00, 0, 'GL-VEH-004'),
  ('60000003-0000-0000-0000-000000000005', '50000001-0000-0000-0000-000000000003', 'VEH005', 'Illegal Modifications', 'Unauthorized vehicle modifications', 300.00, 0, 'GL-VEH-005')
ON CONFLICT (id) DO NOTHING;

-- Driver Violations
INSERT INTO public.infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code) VALUES
  ('60000004-0000-0000-0000-000000000001', '50000001-0000-0000-0000-000000000004', 'DRV001', 'No License', 'Driving without a valid license', 400.00, 0, 'GL-DRV-001'),
  ('60000004-0000-0000-0000-000000000002', '50000001-0000-0000-0000-000000000004', 'DRV002', 'Suspended License', 'Driving with suspended license', 600.00, 0, 'GL-DRV-002'),
  ('60000004-0000-0000-0000-000000000003', '50000001-0000-0000-0000-000000000004', 'DRV003', 'Wrong License Class', 'Driving vehicle not covered by license class', 250.00, 0, 'GL-DRV-003'),
  ('60000004-0000-0000-0000-000000000004', '50000001-0000-0000-0000-000000000004', 'DRV004', 'Expired License', 'Driving with expired license', 150.00, 0, 'GL-DRV-004')
ON CONFLICT (id) DO NOTHING;

-- Safety Violations
INSERT INTO public.infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code) VALUES
  ('60000005-0000-0000-0000-000000000001', '50000001-0000-0000-0000-000000000005', 'SAFE001', 'No Seatbelt', 'Driver or passenger not wearing seatbelt', 100.00, 2, 'GL-SFT-001'),
  ('60000005-0000-0000-0000-000000000002', '50000001-0000-0000-0000-000000000005', 'SAFE002', 'Mobile Phone Use', 'Using mobile phone while driving', 150.00, 3, 'GL-SFT-002'),
  ('60000005-0000-0000-0000-000000000003', '50000001-0000-0000-0000-000000000005', 'SAFE003', 'No Child Restraint', 'Child not properly restrained', 200.00, 2, 'GL-SFT-003'),
  ('60000005-0000-0000-0000-000000000004', '50000001-0000-0000-0000-000000000005', 'SAFE004', 'Defective Lights', 'Vehicle with defective lighting', 80.00, 0, 'GL-SFT-004'),
  ('60000005-0000-0000-0000-000000000005', '50000001-0000-0000-0000-000000000005', 'SAFE005', 'No Helmet (Motorcycle)', 'Motorcycle rider without helmet', 120.00, 2, 'GL-SFT-005')
ON CONFLICT (id) DO NOTHING;

-- Commercial Vehicle Violations
INSERT INTO public.infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code) VALUES
  ('60000006-0000-0000-0000-000000000001', '50000001-0000-0000-0000-000000000006', 'COM001', 'Overloaded Vehicle', 'Commercial vehicle exceeding weight limits', 500.00, 0, 'GL-COM-001'),
  ('60000006-0000-0000-0000-000000000002', '50000001-0000-0000-0000-000000000006', 'COM002', 'No PSV License', 'Operating PSV without valid license', 400.00, 0, 'GL-COM-002'),
  ('60000006-0000-0000-0000-000000000003', '50000001-0000-0000-0000-000000000006', 'COM003', 'Logbook Violation', 'Driver logbook not maintained', 150.00, 0, 'GL-COM-003')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================================
-- Infringements
-- ============================================================================================

-- Sample infringements with realistic data
INSERT INTO public.infringements (
  id, 
  officer_id, 
  agency_id, 
  team_id, 
  route_id, 
  type_id, 
  vehicle_id, 
  latitude,
  longitude,
  address,
  notes, 
  issued_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users WHERE role = 'officer' AND agency_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  '30000001-0000-0000-0000-000000000001',
  '40000001-0000-0000-0000-000000000001',
  '60000001-0000-0000-0000-000000000001',
  'EZ' || lpad((random() * 9999)::int::text, 4, '0'),
  -18.1416 + (random() * 0.02 - 0.01),
  178.4419 + (random() * 0.02 - 0.01),
  'Victoria Parade, Suva',
  'Speeding detected on Victoria Parade',
  NOW() - (random() * interval '30 days')
FROM generate_series(1, 15);

-- Parking violations
INSERT INTO public.infringements (
  id, 
  officer_id, 
  agency_id, 
  team_id, 
  route_id, 
  type_id, 
  vehicle_id, 
  latitude,
  longitude,
  address,
  notes, 
  issued_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users WHERE role = 'officer' AND agency_id = '33333333-3333-3333-3333-333333333333' LIMIT 1),
  '33333333-3333-3333-3333-333333333333',
  '30000003-0000-0000-0000-000000000001',
  '40000003-0000-0000-0000-000000000001',
  '60000002-0000-0000-0000-000000000002',
  'FJ' || lpad((random() * 999)::int::text, 3, '0') || chr(65 + (random() * 25)::int) || chr(65 + (random() * 25)::int),
  -18.1496 + (random() * 0.01 - 0.005),
  178.4450 + (random() * 0.01 - 0.005),
  'Suva CBD, Renwick Road',
  'Parked in no parking zone - CBD',
  NOW() - (random() * interval '15 days')
FROM generate_series(1, 25);

-- LTA vehicle compliance checks
INSERT INTO public.infringements (
  id, 
  officer_id, 
  agency_id, 
  team_id, 
  route_id, 
  type_id, 
  vehicle_id, 
  latitude,
  longitude,
  address,
  notes, 
  issued_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users WHERE role = 'officer' AND agency_id = '22222222-2222-2222-2222-222222222222' LIMIT 1),
  '22222222-2222-2222-2222-222222222222',
  '30000002-0000-0000-0000-000000000001',
  '40000002-0000-0000-0000-000000000001',
  '60000003-0000-0000-0000-000000000002',
  'BUS' || lpad((random() * 999)::int::text, 3, '0'),
  -17.7765 + (random() * 0.01 - 0.005),
  177.4400 + (random() * 0.01 - 0.005),
  'Nadi Town, Queens Road',
  'Bus operating without valid fitness certificate',
  NOW() - (random() * interval '20 days')
FROM generate_series(1, 8);

-- ============================================================================================
-- Payments
-- ============================================================================================

-- Create payments for some infringements (about 60% paid)
WITH numbered_infringements AS (
  SELECT 
    i.id,
    it.fine_amount,
    ROW_NUMBER() OVER (ORDER BY i.created_at) as row_num
  FROM infringements i
  JOIN infringement_types it ON i.type_id = it.id
  WHERE random() < 0.6
)
INSERT INTO public.payments (
  infringement_id,
  payment_reference,
  payment_method,
  payment_provider,
  amount,
  currency,
  status,
  paid_at,
  payer_name,
  payer_email,
  payer_phone,
  transaction_id,
  receipt_number
)
SELECT 
  ni.id,
  'PAY-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substring(md5(ni.row_num::text) from 1 for 8)),
  CASE (random() * 4)::int
    WHEN 0 THEN 'card'
    WHEN 1 THEN 'cash'
    WHEN 2 THEN 'bank_transfer'
    ELSE 'mobile_money'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'stripe'
    WHEN 1 THEN 'westpac'
    ELSE 'mpesa'
  END,
  ni.fine_amount,
  'FJD',
  'completed',
  NOW() - (random() * interval '25 days'),
  'John Doe ' || (random() * 100)::int,
  'customer' || (random() * 1000)::int || '@email.com',
  '999' || lpad((random() * 9999)::int::text, 4, '0'),
  'TXN' || upper(substring(md5((ni.row_num::text || random()::text)) from 1 for 12)),
  'RCT-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad(ni.row_num::text, 6, '0')
FROM numbered_infringements ni;

-- Create some pending payments
INSERT INTO public.payments (
  infringement_id,
  payment_reference,
  payment_method,
  amount,
  currency,
  status,
  payer_email
)
SELECT 
  i.id,
  'PAY-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 8)),
  'card',
  it.fine_amount,
  'FJD',
  'pending',
  'customer' || (random() * 1000)::int || '@email.com'
FROM infringements i
JOIN infringement_types it ON i.type_id = it.id
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE payments.infringement_id = i.id)
  AND random() < 0.3;

-- ============================================================================================
-- Payment Reminders
-- ============================================================================================

-- Send reminders for unpaid infringements
INSERT INTO public.payment_reminders (
  infringement_id,
  reminder_type,
  reminder_method,
  sent_at,
  recipient_email,
  recipient_phone,
  status
)
SELECT 
  i.id,
  CASE (random() * 3)::int
    WHEN 0 THEN 'first'
    WHEN 1 THEN 'second'
    ELSE 'final'
  END,
  CASE (random() * 2)::int
    WHEN 0 THEN 'email'
    ELSE 'sms'
  END,
  NOW() - (random() * interval '20 days'),
  'offender' || (random() * 1000)::int || '@email.com',
  '999' || lpad((random() * 9999)::int::text, 4, '0'),
  CASE (random() * 3)::int
    WHEN 0 THEN 'sent'
    WHEN 1 THEN 'delivered'
    ELSE 'opened'
  END
FROM infringements i
WHERE NOT EXISTS (
  SELECT 1 FROM payments p 
  WHERE p.infringement_id = i.id 
  AND p.status = 'completed'
);

-- ============================================================================================
-- Notifications
-- ============================================================================================

-- Create notifications for users
INSERT INTO public.notifications (
  user_id,
  title,
  message,
  type,
  category,
  priority,
  is_read,
  action_url,
  action_label
)
SELECT 
  u.id,
  'New Infringement Recorded',
  'Infringement ' || substring(md5(random()::text) from 1 for 8) || ' has been recorded in your area',
  'info',
  'infringement',
  'normal',
  random() < 0.4,
  '/infringements/' || gen_random_uuid(),
  'View Details'
FROM users u
WHERE u.role IN ('officer', 'agency_admin')
ORDER BY random()
LIMIT 20;

-- System notifications
INSERT INTO public.notifications (
  user_id,
  title,
  message,
  type,
  category,
  priority,
  is_read
)
SELECT 
  u.id,
  'Weekly Report Available',
  'Your weekly infringement report for ' || to_char(NOW(), 'Week DD, YYYY') || ' is now available',
  'success',
  'report',
  'normal',
  random() < 0.6
FROM users u
WHERE u.role IN ('agency_admin', 'super_admin');



-- Re-enable RLS on all tables (skip system tables)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
        EXCEPTION WHEN OTHERS THEN
            -- Skip tables we don't own or can't modify
            NULL;
        END;
    END LOOP;
END $$;


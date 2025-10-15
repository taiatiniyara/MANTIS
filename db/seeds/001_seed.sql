-- ============================
-- Agencies
-- ============================
insert into agencies (id, name) values
  (gen_random_uuid(), 'Fiji Police Force'),
  (gen_random_uuid(), 'Land Transport Authority'),
  (gen_random_uuid(), 'Suva City Council'),
  (gen_random_uuid(), 'Lautoka City Council'),
  (gen_random_uuid(), 'Nadi Town Council'),
  (gen_random_uuid(), 'Labasa Town Council');

-- ============================
-- Locations
-- ============================

-- Police Divisions
insert into locations (id, agency_id, type, name)
select gen_random_uuid(), a.id, 'division', 'Central Division'
from agencies a where a.name = 'Fiji Police Force';
insert into locations (id, agency_id, type, name)
select gen_random_uuid(), a.id, 'division', 'Western Division'
from agencies a where a.name = 'Fiji Police Force';
insert into locations (id, agency_id, type, name)
select gen_random_uuid(), a.id, 'division', 'Northern Division'
from agencies a where a.name = 'Fiji Police Force';
insert into locations (id, agency_id, type, name)
select gen_random_uuid(), a.id, 'division', 'Eastern Division'
from agencies a where a.name = 'Fiji Police Force';

-- LTA Regions
insert into locations (id, agency_id, type, name)
select gen_random_uuid(), a.id, 'region', 'Central Region'
from agencies a where a.name = 'Land Transport Authority';
insert into locations (id, agency_id, type, name)
select gen_random_uuid(), a.id, 'region', 'Western Region'
from agencies a where a.name = 'Land Transport Authority';
insert into locations (id, agency_id, type, name)
select gen_random_uuid(), a.id, 'region', 'Northern Region'
from agencies a where a.name = 'Land Transport Authority';

-- Councils
insert into locations (id, agency_id, type, name)
select gen_random_uuid(), a.id, 'council', a.name
from agencies a
where a.name in ('Suva City Council','Lautoka City Council','Nadi Town Council','Labasa Town Council');

-- ============================
-- Infringement Categories
-- ============================
insert into infringement_categories (id, name, description) values
  (gen_random_uuid(), 'Speeding', 'Exceeding posted speed limits'),
  (gen_random_uuid(), 'Parking', 'Illegal or improper parking'),
  (gen_random_uuid(), 'Licensing', 'Driver or vehicle licensing offences'),
  (gen_random_uuid(), 'Vehicle Condition', 'Unsafe or unroadworthy vehicles'),
  (gen_random_uuid(), 'Dangerous Driving', 'Reckless or negligent driving');

-- ============================
-- Infringement Types with GL Codes
-- ============================

-- Speeding
insert into infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code)
select gen_random_uuid(), c.id, 'SPD-001', 'Exceeding speed limit by 10-15 km/h',
       'Minor speeding offence', 50.00, 1, '4100'
from infringement_categories c where c.name = 'Speeding';

insert into infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code)
select gen_random_uuid(), c.id, 'SPD-002', 'Exceeding speed limit by 16-30 km/h',
       'Moderate speeding offence', 100.00, 2, '4100'
from infringement_categories c where c.name = 'Speeding';

-- Parking
insert into infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code)
select gen_random_uuid(), c.id, 'PRK-001', 'Parking in a no-parking zone',
       'Vehicle parked in restricted area', 40.00, 0, '4200'
from infringement_categories c where c.name = 'Parking';

-- Licensing
insert into infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code)
select gen_random_uuid(), c.id, 'LIC-001', 'Driving without a valid license',
       'Unlicensed driver', 200.00, 3, '4300'
from infringement_categories c where c.name = 'Licensing';

-- Vehicle Condition
insert into infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code)
select gen_random_uuid(), c.id, 'VEH-001', 'Driving with defective lights',
       'Vehicle lights not operational', 30.00, 0, '4400'
from infringement_categories c where c.name = 'Vehicle Condition';

-- Dangerous Driving
insert into infringement_types (id, category_id, code, name, description, fine_amount, demerit_points, gl_code)
select gen_random_uuid(), c.id, 'DD-001', 'Reckless driving',
       'Driving in a manner dangerous to the public', 300.00, 5, '4500'
from infringement_categories c where c.name = 'Dangerous Driving';

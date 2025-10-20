-- ============================
-- Sync Auth Users to Users Table
-- ============================
-- This migration syncs users from auth.users to public.users
-- It creates user profiles for authenticated users

-- First, let's create the admin user (super_admin)
insert into public.users (id, agency_id, role, position, location_id)
select 
  au.id,
  null,
  'super_admin',
  'System Administrator',
  null
from auth.users au
where au.email = 'admin@mantis.gov.fj'
and not exists (
  select 1 from public.users u where u.id = au.id
);

-- Create FPF Admin (agency_admin for Fiji Police Force)
insert into public.users (id, agency_id, role, position, location_id)
select 
  au.id,
  a.id,
  'agency_admin',
  'Chief Inspector',
  l.id
from auth.users au
cross join agencies a
left join locations l on l.agency_id = a.id and l.name = 'Central Division'
where au.email = 'fpf.admin@mantis.gov.fj'
and a.name = 'Fiji Police Force'
and not exists (
  select 1 from public.users u where u.id = au.id
);

-- Create LTA Admin (agency_admin for Land Transport Authority)
insert into public.users (id, agency_id, role, position, location_id)
select 
  au.id,
  a.id,
  'agency_admin',
  'Senior Transport Officer',
  l.id
from auth.users au
cross join agencies a
left join locations l on l.agency_id = a.id and l.name = 'Central Region'
where au.email = 'lta.admin@mantis.gov.fj'
and a.name = 'Land Transport Authority'
and not exists (
  select 1 from public.users u where u.id = au.id
);

-- Create Suva City Council Admin (agency_admin)
insert into public.users (id, agency_id, role, position, location_id)
select 
  au.id,
  a.id,
  'agency_admin',
  'City Parking Manager',
  null
from auth.users au
cross join agencies a
where au.email = 'suva.admin@mantis.gov.fj'
and a.name = 'Suva City Council'
and not exists (
  select 1 from public.users u where u.id = au.id
);

-- Create FPF Officer John (officer)
insert into public.users (id, agency_id, role, position, location_id)
select 
  au.id,
  a.id,
  'officer',
  'Police Constable',
  l.id
from auth.users au
cross join agencies a
left join locations l on l.agency_id = a.id and l.name = 'Central Division'
where au.email = 'officer.john@fpf.gov.fj'
and a.name = 'Fiji Police Force'
and not exists (
  select 1 from public.users u where u.id = au.id
);

-- Create FPF Officer Sarah (officer)
insert into public.users (id, agency_id, role, position, location_id)
select 
  au.id,
  a.id,
  'officer',
  'Police Corporal',
  l.id
from auth.users au
cross join agencies a
left join locations l on l.agency_id = a.id and l.name = 'Western Division'
where au.email = 'officer.sarah@fpf.gov.fj'
and a.name = 'Fiji Police Force'
and not exists (
  select 1 from public.users u where u.id = au.id
);

-- Create LTA Inspector Mike (officer)
insert into public.users (id, agency_id, role, position, location_id)
select 
  au.id,
  a.id,
  'officer',
  'Transport Inspector',
  l.id
from auth.users au
cross join agencies a
left join locations l on l.agency_id = a.id and l.name = 'Central Region'
where au.email = 'inspector.mike@lta.gov.fj'
and a.name = 'Land Transport Authority'
and not exists (
  select 1 from public.users u where u.id = au.id
);

-- Display sync results
do $$
declare
  user_count integer;
begin
  select count(*) into user_count from public.users;
  raise notice 'User sync complete. Total users in public.users: %', user_count;
end $$;

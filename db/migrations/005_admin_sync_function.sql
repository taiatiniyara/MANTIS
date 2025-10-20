-- Create admin function to sync users (bypasses RLS)
-- This function runs with SECURITY DEFINER which means it runs with
-- the permissions of the user who created it (postgres superuser)

create or replace function admin_sync_auth_users()
returns json
language plpgsql
security definer -- This is key - runs as the function creator, not caller
as $$
declare
  result json;
  synced_count int := 0;
begin
  -- Sync admin user
  insert into public.users (id, agency_id, role, position, location_id)
  select 
    au.id,
    null,
    'super_admin',
    'System Administrator',
    null
  from auth.users au
  where au.email = 'admin@mantis.gov.fj'
  on conflict (id) do nothing;
  
  if found then synced_count := synced_count + 1; end if;

  -- Sync FPF Admin
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
  on conflict (id) do nothing;
  
  if found then synced_count := synced_count + 1; end if;

  -- Sync LTA Admin
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
  on conflict (id) do nothing;
  
  if found then synced_count := synced_count + 1; end if;

  -- Sync Suva Admin
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
  on conflict (id) do nothing;
  
  if found then synced_count := synced_count + 1; end if;

  -- Sync Officer John
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
  on conflict (id) do nothing;
  
  if found then synced_count := synced_count + 1; end if;

  -- Sync Officer Sarah
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
  on conflict (id) do nothing;
  
  if found then synced_count := synced_count + 1; end if;

  -- Sync Inspector Mike
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
  on conflict (id) do nothing;
  
  if found then synced_count := synced_count + 1; end if;

  -- Return result
  result := json_build_object(
    'success', true,
    'synced_count', synced_count,
    'message', 'Users synced successfully'
  );
  
  return result;
end;
$$;

-- Grant execute permission to service role
grant execute on function admin_sync_auth_users() to service_role;

-- Also create a function to count users (for verification)
create or replace function admin_count_users()
returns json
language plpgsql
security definer
as $$
declare
  result json;
  user_count int;
begin
  select count(*) into user_count from public.users;
  
  result := json_build_object(
    'count', user_count,
    'message', format('%s users in table', user_count)
  );
  
  return result;
end;
$$;

grant execute on function admin_count_users() to service_role;

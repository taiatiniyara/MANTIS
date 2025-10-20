-- ============================
-- Fix RLS Helper Functions to use users table
-- This migration fixes two issues:
-- 1. Functions were in auth schema (permission denied)
-- 2. Need to move functions to public schema
-- ============================

-- Step 1: Drop ALL existing RLS policies FIRST (before dropping functions)
-- This prevents dependency errors
do $$ 
declare
  r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  ) loop
    execute 'drop policy if exists "' || r.policyname || '" on ' || r.schemaname || '.' || r.tablename;
  end loop;
end $$;

-- Step 2: Now drop the helper functions (both auth and public schemas)
drop function if exists auth.user_role() cascade;
drop function if exists auth.user_agency_id() cascade;
drop function if exists auth.is_super_admin() cascade;
drop function if exists public.user_role() cascade;
drop function if exists public.user_agency_id() cascade;
drop function if exists public.is_super_admin() cascade;
drop function if exists public.is_agency_admin() cascade;

-- Step 3: Create new helper functions in public schema, using users table
-- Get the current user's role from users table
create or replace function public.user_role()
returns text
language sql security definer stable
as $$
  select role from public.users where id = auth.uid();
$$;

-- Get the current user's agency_id from users table
create or replace function public.user_agency_id()
returns uuid
language sql security definer stable
as $$
  select agency_id from public.users where id = auth.uid();
$$;

-- Check if user is super admin
create or replace function public.is_super_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'super_admin'
  );
$$;

-- Check if user is agency admin
create or replace function public.is_agency_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'agency_admin'
  );
$$;

-- ============================
-- Step 4: Recreate ALL RLS policies with correct function references
-- ============================

-- ============================
-- Recreate Agencies Policies
-- ============================

create policy "Super admins can view all agencies"
  on agencies for select
  to authenticated
  using (public.is_super_admin());

create policy "Super admins can insert agencies"
  on agencies for insert
  to authenticated
  with check (public.is_super_admin());

create policy "Super admins can update agencies"
  on agencies for update
  to authenticated
  using (public.is_super_admin());

create policy "Super admins can delete agencies"
  on agencies for delete
  to authenticated
  using (public.is_super_admin());

create policy "Users can view their agency"
  on agencies for select
  to authenticated
  using (id = public.user_agency_id());

create policy "Agency admins can view all agencies for joins"
  on agencies for select
  to authenticated
  using (public.is_agency_admin());

-- ============================
-- Recreate Users Policies (not profiles)
-- ============================

alter table users enable row level security;

create policy "Super admins can view all users"
  on users for select
  to authenticated
  using (public.is_super_admin());

create policy "Super admins can insert users"
  on users for insert
  to authenticated
  with check (public.is_super_admin());

create policy "Super admins can update all users"
  on users for update
  to authenticated
  using (public.is_super_admin());

create policy "Agency admins can view users in their agency"
  on users for select
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.is_agency_admin()
  );

create policy "Agency admins can insert users in their agency"
  on users for insert
  to authenticated
  with check (
    agency_id = public.user_agency_id()
    and public.is_agency_admin()
  );

create policy "Agency admins can update users in their agency"
  on users for update
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.is_agency_admin()
    and role != 'super_admin'
  );

create policy "Users can view their own profile"
  on users for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update their own profile"
  on users for update
  to authenticated
  using (id = auth.uid());

-- ============================
-- Recreate Locations Policies
-- ============================

create policy "Super admins can manage all locations"
  on locations for all
  to authenticated
  using (public.is_super_admin());

create policy "Agency admins can view locations in their agency"
  on locations for select
  to authenticated
  using (
    agency_id = public.user_agency_id()
    or agency_id is null
  );

create policy "Agency admins can insert locations in their agency"
  on locations for insert
  to authenticated
  with check (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

create policy "Agency admins can update locations in their agency"
  on locations for update
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

-- ============================
-- Recreate Teams Policies
-- ============================

create policy "Super admins can view all teams"
  on teams for select
  to authenticated
  using (public.is_super_admin());

create policy "Agency admins can view teams in their agency"
  on teams for select
  to authenticated
  using (agency_id = public.user_agency_id());

create policy "Agency admins can insert teams in their agency"
  on teams for insert
  to authenticated
  with check (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

create policy "Agency admins can update teams in their agency"
  on teams for update
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

create policy "Agency admins can delete teams in their agency"
  on teams for delete
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

-- ============================
-- Recreate Routes Policies
-- ============================

create policy "Super admins can view all routes"
  on routes for select
  to authenticated
  using (public.is_super_admin());

create policy "Agency admins can view routes in their agency"
  on routes for select
  to authenticated
  using (agency_id = public.user_agency_id());

create policy "Agency admins can insert routes in their agency"
  on routes for insert
  to authenticated
  with check (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

create policy "Agency admins can update routes in their agency"
  on routes for update
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

create policy "Agency admins can delete routes in their agency"
  on routes for delete
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

-- ============================
-- Recreate Team Routes & Team Members Policies
-- ============================

create policy "Users can view team routes for their agency teams"
  on team_routes for select
  to authenticated
  using (
    exists (
      select 1 from teams
      where teams.id = team_routes.team_id
      and (
        teams.agency_id = public.user_agency_id()
        or public.is_super_admin()
      )
    )
  );

create policy "Agency admins can manage team routes"
  on team_routes for all
  to authenticated
  using (
    exists (
      select 1 from teams
      where teams.id = team_routes.team_id
      and teams.agency_id = public.user_agency_id()
      and public.user_role() = 'agency_admin'
    )
  );

create policy "Users can view team members for their agency teams"
  on team_members for select
  to authenticated
  using (
    exists (
      select 1 from teams
      where teams.id = team_members.team_id
      and (
        teams.agency_id = public.user_agency_id()
        or public.is_super_admin()
      )
    )
  );

create policy "Agency admins can manage team members"
  on team_members for all
  to authenticated
  using (
    exists (
      select 1 from teams
      where teams.id = team_members.team_id
      and teams.agency_id = public.user_agency_id()
      and public.user_role() = 'agency_admin'
    )
  );

-- ============================
-- Recreate Infringement Categories & Types Policies
-- ============================

create policy "Authenticated users can view infringement categories"
  on infringement_categories for select
  to authenticated
  using (true);

create policy "Authenticated users can view infringement types"
  on infringement_types for select
  to authenticated
  using (true);

create policy "Super admins can insert infringement categories"
  on infringement_categories for insert
  to authenticated
  with check (public.is_super_admin());

create policy "Super admins can update infringement categories"
  on infringement_categories for update
  to authenticated
  using (public.is_super_admin());

create policy "Super admins can delete infringement categories"
  on infringement_categories for delete
  to authenticated
  using (public.is_super_admin());

create policy "Super admins can insert infringement types"
  on infringement_types for insert
  to authenticated
  with check (public.is_super_admin());

create policy "Super admins can update infringement types"
  on infringement_types for update
  to authenticated
  using (public.is_super_admin());

create policy "Super admins can delete infringement types"
  on infringement_types for delete
  to authenticated
  using (public.is_super_admin());

-- ============================
-- Recreate Infringements Policies
-- ============================

create policy "Super admins can view all infringements"
  on infringements for select
  to authenticated
  using (public.is_super_admin());

create policy "Users can view infringements from their agency"
  on infringements for select
  to authenticated
  using (agency_id = public.user_agency_id());

create policy "Officers can insert infringements"
  on infringements for insert
  to authenticated
  with check (
    officer_id = auth.uid()
    and agency_id = public.user_agency_id()
  );

create policy "Officers can update their own infringements"
  on infringements for update
  to authenticated
  using (officer_id = auth.uid());

create policy "Agency admins can update infringements in their agency"
  on infringements for update
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

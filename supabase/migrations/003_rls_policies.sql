-- ============================
-- Enable Row Level Security
-- ============================

alter table agencies enable row level security;
alter table locations enable row level security;
alter table users enable row level security;
alter table teams enable row level security;
alter table routes enable row level security;
alter table team_routes enable row level security;
alter table team_members enable row level security;
alter table infringement_categories enable row level security;
alter table infringement_types enable row level security;
alter table infringements enable row level security;

-- ============================
-- Helper Functions
-- ============================

-- Get the current user's role
create or replace function public.user_role()
returns text
language sql security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- Get the current user's agency_id
create or replace function public.user_agency_id()
returns uuid
language sql security definer
set search_path = public
as $$
  select agency_id from public.users where id = auth.uid();
$$;

-- Check if user is super admin
create or replace function public.is_super_admin()
returns boolean
language sql security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'super_admin'
  );
$$;

-- ============================
-- Agencies Policies
-- ============================

-- Super admins can do everything with agencies
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

-- Agency admins and officers can view their own agency
create policy "Users can view their agency"
  on agencies for select
  to authenticated
  using (
    id = public.user_agency_id()
  );

-- ============================
-- Users Policies
-- ============================

-- Super admins can view all users
create policy "Super admins can view all users"
  on users for select
  to authenticated
  using (public.is_super_admin());

-- Super admins can insert users
create policy "Super admins can insert users"
  on users for insert
  to authenticated
  with check (public.is_super_admin());

-- Super admins can update users
create policy "Super admins can update users"
  on users for update
  to authenticated
  using (public.is_super_admin());

-- Agency admins can view users in their agency
create policy "Agency admins can view users in their agency"
  on users for select
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() in ('agency_admin', 'officer')
  );

-- Agency admins can insert users in their agency
create policy "Agency admins can insert users in their agency"
  on users for insert
  to authenticated
  with check (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

-- Agency admins can update users in their agency (except super admins)
create policy "Agency admins can update users in their agency"
  on users for update
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
    and role != 'super_admin'
  );

-- Users can view their own record
create policy "Users can view their own record"
  on users for select
  to authenticated
  using (id = auth.uid());

-- ============================
-- Locations Policies
-- ============================

-- Super admins can do everything with locations
create policy "Super admins can manage all locations"
  on locations for all
  to authenticated
  using (public.is_super_admin());

-- Agency admins can manage locations in their agency
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
-- Teams Policies
-- ============================

-- Super admins can view all teams
create policy "Super admins can view all teams"
  on teams for select
  to authenticated
  using (public.is_super_admin());

-- Agency admins can manage teams in their agency
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
-- Routes Policies
-- ============================

-- Super admins can view all routes
create policy "Super admins can view all routes"
  on routes for select
  to authenticated
  using (public.is_super_admin());

-- Agency admins can manage routes in their agency
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
-- Team Routes & Team Members Policies
-- ============================

-- Allow viewing team_routes if user can see the team
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

-- Allow agency admins to manage team routes
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

-- Allow viewing team_members if user can see the team
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

-- Allow agency admins to manage team members
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
-- Infringement Categories & Types Policies
-- ============================

-- Everyone can view categories and types (read-only)
create policy "Authenticated users can view infringement categories"
  on infringement_categories for select
  to authenticated
  using (true);

create policy "Authenticated users can view infringement types"
  on infringement_types for select
  to authenticated
  using (true);

-- Only super admins can manage categories and types
create policy "Super admins can manage infringement categories"
  on infringement_categories for all
  to authenticated
  using (public.is_super_admin());

create policy "Super admins can manage infringement types"
  on infringement_types for all
  to authenticated
  using (public.is_super_admin());

-- ============================
-- Infringements Policies
-- ============================

-- Super admins can view all infringements
create policy "Super admins can view all infringements"
  on infringements for select
  to authenticated
  using (public.is_super_admin());

-- Users can view infringements from their agency
create policy "Users can view infringements from their agency"
  on infringements for select
  to authenticated
  using (agency_id = public.user_agency_id());

-- Officers can insert infringements
create policy "Officers can insert infringements"
  on infringements for insert
  to authenticated
  with check (
    officer_id = auth.uid()
    and agency_id = public.user_agency_id()
  );

-- Officers can update their own infringements
create policy "Officers can update their own infringements"
  on infringements for update
  to authenticated
  using (officer_id = auth.uid());

-- Agency admins can update infringements in their agency
create policy "Agency admins can update infringements in their agency"
  on infringements for update
  to authenticated
  using (
    agency_id = public.user_agency_id()
    and public.user_role() = 'agency_admin'
  );

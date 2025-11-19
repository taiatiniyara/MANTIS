-- MANTIS Database Schema - Core Tables
-- Migration: Initial setup for agencies, users, locations, teams, and routes

-- ================================================================================================
-- EXTENSIONS
-- ================================================================================================
create extension if not exists "uuid-ossp" schema extensions;
create extension if not exists "pgcrypto" schema extensions;

-- ================================================================================================
-- TABLES - Create all tables first
-- ================================================================================================

-- AGENCIES
create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamp with time zone default now()
);

-- LOCATIONS
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  type text not null check (type in ('division', 'station', 'post', 'region', 'office', 'council', 'department', 'zone')),
  name text not null,
  parent_id uuid references public.locations(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index idx_locations_agency_id on public.locations(agency_id);
create index idx_locations_parent_id on public.locations(parent_id);

-- USERS
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete set null,
  role text not null check (role in ('super_admin', 'agency_admin', 'officer')),
  position text,
  location_id uuid references public.locations(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index idx_users_agency_id on public.users(agency_id);
create index idx_users_role on public.users(role);
create index idx_users_location_id on public.users(location_id);

-- TEAMS
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  name text not null,
  leader_id uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index idx_teams_agency_id on public.teams(agency_id);
create index idx_teams_leader_id on public.teams(leader_id);

-- ROUTES
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  name text not null,
  description text,
  location_id uuid references public.locations(id) on delete set null,
  coverage_area jsonb,
  created_at timestamp with time zone default now()
);

create index idx_routes_agency_id on public.routes(agency_id);
create index idx_routes_location_id on public.routes(location_id);

-- ROUTE WAYPOINTS
create table public.route_waypoints (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  latitude numeric(10, 8) not null,
  longitude numeric(11, 8) not null,
  waypoint_order integer not null,
  name text,
  created_at timestamp with time zone default now(),
  unique(route_id, waypoint_order)
);

create index idx_route_waypoints_route_id on public.route_waypoints(route_id);
create index idx_route_waypoints_order on public.route_waypoints(route_id, waypoint_order);

-- TEAM MEMBERS
create table public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  primary key (team_id, user_id)
);

create index idx_team_members_team_id on public.team_members(team_id);
create index idx_team_members_user_id on public.team_members(user_id);

-- TEAM ROUTES
create table public.team_routes (
  team_id uuid references public.teams(id) on delete cascade,
  route_id uuid references public.routes(id) on delete cascade,
  assigned_at timestamp with time zone default now(),
  primary key (team_id, route_id)
);

create index idx_team_routes_team_id on public.team_routes(team_id);
create index idx_team_routes_route_id on public.team_routes(route_id);

-- ================================================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================================================

-- AGENCIES RLS
alter table public.agencies enable row level security;

create policy "Super admins can manage all agencies"
  on public.agencies for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can view their own agency"
  on public.agencies for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = agencies.id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can view their own agency"
  on public.agencies for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = agencies.id
    )
  );

-- LOCATIONS RLS
alter table public.locations enable row level security;

create policy "Super admins can manage all locations"
  on public.locations for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their agency locations"
  on public.locations for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = locations.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can view their agency locations"
  on public.locations for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = locations.agency_id
    )
  );

-- USERS RLS
alter table public.users enable row level security;

create policy "Super admins can manage all users"
  on public.users for all
  using (
    exists (
      select 1 from public.users as u
      where u.id = auth.uid()
      and u.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their agency users"
  on public.users for all
  using (
    exists (
      select 1 from public.users as u
      where u.id = auth.uid()
      and u.agency_id = users.agency_id
      and u.role = 'agency_admin'
    )
  );

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- TEAMS RLS
alter table public.teams enable row level security;

create policy "Super admins can manage all teams"
  on public.teams for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their agency teams"
  on public.teams for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = teams.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can view their agency teams"
  on public.teams for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = teams.agency_id
    )
  );

-- ROUTES RLS
alter table public.routes enable row level security;

create policy "Super admins can manage all routes"
  on public.routes for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their agency routes"
  on public.routes for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = routes.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can view their agency routes"
  on public.routes for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = routes.agency_id
    )
  );

-- ROUTE WAYPOINTS RLS
alter table public.route_waypoints enable row level security;

create policy "Super admins can manage all waypoints"
  on public.route_waypoints for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their routes waypoints"
  on public.route_waypoints for all
  using (
    exists (
      select 1 from public.users
      join public.routes on routes.id = route_waypoints.route_id
      where users.id = auth.uid()
      and users.agency_id = routes.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can view their agency route waypoints"
  on public.route_waypoints for select
  using (
    exists (
      select 1 from public.users
      join public.routes on routes.id = route_waypoints.route_id
      where users.id = auth.uid()
      and users.agency_id = routes.agency_id
    )
  );

-- TEAM MEMBERS RLS
alter table public.team_members enable row level security;

create policy "Super admins can manage all team members"
  on public.team_members for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their teams members"
  on public.team_members for all
  using (
    exists (
      select 1 from public.users
      join public.teams on teams.id = team_members.team_id
      where users.id = auth.uid()
      and users.agency_id = teams.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can view their team memberships"
  on public.team_members for select
  using (
    exists (
      select 1 from public.users
      join public.teams on teams.id = team_members.team_id
      where users.id = auth.uid()
      and users.agency_id = teams.agency_id
    )
  );

-- TEAM ROUTES RLS
alter table public.team_routes enable row level security;

create policy "Super admins can manage all team routes"
  on public.team_routes for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their teams routes"
  on public.team_routes for all
  using (
    exists (
      select 1 from public.users
      join public.teams on teams.id = team_routes.team_id
      where users.id = auth.uid()
      and users.agency_id = teams.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can view their team routes"
  on public.team_routes for select
  using (
    exists (
      select 1 from public.users
      join public.teams on teams.id = team_routes.team_id
      where users.id = auth.uid()
      and users.agency_id = teams.agency_id
    )
  );

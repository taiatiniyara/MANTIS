-- MANTIS Database Schema - GPS & Tracking
-- Migration: GPS tracking, geospatial features

-- Enable PostGIS extension for geospatial features
create extension if not exists postgis;

-- ============================================================================================
-- GPS TRACKING
-- ============================================================================================
create table public.gps_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  latitude numeric(10, 8) not null,
  longitude numeric(11, 8) not null,
  accuracy numeric(10, 2),
  altitude numeric(10, 2),
  speed numeric(10, 2),
  heading numeric(5, 2),
  tracked_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create index idx_gps_tracking_user_id on public.gps_tracking(user_id);
create index idx_gps_tracking_tracked_at on public.gps_tracking(tracked_at);
create index idx_gps_tracking_user_time on public.gps_tracking(user_id, tracked_at desc);

-- Add PostGIS geometry column for spatial queries
alter table public.gps_tracking add column location geography(point, 4326);

-- Update location column from lat/lng
create or replace function update_gps_location()
returns trigger as $$
begin
  new.location = st_point(new.longitude, new.latitude)::geography;
  return new;
end;
$$ language plpgsql;

create trigger set_gps_location
  before insert or update on public.gps_tracking
  for each row
  execute function update_gps_location();

-- Create spatial index
create index idx_gps_tracking_location on public.gps_tracking using gist(location);

-- RLS for gps_tracking
alter table public.gps_tracking enable row level security;

create policy "Super admins can view all GPS tracking"
  on public.gps_tracking for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can view their agency GPS tracking"
  on public.gps_tracking for select
  using (
    exists (
      select 1 from public.users as admin
      join public.users as tracked_user on tracked_user.id = gps_tracking.user_id
      where admin.id = auth.uid()
      and admin.agency_id = tracked_user.agency_id
      and admin.role = 'agency_admin'
    )
  );

create policy "Users can create their own GPS tracking"
  on public.gps_tracking for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own GPS tracking"
  on public.gps_tracking for select
  using (auth.uid() = user_id);

-- ============================================================================================
-- ADD GEOSPATIAL FEATURES TO EXISTING TABLES
-- ============================================================================================

-- Add location column to infringements
alter table public.infringements add column if not exists location geography(point, 4326);

-- Update infringements location from lat/lng
create or replace function update_infringement_location()
returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.location = st_point(new.longitude, new.latitude)::geography;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_infringement_location
  before insert or update on public.infringements
  for each row
  execute function update_infringement_location();

-- Create spatial index for infringements
create index if not exists idx_infringements_location on public.infringements using gist(location);

-- ============================================================================================
-- HELPER FUNCTIONS FOR SPATIAL QUERIES
-- ============================================================================================

-- Function to get infringements within a radius (in meters)
create or replace function get_infringements_near_point(
  target_lat numeric,
  target_lng numeric,
  radius_meters integer default 1000
)
returns table (
  id uuid,
  distance_meters numeric
) as $$
begin
  return query
  select
    i.id,
    st_distance(
      i.location,
      st_point(target_lng, target_lat)::geography
    ) as distance_meters
  from public.infringements i
  where i.location is not null
    and st_dwithin(
      i.location,
      st_point(target_lng, target_lat)::geography,
      radius_meters
    )
  order by distance_meters;
end;
$$ language plpgsql security definer;

-- Function to get GPS tracks within a time range
create or replace function get_gps_tracks(
  target_user_id uuid,
  start_time timestamp with time zone,
  end_time timestamp with time zone
)
returns table (
  id uuid,
  latitude numeric,
  longitude numeric,
  accuracy numeric,
  tracked_at timestamp with time zone
) as $$
begin
  return query
  select
    g.id,
    g.latitude,
    g.longitude,
    g.accuracy,
    g.tracked_at
  from public.gps_tracking g
  where g.user_id = target_user_id
    and g.tracked_at between start_time and end_time
  order by g.tracked_at;
end;
$$ language plpgsql security definer;

-- MANTIS Database Schema - Infringements
-- Migration: Infringement categories, types, and records

-- ============================================================================================
-- INFRINGEMENT CATEGORIES
-- ============================================================================================
create table public.infringement_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamp with time zone default now()
);

-- RLS for infringement_categories
alter table public.infringement_categories enable row level security;

create policy "Everyone can view infringement categories"
  on public.infringement_categories for select
  using (true);

create policy "Super admins can manage infringement categories"
  on public.infringement_categories for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage infringement categories"
  on public.infringement_categories for insert
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'agency_admin'
    )
  );

-- ============================================================================================
-- INFRINGEMENT TYPES
-- ============================================================================================
create table public.infringement_types (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.infringement_categories(id) on delete cascade,
  code text unique not null,
  name text not null,
  description text,
  fine_amount numeric(10, 2),
  demerit_points integer,
  gl_code text not null,
  created_at timestamp with time zone default now()
);

create index idx_infringement_types_category_id on public.infringement_types(category_id);
create index idx_infringement_types_code on public.infringement_types(code);
create index idx_infringement_types_gl_code on public.infringement_types(gl_code);

-- RLS for infringement_types
alter table public.infringement_types enable row level security;

create policy "Everyone can view infringement types"
  on public.infringement_types for select
  using (true);

create policy "Super admins can manage infringement types"
  on public.infringement_types for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage infringement types"
  on public.infringement_types for insert
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'agency_admin'
    )
  );

-- ============================================================================================
-- INFRINGEMENTS
-- ============================================================================================
create table public.infringements (
  id uuid primary key default gen_random_uuid(),
  officer_id uuid references public.users(id) on delete set null,
  agency_id uuid references public.agencies(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  route_id uuid references public.routes(id) on delete set null,
  type_id uuid references public.infringement_types(id) on delete set null,
  vehicle_id text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  address text,
  notes text,
  issued_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create index idx_infringements_officer_id on public.infringements(officer_id);
create index idx_infringements_agency_id on public.infringements(agency_id);
create index idx_infringements_team_id on public.infringements(team_id);
create index idx_infringements_route_id on public.infringements(route_id);
create index idx_infringements_type_id on public.infringements(type_id);
create index idx_infringements_issued_at on public.infringements(issued_at);
create index idx_infringements_vehicle_id on public.infringements(vehicle_id);

-- RLS for infringements
alter table public.infringements enable row level security;

create policy "Super admins can manage all infringements"
  on public.infringements for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can manage their agency infringements"
  on public.infringements for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = infringements.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can create infringements"
  on public.infringements for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.id = infringements.officer_id
    )
  );

create policy "Officers can view their own infringements"
  on public.infringements for select
  using (
    auth.uid() = officer_id
    or exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.agency_id = infringements.agency_id
    )
  );

create policy "Officers can update their own infringements"
  on public.infringements for update
  using (auth.uid() = officer_id);

-- ============================================================================================
-- EVIDENCE PHOTOS
-- ============================================================================================
create table public.evidence_photos (
  id uuid primary key default gen_random_uuid(),
  infringement_id uuid not null references public.infringements(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size integer,
  mime_type text,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

create index idx_evidence_photos_infringement_id on public.evidence_photos(infringement_id);
create index idx_evidence_photos_uploaded_by on public.evidence_photos(uploaded_by);

-- RLS for evidence_photos
alter table public.evidence_photos enable row level security;

create policy "Super admins can manage all evidence photos"
  on public.evidence_photos for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can view their agency evidence photos"
  on public.evidence_photos for select
  using (
    exists (
      select 1 from public.users
      join public.infringements on infringements.id = evidence_photos.infringement_id
      where users.id = auth.uid()
      and users.agency_id = infringements.agency_id
      and users.role = 'agency_admin'
    )
  );

create policy "Officers can manage their own evidence photos"
  on public.evidence_photos for all
  using (
    auth.uid() = uploaded_by
    or exists (
      select 1 from public.infringements
      where infringements.id = evidence_photos.infringement_id
      and infringements.officer_id = auth.uid()
    )
  );

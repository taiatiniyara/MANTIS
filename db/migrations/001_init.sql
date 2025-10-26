-- ============================
-- Agencies
-- ============================
create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- ============================
-- Locations (hierarchical)
-- ============================
create table locations (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id),
  type text check (type in ('division','station','post','region','office','council','department','zone')),
  name text not null,
  parent_id uuid references locations(id),
  created_at timestamptz default now()
);

-- ============================
-- Users
-- ============================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid references agencies(id),
  role text check (role in ('super_admin','agency_admin','officer')),
  position text,
  location_id uuid references locations(id),
  created_at timestamptz default now()
);

-- ============================
-- Teams & Routes
-- ============================
create table teams (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id),
  name text not null,
  created_at timestamptz default now()
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id),
  name text not null,
  description text,
  location_id uuid references locations(id),
  created_at timestamptz default now()
);

create table team_routes (
  team_id uuid references teams(id) on delete cascade,
  route_id uuid references routes(id) on delete cascade,
  primary key (team_id, route_id)
);

create table team_members (
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  primary key (team_id, user_id)
);

-- ============================
-- Infringement Categories & Types
-- ============================
create table infringement_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table infringement_types (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references infringement_categories(id) on delete cascade,
  code text not null unique,
  name text not null,
  description text,
  fine_amount numeric(10,2),
  demerit_points int,
  gl_code text not null,
  created_at timestamptz default now()
);

-- ============================
-- Infringements
-- ============================
create table infringements (
  id uuid primary key default gen_random_uuid(),
  officer_id uuid references users(id),
  agency_id uuid references agencies(id),
  team_id uuid references teams(id),
  route_id uuid references routes(id),
  type_id uuid references infringement_types(id),
  vehicle_id text,
  latitude double precision,
  longitude double precision,
  address text,
  notes text,
  issued_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Data Management & Archiving Tables

-- Archive table for storing archived infringements
create table if not exists archived_infringements (
  id uuid primary key default uuid_generate_v4(),
  original_id uuid not null,
  vehicle_id text,
  infringement_number text,
  issued_at timestamp with time zone,
  location_id uuid,
  officer_id uuid,
  team_id uuid,
  route_id uuid,
  agency_id uuid,
  type_id uuid,
  notes text,
  photo_url text,
  video_url text,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  archived_at timestamp with time zone default now(),
  archived_by uuid references users(id),
  archive_reason text,
  metadata jsonb
);

-- Data retention policies table
create table if not exists data_retention_policies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  table_name text not null,
  retention_days integer not null,
  archive_enabled boolean default true,
  delete_enabled boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references users(id)
);

-- Archive jobs table for tracking archival operations
create table if not exists archive_jobs (
  id uuid primary key default uuid_generate_v4(),
  job_type text not null, -- 'archive', 'restore', 'delete'
  table_name text not null,
  status text not null default 'pending', -- 'pending', 'running', 'completed', 'failed'
  records_processed integer default 0,
  records_total integer default 0,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error_message text,
  filter_criteria jsonb,
  created_at timestamp with time zone default now(),
  created_by uuid references users(id)
);

-- Backup metadata table
create table if not exists backup_metadata (
  id uuid primary key default uuid_generate_v4(),
  backup_name text not null,
  backup_type text not null, -- 'full', 'incremental', 'table'
  table_names text[],
  file_path text,
  file_size bigint,
  record_count integer,
  status text not null default 'pending', -- 'pending', 'completed', 'failed'
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  created_by uuid references users(id),
  metadata jsonb
);

-- Create indexes for better performance
create index if not exists idx_archived_infringements_original_id on archived_infringements(original_id);
create index if not exists idx_archived_infringements_archived_at on archived_infringements(archived_at);
create index if not exists idx_archived_infringements_agency_id on archived_infringements(agency_id);
create index if not exists idx_archive_jobs_status on archive_jobs(status);
create index if not exists idx_archive_jobs_created_at on archive_jobs(created_at);
create index if not exists idx_backup_metadata_created_at on backup_metadata(created_at);

-- Enable RLS
alter table archived_infringements enable row level security;
alter table data_retention_policies enable row level security;
alter table archive_jobs enable row level security;
alter table backup_metadata enable row level security;

-- RLS Policies for archived_infringements
create policy "Super admins can view all archived infringements"
  on archived_infringements for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Agency admins can view their archived infringements"
  on archived_infringements for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'agency_admin'
      and users.agency_id = archived_infringements.agency_id
    )
  );

create policy "Super admins can insert archived infringements"
  on archived_infringements for insert
  to authenticated
  with check (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

-- RLS Policies for data_retention_policies
create policy "Super admins can manage retention policies"
  on data_retention_policies for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

-- RLS Policies for archive_jobs
create policy "Super admins can view all archive jobs"
  on archive_jobs for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Super admins can create archive jobs"
  on archive_jobs for insert
  to authenticated
  with check (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

-- RLS Policies for backup_metadata
create policy "Super admins can manage backups"
  on backup_metadata for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

-- Insert default retention policies
insert into data_retention_policies (name, description, table_name, retention_days, archive_enabled, delete_enabled, is_active)
values 
  ('Infringements - 2 Year Archive', 'Archive infringements older than 2 years', 'infringements', 730, true, false, true),
  ('Audit Logs - 1 Year Delete', 'Delete audit logs older than 1 year', 'audit_logs', 365, false, true, true),
  ('Archived Data - 5 Year Delete', 'Delete archived infringements older than 5 years', 'archived_infringements', 1825, false, true, true)
on conflict do nothing;

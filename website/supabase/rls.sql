-- =============================================================================
-- MANTIS — Row Level Security (RLS) policies
-- =============================================================================
-- Version-controlled source of truth for authorization. NOT managed by
-- drizzle-kit (which only syncs table schema) — apply this file separately.
--
-- HOW TO APPLY
--   Supabase Dashboard → SQL Editor → paste this file → Run.
--   (Runs as the project owner / postgres, which is required so the helper
--    functions below are SECURITY DEFINER and can bypass RLS without recursion.)
--   Re-running is safe: every statement is idempotent (drop-if-exists + create).
--
-- MODEL (two-tier)
--   Platform admins (DEV Engineer / App Admin / Super Admin) → full access to
--                   everything. They share identical data access; their
--                   differences (styling ownership, who-creates-whom) live in
--                   the app layer, not RLS.  → is_platform_admin()
--   Tenant Admin  → manages only rows in their own agency_id (the tenant)
--   Officer / Team Leader → operational reads in their tenant; create
--                   infringements they own
--   anon (no login) → NO access, except the small public reference reads
--                   needed by the registration screen (agencies, teams)
--
-- WHY THIS EXISTS
--   Before applying this, RLS was OFF on every table — the public client key
--   could read/write all data including citizen PII. Enabling RLS + these
--   policies is the real security boundary; the client role checks are only UX.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. Helper functions
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER so they execute as the owner (postgres / BYPASSRLS). This is
-- what lets a policy ON public.users call a function that READS public.users
-- without infinite RLS recursion. search_path is pinned for safety.

create or replace function public.auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.auth_agency_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select agency_id from public.users where id = auth.uid();
$$;

-- Platform admins = the three global-admin tiers (DEV Engineer, App Admin,
-- Super Admin). They share identical full data access; their differences
-- (styling ownership, who-can-create-whom) are enforced in the app layer.
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('DEV Engineer', 'App Admin', 'Super Admin')
       from public.users where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'App Admin' from public.users where id = auth.uid()),
    false
  );
$$;

-- Tenant Admin = the per-tenant (per-agency) admin (formerly "Agency Admin").
create or replace function public.is_tenant_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'Tenant Admin' from public.users where id = auth.uid()),
    false
  );
$$;

-- True if the infringement belongs to the caller's agency (or caller is super
-- admin). Used by child tables (evidence_files, payments, appeals) so they can
-- scope without each writing their own correlated subquery against an
-- RLS-protected table.
create or replace function public.infringement_in_scope(inf_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
      or exists (
        select 1 from public.infringements i
        where i.id = inf_id
          and i.agency_id = public.auth_agency_id()
      );
$$;

grant execute on function
  public.auth_role(),
  public.auth_agency_id(),
  public.is_platform_admin(),
  public.is_app_admin(),
  public.is_tenant_admin(),
  public.infringement_in_scope(uuid)
to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 1. Enable RLS on every table (default-deny once enabled)
-- -----------------------------------------------------------------------------
alter table public.agencies            enable row level security;
alter table public.locations           enable row level security;
alter table public.teams               enable row level security;
alter table public.users               enable row level security;
alter table public.drivers             enable row level security;
alter table public.vehicles            enable row level security;
alter table public.offence_categories  enable row level security;
alter table public.offences            enable row level security;
alter table public.infringements       enable row level security;
alter table public.evidence_files      enable row level security;
alter table public.payments            enable row level security;
alter table public.appeals             enable row level security;
alter table public.audit_logs          enable row level security;


-- -----------------------------------------------------------------------------
-- 2. AGENCIES — public reference data; only Super Admin writes
-- -----------------------------------------------------------------------------
drop policy if exists agencies_select on public.agencies;
create policy agencies_select on public.agencies
  for select to anon, authenticated
  using (true);

drop policy if exists agencies_write on public.agencies;
create policy agencies_write on public.agencies
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());


-- -----------------------------------------------------------------------------
-- 3. TEAMS — readable for registration/dropdowns; Super Admin or owning Agency
--    Admin writes
-- -----------------------------------------------------------------------------
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams
  for select to anon, authenticated
  using (true);

drop policy if exists teams_write on public.teams;
create policy teams_write on public.teams
  for all to authenticated
  using (
    public.is_platform_admin()
    or (public.is_tenant_admin() and agency_id = public.auth_agency_id())
  )
  with check (
    public.is_platform_admin()
    or (public.is_tenant_admin() and agency_id = public.auth_agency_id())
  );


-- -----------------------------------------------------------------------------
-- 4. LOCATIONS — any authenticated user reads (jurisdiction/pickers);
--    Super Admin writes any, Agency Admin writes only their agency's locations
-- -----------------------------------------------------------------------------
drop policy if exists locations_select on public.locations;
create policy locations_select on public.locations
  for select to authenticated
  using (true);

drop policy if exists locations_write on public.locations;
create policy locations_write on public.locations
  for all to authenticated
  using (
    public.is_platform_admin()
    or (public.is_tenant_admin() and agency_id = public.auth_agency_id())
  )
  with check (
    public.is_platform_admin()
    or (public.is_tenant_admin() and agency_id = public.auth_agency_id())
  );


-- -----------------------------------------------------------------------------
-- 5. USERS — the sensitive directory. Self + agency-scoped + Super Admin.
--    Inserts are Super Admin only from the client; Agency-Admin provisioning is
--    expected to go through a service-role Edge Function (which bypasses RLS).
-- -----------------------------------------------------------------------------
drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select to authenticated
  using (
    public.is_platform_admin()
    or id = auth.uid()
    or (public.is_tenant_admin() and agency_id = public.auth_agency_id())
  );

drop policy if exists users_insert on public.users;
create policy users_insert on public.users
  for insert to authenticated
  with check (public.is_platform_admin());

drop policy if exists users_update on public.users;
create policy users_update on public.users
  for update to authenticated
  using (
    public.is_platform_admin()
    or id = auth.uid()
    or (public.is_tenant_admin() and agency_id = public.auth_agency_id())
  )
  with check (
    public.is_platform_admin()
    -- Tenant Admin may edit users in their tenant but cannot mint platform admins
    or (public.is_tenant_admin()
        and agency_id = public.auth_agency_id()
        and role not in ('DEV Engineer', 'App Admin', 'Super Admin'))
    -- A user editing their own row cannot change their role or agency
    or (id = auth.uid()
        and role = public.auth_role()
        and agency_id = public.auth_agency_id())
  );

drop policy if exists users_delete on public.users;
create policy users_delete on public.users
  for delete to authenticated
  using (public.is_platform_admin());


-- -----------------------------------------------------------------------------
-- 6. DRIVERS & VEHICLES — national records used during enforcement.
--    Any authenticated app user reads/creates/updates; Super Admin deletes.
-- -----------------------------------------------------------------------------
drop policy if exists drivers_select on public.drivers;
create policy drivers_select on public.drivers
  for select to authenticated using (true);

drop policy if exists drivers_cud on public.drivers;
create policy drivers_cud on public.drivers
  for all to authenticated
  using (
    public.auth_role() in ('DEV Engineer','App Admin','Super Admin','Tenant Admin','Team Leader','Officer')
  )
  with check (
    public.auth_role() in ('DEV Engineer','App Admin','Super Admin','Tenant Admin','Team Leader','Officer')
  );

drop policy if exists vehicles_select on public.vehicles;
create policy vehicles_select on public.vehicles
  for select to authenticated using (true);

drop policy if exists vehicles_cud on public.vehicles;
create policy vehicles_cud on public.vehicles
  for all to authenticated
  using (
    public.auth_role() in ('DEV Engineer','App Admin','Super Admin','Tenant Admin','Team Leader','Officer')
  )
  with check (
    public.auth_role() in ('DEV Engineer','App Admin','Super Admin','Tenant Admin','Team Leader','Officer')
  );


-- -----------------------------------------------------------------------------
-- 7. OFFENCE CATEGORIES — national catalogue: read for all authenticated,
--    write Super Admin only
-- -----------------------------------------------------------------------------
drop policy if exists offence_categories_select on public.offence_categories;
create policy offence_categories_select on public.offence_categories
  for select to authenticated using (true);

drop policy if exists offence_categories_write on public.offence_categories;
create policy offence_categories_write on public.offence_categories
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());


-- -----------------------------------------------------------------------------
-- 8. OFFENCES — read for all authenticated. Super Admin manages the national
--    catalogue (any row, incl. agency_id NULL); Agency Admin manages only
--    offences scoped to their own agency.
-- -----------------------------------------------------------------------------
drop policy if exists offences_select on public.offences;
create policy offences_select on public.offences
  for select to authenticated using (true);

drop policy if exists offences_write on public.offences;
create policy offences_write on public.offences
  for all to authenticated
  using (
    public.is_platform_admin()
    or (public.is_tenant_admin() and agency_id = public.auth_agency_id())
  )
  with check (
    public.is_platform_admin()
    or (public.is_tenant_admin() and agency_id = public.auth_agency_id())
  );


-- -----------------------------------------------------------------------------
-- 9. INFRINGEMENTS — core enforcement record, agency-scoped.
-- -----------------------------------------------------------------------------
drop policy if exists infringements_select on public.infringements;
create policy infringements_select on public.infringements
  for select to authenticated
  using (
    public.is_platform_admin()
    or agency_id = public.auth_agency_id()
  );

drop policy if exists infringements_insert on public.infringements;
create policy infringements_insert on public.infringements
  for insert to authenticated
  with check (
    public.is_platform_admin()
    or (agency_id = public.auth_agency_id() and officer_id = auth.uid())
  );

drop policy if exists infringements_update on public.infringements;
create policy infringements_update on public.infringements
  for update to authenticated
  using (
    public.is_platform_admin()
    or agency_id = public.auth_agency_id()
  )
  with check (
    public.is_platform_admin()
    or agency_id = public.auth_agency_id()
  );

drop policy if exists infringements_delete on public.infringements;
create policy infringements_delete on public.infringements
  for delete to authenticated
  using (public.is_platform_admin());


-- -----------------------------------------------------------------------------
-- 10. EVIDENCE FILES / PAYMENTS / APPEALS — scoped via parent infringement
-- -----------------------------------------------------------------------------
drop policy if exists evidence_files_select on public.evidence_files;
create policy evidence_files_select on public.evidence_files
  for select to authenticated
  using (public.infringement_in_scope(infringement_id));

drop policy if exists evidence_files_write on public.evidence_files;
create policy evidence_files_write on public.evidence_files
  for all to authenticated
  using (public.infringement_in_scope(infringement_id))
  with check (public.infringement_in_scope(infringement_id));

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select to authenticated
  using (public.infringement_in_scope(infringement_id));

drop policy if exists payments_write on public.payments;
create policy payments_write on public.payments
  for all to authenticated
  using (
    public.is_platform_admin()
    or public.infringement_in_scope(infringement_id)
  )
  with check (
    public.is_platform_admin()
    or public.infringement_in_scope(infringement_id)
  );

drop policy if exists appeals_select on public.appeals;
create policy appeals_select on public.appeals
  for select to authenticated
  using (public.infringement_in_scope(infringement_id));

drop policy if exists appeals_insert on public.appeals;
create policy appeals_insert on public.appeals
  for insert to authenticated
  with check (public.infringement_in_scope(infringement_id));

drop policy if exists appeals_update on public.appeals;
create policy appeals_update on public.appeals
  for update to authenticated
  using (
    public.is_platform_admin()
    or public.infringement_in_scope(infringement_id)
  )
  with check (
    public.is_platform_admin()
    or public.infringement_in_scope(infringement_id)
  );


-- -----------------------------------------------------------------------------
-- 11. AUDIT LOGS — Super Admin reads; nobody writes from the client.
--     (Writes should come only from SECURITY DEFINER triggers, which bypass
--     these policies. With RLS enabled and no INSERT/UPDATE/DELETE policy,
--     all direct client writes are denied.)
-- -----------------------------------------------------------------------------
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (public.is_platform_admin());


-- -----------------------------------------------------------------------------
-- 12. Clean up helpers from the previous (two-tier) model.
--     Safe here: all policies above now reference is_platform_admin /
--     is_tenant_admin, so nothing depends on these anymore.
-- -----------------------------------------------------------------------------
drop function if exists public.is_super_admin();
drop function if exists public.is_agency_admin();

-- =============================================================================
-- End of RLS policies
-- =============================================================================

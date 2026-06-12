-- =============================================================================
-- MANTIS — CHECK constraints for closed-vocabulary columns
-- =============================================================================
-- Version-controlled source of truth for column value vocabularies. NOT managed
-- by drizzle-kit. Apply in the Supabase SQL Editor (same as rls.sql).
--
-- WHY
--   These columns are free-text but only ever hold a fixed set of values. The
--   most important is users.role — RLS (rls.sql) authorizes by exact string
--   match (= 'Super Admin'), so a typo'd role silently breaks authorization.
--   Constraining the vocabulary at the DB level guarantees RLS correctness and
--   keeps dropdowns and stored data in lock-step.
--
-- WHY "NOT VALID"
--   Adding a CHECK to a table with existing data fails if any current row
--   violates it. NOT VALID enforces the constraint on every INSERT/UPDATE from
--   now on, but skips validating pre-existing rows — so applying this is safe
--   on a live database regardless of legacy values. After cleaning legacy data
--   you can promote a constraint with:
--       ALTER TABLE public.<t> VALIDATE CONSTRAINT <name>;
--   (See the "find violators" queries at the bottom.)
--
-- Idempotent: every constraint is dropped-if-exists before being re-added.
--
-- Vocabularies mirror the TypeScript unions in mobile/lib/types.ts and the
-- schema $type<>() annotations in website/src/lib/supabase/schema.ts.
-- =============================================================================


-- agencies.type  →  AgencyType
alter table public.agencies drop constraint if exists agencies_type_check;
alter table public.agencies add constraint agencies_type_check
  check (type in ('National','Municipal','Police')) not valid;

-- users.role  →  Role   (RLS linchpin — keep in sync with rls.sql helpers)
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in (
    'Super Admin','Agency Admin','Team Leader','Officer',
    'Citizen','Government Official'
  )) not valid;

-- locations.type  →  LocationType
alter table public.locations drop constraint if exists locations_type_check;
alter table public.locations add constraint locations_type_check
  check (type in (
    'country','division','province','municipal','ward','station','office'
  )) not valid;

-- offences.severity  →  OffenceSeverity
alter table public.offences drop constraint if exists offences_severity_check;
alter table public.offences add constraint offences_severity_check
  check (severity in ('minor','serious','critical')) not valid;

-- offences.agency_type  →  AgencyType  (auto-derived from the agency; see Q7)
-- NOTE: legacy rows may hold older values (e.g. 'LTA'/'POLICE'/'MUNICIPAL').
-- NOT VALID tolerates them; clean them up before VALIDATE.
alter table public.offences drop constraint if exists offences_agency_type_check;
alter table public.offences add constraint offences_agency_type_check
  check (agency_type in ('National','Municipal','Police')) not valid;

-- infringements.status  →  InfringementStatus
alter table public.infringements drop constraint if exists infringements_status_check;
alter table public.infringements add constraint infringements_status_check
  check (status in (
    'draft','pending','approved','paid','appealed',
    'appeal_approved','appeal_rejected','cancelled','overdue'
  )) not valid;

-- payments.method  →  PaymentMethod
alter table public.payments drop constraint if exists payments_method_check;
alter table public.payments add constraint payments_method_check
  check (method in (
    'mpaisa','mycash','card','postfiji','cash','bank_transfer'
  )) not valid;

-- appeals.status  →  AppealStatus  (nullable column; NULL passes a CHECK)
alter table public.appeals drop constraint if exists appeals_status_check;
alter table public.appeals add constraint appeals_status_check
  check (status in ('pending','reviewing','approved','rejected')) not valid;


-- =============================================================================
-- Promoting constraints to fully-validated (run later, after cleaning data)
-- =============================================================================
-- 1. Find rows that would violate a constraint, e.g.:
--
--    select id, role from public.users
--    where role not in ('Super Admin','Agency Admin','Team Leader','Officer',
--                        'Citizen','Government Official');
--
--    select id, agency_type from public.offences
--    where agency_type not in ('National','Municipal','Police');
--
-- 2. Fix those rows (UPDATE ... set <col> = '<valid value>').
--
-- 3. Validate the constraint (locks briefly, scans the table once):
--
--    alter table public.users     validate constraint users_role_check;
--    alter table public.agencies  validate constraint agencies_type_check;
--    alter table public.locations validate constraint locations_type_check;
--    alter table public.offences  validate constraint offences_severity_check;
--    alter table public.offences  validate constraint offences_agency_type_check;
--    alter table public.infringements validate constraint infringements_status_check;
--    alter table public.payments  validate constraint payments_method_check;
--    alter table public.appeals   validate constraint appeals_status_check;
-- =============================================================================

-- =============================================================================
-- MANTIS — data migration: rename AgencyType vocabulary
-- =============================================================================
--   National  -> Authority
--   Municipal -> Municipality
--   Police    -> (unchanged)
--
-- Affects existing rows in agencies.type and offences.agency_type.
--
-- APPLY ORDER
--   1. Re-apply constraints.sql FIRST (it now allows 'Authority'/'Municipality';
--      the OLD constraint would reject these UPDATEs otherwise).
--   2. Run this file.
-- Idempotent: safe to re-run.
-- =============================================================================

update public.agencies set type = 'Authority'    where type = 'National';
update public.agencies set type = 'Municipality'  where type = 'Municipal';

update public.offences set agency_type = 'Authority'   where agency_type = 'National';
update public.offences set agency_type = 'Municipality' where agency_type = 'Municipal';

-- Optional sanity check — should return no rows after migrating:
--   select 'agencies' src, type val from public.agencies where type in ('National','Municipal')
--   union all
--   select 'offences', agency_type from public.offences where agency_type in ('National','Municipal');

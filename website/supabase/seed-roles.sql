-- =============================================================================
-- MANTIS — seed the new role hierarchy onto existing accounts
-- =============================================================================
-- Run AFTER re-applying rls.sql (which now recognizes DEV Engineer / App Admin
-- / Super Admin as platform admins). See the ORDER note at the bottom.
--
-- Goal: place the two current "Super Admin" users at the top two tiers —
-- one DEV Engineer, one App Admin — per the agreed hierarchy.
--
-- Fill in the real emails. (auth.users holds the email; public.users holds role.)
-- =============================================================================

-- 1. Promote one super-user to DEV Engineer:
update public.users u
set role = 'DEV Engineer'
from auth.users a
where a.id = u.id
  and a.email = 'dev-engineer@example.com';   -- <-- set me

-- 2. Promote the other to App Admin:
update public.users u
set role = 'App Admin'
from auth.users a
where a.id = u.id
  and a.email = 'app-admin@example.com';       -- <-- set me

-- Sanity check — see everyone's current role:
--   select u.role, a.email
--   from public.users u join auth.users a on a.id = u.id
--   order by u.role;

-- =============================================================================
-- APPLY ORDER (important)
-- =============================================================================
-- The currently-applied rls.sql still gates on role = 'Super Admin'. If you
-- change these users to DEV Engineer / App Admin BEFORE re-applying rls.sql,
-- they will lose access until you do. Correct order:
--
--   1. Re-apply  rls.sql         (adds is_platform_admin → DEV Engineer / App
--                                 Admin / Super Admin all keep full access)
--   2. Apply     constraints.sql (now allows the new role vocabulary; NOT VALID
--                                 so it won't fail on existing rows)
--   3. Run       this file       (re-assign the two accounts)
-- =============================================================================

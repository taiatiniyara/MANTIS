# Supabase — security & policies

Source of truth for **Row Level Security**. Drizzle (`drizzle-kit push`) only syncs
table *schema*; it does **not** manage RLS, policies, functions, or triggers.
Those live here and are applied separately.

## Files

| File | Purpose |
|------|---------|
| `rls.sql` | Helper functions + `enable row level security` + policies for every table, encoding the two-tier authorization model. |
| `constraints.sql` | `CHECK` constraints (`NOT VALID`) pinning closed-vocabulary columns (`users.role`, statuses, types, methods). Guards RLS correctness — apply after `rls.sql`. |
| `seed-roles.sql` | Re-assigns the two existing super-users to the new top tiers (DEV Engineer + App Admin). Documents the **apply order** (rls → constraints → seed). |
| `app-theme.sql` | Creates the `app_theme` table (single-row, app-wide design tokens) + RLS (everyone reads; App Admin / DEV Engineer write). Powers the in-app `/styling` editor. |

## Why this matters (read before skipping)

RLS was **disabled** on every table. Because the Supabase *publishable* key ships
inside the client bundle, that meant anyone could read — and almost certainly
write/delete — the entire database, **including citizen PII** (`drivers`,
`infringements`, the `users` directory). Applying `rls.sql` closes that hole.
Until it is applied, treat the database as public.

## How to apply

1. Supabase Dashboard → **SQL Editor**.
2. Paste the contents of `rls.sql` and **Run**.
   - Must run as the project owner (the SQL Editor does). This is required so the
     `SECURITY DEFINER` helper functions can read `users` from inside a policy on
     `users` without RLS recursion.
   - The file is **idempotent** — safe to re-run after edits.

## After applying — verify

- **Unauthenticated is now denied.** With only the publishable key and no login,
  a read of `users` / `drivers` / `infringements` should return `[]` (not rows).
- **Log in and click through.** Confirm dashboards still load for each role.
  Reference reads (`agencies`, `teams`) remain public so the **registration
  screen dropdowns keep working**; everything else needs a session.
- If a screen suddenly shows empty data after applying, it's almost always an
  RLS policy that's stricter than the query expects — check the table's policy
  against what role/agency the logged-in user has.

## Not yet implemented (follow-ups from the design session)

- **Audit triggers** → `audit_logs` (decided: DB triggers capturing `auth.uid()`
  + before/after on sensitive tables). Will be added as `audit.sql` here.
- **Edge Function** for user provisioning (service-role, caller-verified, email
  invite) — replaces the client-side `signUp` in the Add User form.
- **`active` columns** for soft-deactivate on `agencies`, `users`, `teams`,
  `locations`, `drivers`, `vehicles` (a Drizzle schema change + `drizzle-kit
  push`), then `... and active` predicates can be added to read policies.

## Note on public self-registration

`/auth/register` lets anyone sign up (it reads `agencies`/`teams` while logged
out — which is why those two tables allow `anon` select). For a government
enforcement system you most likely want to **disable open registration** and
provision users via the Edge Function instead. Flagged, not yet changed.

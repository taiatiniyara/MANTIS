# Admin Surface — Authorization & CRUD Design Decisions

Status: **agreed** (design session 2026-06-11/12). Captures the resolved decision
tree for the MANTIS web admin surface. Source of truth for the build sequence
below. Security-critical items reference `website/supabase/`.

## Context

The website is the multi-agency admin/management portal. A design session walked
the decision tree for turning the "Add-only" forms into a production/tender-grade
admin surface, after discovering the database was wide open (RLS off).

## Role hierarchy (revised 2026-06-12 — supersedes the two-tier model below)

Five tiers, each provisioning the tier directly beneath it. Higher tiers are
supersets (for now).

| # | Role | Owns | Registers | Scope |
|---|------|------|-----------|-------|
| 1 | **DEV Engineer** | Full dev rights; *no* admin/styling exclusivity yet — reserved for future dev tooling. Kept separate from admin functions. | App Admins | Global |
| 2 | **App Admin** | All global management screens **+ in-app styling & generic-text editing** (`/styling`) | Super Admins | Global |
| 3 | **Super Admin** | Global management (agencies, locations, offences, teams, users) — today's privileges, retained | Tenant Admins | Global |
| 4 | **Tenant Admin** *(renamed from Agency Admin)* | Tenant-scoped: add/deactivate user, reset password, tenant teams/locations | Users (own tenant) | One tenant |
| 5 | **Users** | Officer, Team Leader, Citizen, Government Official | — | — |

Implementation notes:
- **RLS:** DEV Engineer / App Admin / Super Admin share identical full data access via `is_platform_admin()`. Their differences (styling, who-creates-whom) are app-layer, not RLS. Tenant Admin = `is_tenant_admin()` (renamed from `is_agency_admin`), still scoped by `agency_id` (tenant = agency).
- **Routes:** `/super-admin` (global mgmt) allows all three platform admins; `/styling` allows DEV Engineer + App Admin; `/tenant-admin` (renamed from `/agency-admin`) allows Tenant Admin. `/app-admin` + `/dev-engineer` are login-landing redirects → `/super-admin`. The old `/dev` Design Reference moved to `/styling` (App-Admin-owned).
- **Provisioning:** the Add-User role dropdown is limited to roles strictly below the creator's tier (`CREATABLE_ROLES`). Server-side enforcement lands with the Edge Function.
- **SQL re-apply required:** `rls.sql` + `constraints.sql` changed; see `website/supabase/seed-roles.sql` for the apply order, then re-assign the two existing super-users to DEV Engineer + App Admin.

## Decisions

| # | Decision | Resolution | Rationale |
|---|----------|-----------|-----------|
| Q1 | End-state | **Production / tender-grade** | Schema already carries production signals (audit_logs, role model, unique codes, location tree). |
| Q2 | Tenancy | **Two-tier scoped** | Super Admin owns agencies + national offence catalogue; Agency Admin manages own teams/locations/users/agency-offences, auto-scoped by `agency_id`. Matches "clean data separation" pitch. |
| Q3 | Enforcement | **Versioned RLS + client guard** | RLS was OFF — PII readable with the public key. RLS is the control; client `RoleProtectedRoute` is UX only. |
| Q4 | Mutations | **Add + Edit + soft-deactivate** | FK refs (infringements → offences/agencies/users) block hard-delete and destroy history. Hard-delete only for unreferenced leaf rows. |
| Q5 | User provisioning | **Edge Function + email invite** | Service-role function verifies caller, enforces scoping, invites by email. Client `signUp` can't be trusted to set roles under RLS. |
| Q6 | Audit | **DB triggers → `audit_logs`** | Capture `auth.uid()` + before/after on sensitive tables. Triggers can't be bypassed; app-layer logging misses paths. |
| Q7 | Offence owner fields | **Auto-derive `agency_type`** | If `agency_id` set, `agency_type` = that agency's type (don't ask). Manual only for national offences (`agency_id` null). Kills mismatched type-vs-agency data. |
| Q8 | Deactivate cascade | **Block with a message** | Refuse to deactivate a parent (agency/team) with active dependents; admin clears children first. No surprise mass-deactivation. Leaf rows deactivate freely. |
| Q9 | Data integrity | **CHECK constraints** | Version-controlled `CHECK`s for role/agency-type/severity/status/method/location-type. `users.role` is the RLS linchpin — a bad value silently breaks authorization. |
| Q10 | Location hierarchy | **Guided dropdown, soft rules** | Replace raw UUID input with a location picker filtered to sensible parent levels; defer hard DB ordering until Fiji's admin structure is confirmed. |
| Q11 | Registration | **Provision-only (disable signup)** | `/auth/register` lets anyone mint an Officer in any agency — contradicts Q5. Disabling it lets us revoke `anon` reads on agencies/teams and fully close the DB. |
| Q12 | CRUD scope | **Config tables only** | Agencies, locations, teams, offences, categories, users. Drivers/vehicles/infringements are operational data → a separate module. |
| Q13 | Mobile theme | **Later / separate pass** | Finish web admin + security spine first; mobile theming is independent and lower-risk. |

## Defaults (settled, not separately debated)

- Deactivated rows hidden from lists by default with a **"Show inactive"** toggle; reactivation allowed.
- `RoleProtectedRoute` redirects: not-signed-in → `/auth/login`; wrong role → own dashboard; no profile → login.
- Edit reuses the create form as a shared component (`mode: create | edit`).

## Build sequence

1. ✅ **RLS** — `website/supabase/rls.sql`, applied & verified (anon reads of users/drivers/infringements return `[]`).
2. ✅ **`RoleProtectedRoute`** — wired into super-admin / agency-admin / officer layouts; verified redirect.
3. ✅ **CHECK constraints** (Q9) — `website/supabase/constraints.sql` authored (`NOT VALID`); apply in SQL Editor.
4. ⬜ **`active` columns** (Q4) on agencies/users/teams/locations/drivers/vehicles (Drizzle schema + `drizzle-kit push`).
5. ⬜ **Two-tier scoped forms** (Q2, Q7) — agency-admin Offence/User/Team/Location create, auto-injecting `agency_id`; offence `agency_type` auto-derived.
6. ⬜ **Edit + soft-deactivate** (Q4, Q8) — shared form; block-on-active-children for parents; "Show inactive" toggle.
7. ⬜ **FK pickers** (Q10) — location parent dropdown, etc.
8. ⬜ **Provision-only** (Q11) — disable `/auth/register`, then revoke `anon` SELECT on agencies/teams in `rls.sql`.
9. ⬜ **Edge Function** (Q5) — invite-based user provisioning.
10. ⬜ **Audit triggers** (Q6) — `website/supabase/audit.sql`.
11. ⬜ **Mobile theme parity** (Q13) — separate pass.

## Open / deferred

- Strict location parent-type ordering (Q10) — revisit with the ministry's confirmed administrative structure.
- Infringement lifecycle/status workflow, TIN uniqueness — operational, out of this admin-config scope.

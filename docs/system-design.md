# 🛠️ MANTIS — System Design

## 1. Purpose & Vision

MANTIS (Multi‑Agency National Traffic Infringement System) is a centralized platform for recording, managing, and analyzing traffic infringements across Fiji.  
It replaces fragmented, paper‑ or Excel‑based processes with a secure, cloud‑based solution that unifies the **Fiji Police Force**, **Land Transport Authority (LTA)**, and **City/Town Councils**.

**Core principles:**

- **Consistency**: Standardized infringement categories and types across agencies.
- **Transparency**: Shared data model with role‑based access.
- **Scalability**: Cloud‑first design, extensible schema, modular apps.
- **Finance alignment**: Each infringement type mapped to a General Ledger (GL) code for accounting.

---

## 2. High‑Level Architecture

- **Frontend**
  - **Web (Next.js)**: Admin dashboards styled with [shadcn/ui](https://ui.shadcn.com/), Tailwind CSS, and a blue + zinc light theme.
  - **Mobile (React Native/Expo)**: Officer app with matching palette and typography system.
- **Backend**
  - **Supabase Cloud**:
    - Postgres database with Row Level Security (RLS).
    - Supabase Auth for identity and roles.
    - Edge Functions for business logic and RPC endpoints.
- **Docs**
  - Markdown files for schema, API, onboarding, and sprint tracking.
- **Migrations**
  - 6 SQL migrations in `supabase/migrations/` for schema evolution.
  - 17 core tables with PostGIS for spatial queries.
  - Database managed through Supabase migrations and dashboard.

---

## 3. Roles & Permissions

- **Super Admin**
  - Create/manage agencies.
  - Assign Agency Admins.
  - Cross‑agency reporting.
- **Agency Admin**
  - Manage users, teams, routes, and locations within their agency.
  - View and filter infringements for their agency.
- **Officer**
  - Record infringements via mobile app.
  - View their own records.

---

## 4. Core Data Model

### Agencies & Users

- `agencies`: top‑level entities (Police, LTA, Councils).
- `users`: linked to agencies, with `role` and `position`.

### Locations

- `locations`: hierarchical model with `type` (division, station, region, council, department, zone).
- Supports Fiji Police divisions/stations, LTA regions/offices, and Council jurisdictions.

### Teams & Routes

- `teams`: enforcement groups within an agency.
- `routes`: geographic or operational routes.
- `team_routes` and `team_members`: many‑to‑many assignments.

### Infringements

- `infringements`: records of incidents, linked to officer, agency, team, route, location, and infringement type.

### Infringement Categories & Types

- `infringement_categories`: broad buckets (Speeding, Parking, Licensing, etc.).
- `infringement_types`: specific offences with:
  - `code` (e.g., SPD‑001)
  - `fine_amount`
  - `demerit_points`
  - `gl_code` (for finance grouping)

---

## 5. Security & RLS

- **Super Admin**: unrestricted access.
- **Agency Admin**: CRUD within their agency.
- **Officer**: insert infringements, view own records.
- RLS policies enforce agency boundaries and role‑based access.

---

## 6. User Flows

### Officer (Mobile)

1. Log in with Supabase Auth.
2. Select infringement category → type.
3. Enter vehicle details, notes, location.
4. Submit → record stored in Supabase.

### Agency Admin (Web)

1. Log in.
2. Manage users, teams, and routes.
3. View and filter infringements for their agency.

### Super Admin (Web)

1. Log in.
2. Create/manage agencies.
3. Assign Agency Admins.
4. Run cross‑agency and finance reports.

---

## 7. MVP Scope

- Supabase schema + seed data (agencies, locations, categories, types with GL codes).
- Officer mobile app for recording infringements.
- Web dashboard for agency/user management.
- Basic reporting by agency.

---

## 8. Finance Alignment

- Each infringement type has a `gl_code`.
- Finance teams can aggregate infringements by GL code for ledger reconciliation.
- Future: `finance_reports` SQL view for ready‑to‑use summaries.

---

## 9. Sprint Plan (Summary)

- **Sprint 0**: Repo + schema setup, seed data, onboarding docs.
- **Sprint 1**: Agencies & user management.
- **Sprint 2**: Teams, routes, assignments.
- **Sprint 3**: Infringement recording MVP.
- **Sprint 4**: Reporting & finance alignment.
- **Sprint 5**: UX refinement, audit logs.
- **Backlog**: Payments, offline sync, analytics, notifications.

---

## 10. Future Extensions

- **Payments integration** (M‑Paisa, e‑Gov).
- **Offline sync** for mobile (SQLite).
- **Analytics dashboards** (Supabase SQL, PowerBI).
- **Audit logs** for compliance.
- **Notifications** (SMS/email).
- **External API integrations**.

---

## 11. Documentation & Onboarding

- `README.md`: overview + quickstart.
- `docs/schema.md`: tables + relationships.
- `docs/api-spec.md`: API contracts.
- `docs/onboarding.md`: setup guide.
- `docs/sprint-tracker.md`: sprint planning.
- `docs/system-design.md`: architecture, roles, flows.
- `supabase/migrations/`: SQL migrations for database schema.
- `apps/web/`: Next.js web dashboard.
- `apps/mobile/`: React Native/Expo mobile app.
- `docs/ui-spec.md`: Defines theme (blue + zinc), typography, and component guidelines.

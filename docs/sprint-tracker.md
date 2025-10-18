
Each sprint = 2 weeks.

---

## Sprint 0 — Foundation & Setup

- Repo structure (web, mobile, db, docs)
- Push initial schema to Supabase
- Seed agencies, locations, infringement categories/types with GL codes
- Finalize onboarding docs

## Sprint 1 — Agencies & Users

- Super Admin: create/manage agencies
- Agency Admin: manage users, positions, teams, routes
- RLS policies for role separation

## Sprint 2 — Teams, Routes & Assignments

- Agency Admin: create/manage teams
- Define routes and assign them to teams
- Assign officers to teams

## Sprint 3 — Infringement Recording MVP

- Officer mobile app: login, record infringement
- Link infringements to officer, team, route, location
- Web dashboard: search/view infringements

## Sprint 4 — Reporting & Finance Alignment

- Agency Admin: filter infringements
- Super Admin: cross‑agency reporting
- Finance: aggregate infringements by `gl_code`
- Create `finance_reports` view

## Sprint 5 — Refinement & UX

- Improve officer mobile UX with consistent typography and blue/zinc palette.
- Add location hierarchy selection (division → station, region → office).
- Polish admin dashboards using shadcn/ui components.
- Ensure light mode only (remove dark mode toggles).
- Add audit logging for compliance.

## Backlog

- Payments integration
- Offline sync
- Analytics dashboards
- Notifications
- External API integrations

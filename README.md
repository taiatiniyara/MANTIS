# 🛠️ MANTIS — Multi‑Agency National Traffic Infringement System

MANTIS is a centralized platform for recording, managing, and analyzing traffic infringements across Fiji.  
It unifies the **Fiji Police Force**, **Land Transport Authority (LTA)**, and **City/Town Councils** into a single Supabase‑backed system with web and mobile apps.

---

## ✨ Features
- **Supabase Cloud backend** (Postgres + Auth + RLS)
- **Next.js web dashboard** using [shadcn/ui](https://ui.shadcn.com/) with a **blue + zinc light theme**
- **React Native/Expo mobile app** with matching palette and typography
- **Role‑based access**: Super Admin, Agency Admin, Officer
- **Hierarchical locations**: Police divisions/stations, LTA regions/offices, Councils/departments
- **Structured infringements**: Categories, types, fines, demerit points
- **Finance alignment**: Each infringement type has a General Ledger (GL) code for accounting
- **UI/UX**: Professional typography system, light mode only, consistent across web and mobile
- **Sprint planning**: Agile sprints with clear goals and backlog

---

## 📂 Project Structure

```
mantis/
├── web/                    # Next.js app (admin dashboards)
├── mobile/                 # React Native/Expo app (officers)
├── db/                     # Supabase migrations + seeds
│   ├── migrations/         # SQL schema files
│   └── seeds/              # Preloaded data (agencies, locations, categories, types)
├── docs/                   # Documentation
│   ├── system-design.md
│   ├── schema.md
│   ├── api-spec.md
│   ├── onboarding.md
│   └── sprint-tracker.md
└── README.md
```

---

## 🚀 Quickstart

### Prerequisites

- Node.js (LTS)
- Supabase CLI
- Expo CLI

### Setup

1. Clone the repo
2. Create a Supabase project in the cloud
3. Copy `.env.example` → `.env.local` and add your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
4. Push schema:
   ```bash
   supabase db push
   ```
5. Seed data:
   ```bash
   supabase db seed
   ```

### Run Apps

- Web dashboard:
  ```bash
  cd web && npm run dev
  ```
- Mobile officer app:
  ```bash
  cd mobile && expo start
  ```

---

## 👥 Roles & Permissions

- **Super Admin**: Create/manage agencies, assign Agency Admins
- **Agency Admin**: Manage users, teams, routes, and view agency infringements
- **Officer**: Record infringements via mobile app

---

## 📊 Database Overview

- **Agencies** → Users, Teams, Routes, Locations
- **Users** → Agency, Location, Position, Role
- **Locations** → Hierarchical (division, station, region, council, etc.)
- **Teams & Routes** → Many‑to‑many assignments
- **Infringements** → Linked to officer, type, route, location
- **Infringement Types** → Belong to categories, include fine, demerit points, GL code

---

## 🏃 Sprint Plan

### Sprint 0 — Foundation & Setup

- Repo structure (web, mobile, db, docs)
- Push initial schema to Supabase
- Seed agencies, locations, infringement categories/types with GL codes
- Finalize onboarding docs

### Sprint 1 — Agencies & Users

- Super Admin: create/manage agencies
- Agency Admin: manage users, positions, teams, routes
- RLS policies for role separation

### Sprint 2 — Teams, Routes & Assignments

- Agency Admin: create/manage teams
- Define routes and assign them to teams
- Assign officers to teams

### Sprint 3 — Infringement Recording MVP

- Officer mobile app: login, record infringement
- Link infringements to officer, team, route, location
- Web dashboard: search/view infringements

### Sprint 4 — Reporting & Finance Alignment

- Agency Admin: filter infringements
- Super Admin: cross‑agency reporting
- Finance: aggregate infringements by `gl_code`
- Create `finance_reports` view

### Sprint 5 — Refinement & UX

- Improve officer mobile UX
- Add location hierarchy selection
- Polish admin dashboards
- Add audit logging

### Backlog

- Payments integration (M‑Paisa, e‑Gov)
- Offline sync
- Analytics dashboards
- Notifications
- External API integrations

---

## 🔮 Future Extensions

- Payments integration
- Offline sync for mobile
- Analytics dashboards
- Audit logs
- Notifications (SMS/email)
- External API integrations

---

## 📚 Documentation

- `docs/system-design.md` — Architecture, roles, flows
- `docs/schema.md` — Tables + relationships
- `docs/api-spec.md` — API contracts
- `docs/onboarding.md` — Setup guide
- `docs/sprint-tracker.md` — Sprint planning

---

## 📝 License

This project is community‑focused and intended for deployment in Fiji and Pacific Island nations.  
License terms to be defined by stakeholders.

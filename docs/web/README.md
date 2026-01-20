# MANTIS Web Application
A React + Vite Progressive Web App powered by Supabase for Fiji’s enforcement agencies.

The web app enables LTA, Municipal Councils, and Fiji Police to issue, manage, and track traffic infringements through a centralized, secure, and mobile-friendly interface designed for low-bandwidth, offline-first collaboration.

---

## Features
- **Unified multi-agency enforcement** with clean separation
- **GIS-based jurisdiction** using PostGIS location hierarchy
- **Offline-first officer workflow** with background sync
- **Supabase-powered backend** (Auth, RLS, Storage, Edge Functions)
- **Teams & roles** with granular permissions
- **Evidence management** for photos/videos
- **Appeals & payments** workflows
- **PWA**: installable, offline-capable, fast

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| App Shell | PWA (Service Worker + Manifest) |
| State/Data | TanStack Query + Supabase Client |
| Backend | Supabase (Postgres + PostGIS + RLS + Storage + Edge Functions) |
| GIS | PostGIS geometry (Point + Polygon) |
| Auth | Supabase Auth (email OTP, magic links, SSO-ready) |

---

## Environment Variables
Create `website/.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Never commit secrets or service role keys.

---

## Getting Started
```bash
cd website
npm install
npm run dev
```

### Build & Preview
```bash
npm run build
npm run preview
```

---

## PWA Setup
Includes `manifest.json` and a service worker for caching/offline. To test:
1. Run `npm run build`
2. Run `npm run preview`
3. Open in Chrome → Application → Manifest

---

## Supabase Integration
- Auth with role-based access
- Postgres + PostGIS for data
- Row Level Security for agency/team isolation
- Storage for evidence files
- Edge Functions for workflows (issuing fines, payments, appeals)

---

## GIS & Location Hierarchy
- Country → Division → Province → Municipal Council → Ward → Station/Office
- Infringements store GPS points linked to resolved jurisdictions

---

## Development Commands
```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Contributing
See [../CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License
MIT unless a deployment requires a different civic/government license.

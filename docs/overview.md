# MANTIS — Multi-Agency National Traffic Infringement System
A unified, GIS-enabled enforcement platform for the Fiji Islands.

MANTIS is a dual-platform system consisting of:
- **Website** – React + Vite Progressive Web App for desktop/browser-based operations
- **Mobile App** – Expo + React Native for field officers on iOS and Android

Both apps are powered by **Supabase**. They enable Fiji's enforcement agencies — LTA, Municipal Councils, and Fiji Police — to issue, manage, and track traffic infringements through a centralized, secure, and mobile-friendly system designed for low-bandwidth, offline-first operations.

---

## Features

### Website
- Unified multi-agency enforcement with clean separation
- GIS-based jurisdiction resolution (country → division → municipal → ward → office)
- Dashboards for Super Admin, Agency Admin, and Officer roles
- Evidence management with secure uploads to Supabase Storage
- Appeals and payments workflows
- PWA capabilities with offline caching and installable experience

### Mobile
- Offline-first officer workflow with background sync
- GPS location tracking and map-based selection
- Evidence capture with built-in camera/gallery support
- Multi-step infringement creation with validation and draft support
- Team leader features (review, dashboard foundations)
- Sync status indicators and manual/automatic sync

---

## Tech Stack

### Website
| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS + Radix UI |
| Routing | TanStack Router |
| State/Data | TanStack Query |
| Maps | MapLibre GL |
| Backend | Supabase (Postgres + PostGIS + RLS + Storage) |
| ORM | Drizzle ORM |

### Mobile App
| Layer | Technology |
|-------|------------|
| Framework | Expo + React Native |
| Language | TypeScript |
| Routing | Expo Router |
| State | React Context + AsyncStorage |
| Maps | React Native Maps / OpenStreetMap |
| Camera | Expo Image Picker |
| Location | Expo Location |
| Backend | Supabase |

### Shared Backend
| Service | Technology |
|---------|------------|
| Database | PostgreSQL + PostGIS |
| Authentication | Supabase Auth |
| Storage | S3-compatible |
| Edge Functions | Deno runtime |
| Realtime | WebSocket subscriptions |

---

## Environment Variables

### Website (`website/.env`)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Mobile App (`mobile/.env.local`)
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

Never commit secrets or service role keys.

---

## Getting Started

### Website
```bash
cd website
npm install
npm run dev
```
The site runs at http://localhost:5173.
See [development/getting-started.md](./development/getting-started.md) for full setup.

### Mobile App
```bash
cd mobile
npm install
npm start
```
Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with **Expo Go** on a physical device

See [mobile/quickstart.md](./mobile/quickstart.md) for full setup.

---

## Project Structure

```
MANTIS/
├── website/                   # React + Vite web app
│   └── README → docs/web/     # Web app documentation lives in docs/web/
├── mobile/                    # Expo + React Native app
│   └── docs in docs/mobile/   # Mobile docs centralized under docs/mobile/
├── docs/                      # Comprehensive documentation
│   ├── overview.md            # This overview
│   ├── README.md              # Documentation index
│   ├── architecture/          # System architecture docs
│   ├── development/           # Dev, env, deployment guides
│   ├── mobile/                # Mobile app docs
│   └── web/                   # Web app docs
└── README.md                  # Pointer to docs
```

---

## Key Concepts

### Offline-First
- Create infringements and capture evidence without internet
- Automatic sync when connection is restored
- IndexedDB (web) and AsyncStorage (mobile) for local caching

### Multi-Tenancy
- Agency → Team → User isolation enforced via Supabase RLS

### GIS Integration
- PostGIS-powered location hierarchy with point-in-polygon resolution
- Automatic jurisdiction assignment based on GPS

### User Roles
- Officer, Team Leader, Agency Admin, Super Admin

---

## Development

### Both Platforms
```bash
npm install
npm run lint
npm run build
```

### Type Safety
```bash
npm run type-check
```

---

## Deployment

### Website
- Hosted on Firebase
- PWA installable on modern browsers
- Static site generation with Vite

### Mobile App
- iOS: TestFlight / App Store
- Android: Google Play
- Built with EAS Build

See [development/deployment.md](./development/deployment.md) for details.

---

## Documentation Map

- [Documentation index](./README.md)
- [Getting Started](./development/getting-started.md)
- [System Architecture](./architecture/system-architecture.md)
- [Tech Stack](./architecture/tech-stack.md)
- [Data Model](./architecture/data-model.md)
- [GIS & Locations](./architecture/gis-locations.md)
- [Authentication](./architecture/authentication.md)
- [Mobile App Overview](./mobile/app-overview.md)
- [Mobile Quick Start](./mobile/quickstart.md)
- [Deployment](./development/deployment.md)
- [Troubleshooting](./development/troubleshooting.md)
- [FAQ](./development/faq.md)
- [Contributing](./CONTRIBUTING.md)

---

## License
This project is licensed under the MIT License unless a deployment requires a different civic/government license.

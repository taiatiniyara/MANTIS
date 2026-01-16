# **MANTIS — Multi‑Agency National Traffic Infringement System**  
A unified, GIS‑enabled enforcement platform for the Fiji Islands.

MANTIS is a dual-platform system consisting of:
- **Website** - React + Vite Progressive Web App for desktop/browser-based operations
- **Mobile App** - Expo + React Native for field officers on iOS and Android

Both apps are powered by **Supabase**. They enable Fiji's enforcement agencies — **LTA**, **Municipal Councils**, and **Fiji Police** — to issue, manage, and track traffic infringements through a centralized, secure, and mobile‑friendly system.

The platform is designed for **low‑bandwidth environments**, **offline‑first field operations**, and **multi‑agency collaboration** with strict data separation.

---

## **Features**

### **Website Features**
- **Unified multi‑agency enforcement**
  - LTA, Police, and Municipal Councils operate on one platform with clean separation.
- **GIS‑based jurisdiction**
  - PostGIS‑powered location hierarchy (country → division → municipal → ward → office).
  - Automatic jurisdiction resolution for infringements.
- **Comprehensive dashboards**
  - Super Admin, Agency Admin, and Officer dashboards
  - Real-time case management
- **Evidence management**
  - Secure upload of photos/videos to Supabase Storage.
- **Appeals & payments**
  - Integrated workflows for citizens and finance teams.
- **PWA features**
  - Installable, mobile‑friendly, fast, and reliable.
  - Service Worker for offline caching
  - Offline-first capability

### **Mobile App Features**
- **Offline-first officer workflow**
  - Capture infringements, photos, and GPS data without connectivity.
  - Automatic background sync when online.
- **GPS location tracking**
  - Real-time position capture
  - Map-based location selection
- **Evidence capture**
  - Built-in camera integration
  - Gallery photo selection
  - Multiple evidence photos per case
- **Infringement creation**
  - Multi-step form with validation
  - Searchable offence selection
  - Driver and vehicle information
  - Automatic location capture
  - Save as draft or submit immediately
- **Draft management**
  - Save incomplete infringements
  - Edit and continue later
  - Automatic sync on submit
- **Team leader features**
  - Team dashboard (framework in place)
  - Case review capabilities
- **Sync status tracking**
  - Visual feedback on pending syncs
  - Manual sync trigger
  - Auto-sync on connection restore

---

## **Tech Stack**

### **Website**
| Layer | Technology |
|-------|------------|
| Frontend | React 19.2.0 + Vite 7.2.4 |
| Styling | Tailwind CSS 4.1.18 + Radix UI |
| Routing | TanStack Router 1.147.3 |
| State/Data | TanStack Query 5.90.16 |
| Maps | MapLibre GL 5.16.0 |
| Backend | Supabase (Postgres + PostGIS + RLS + Storage) |
| ORM | Drizzle ORM 0.45.1 |
| Database | PostgreSQL 15+ with PostGIS |

### **Mobile App**
| Layer | Technology |
|-------|------------|
| Framework | Expo 54.0.31 + React Native 0.81.5 |
| Language | TypeScript 5.9.2 |
| Routing | Expo Router 6.0.21 |
| State | React Context + AsyncStorage 2.2.0 |
| Maps | React Native Maps (OpenStreetMap) |
| Camera | Expo Image Picker 17.0.10 |
| Location | Expo Location 19.0.8 |
| Backend | Supabase (same backend as website) |

### **Shared Backend**
| Service | Technology |
|---------|------------|
| Database | PostgreSQL 15+ |
| GIS | PostGIS 3.x |
| Authentication | Supabase Auth |
| Storage | S3-compatible |
| Edge Functions | Deno runtime |
| Realtime | WebSocket subscriptions |

---

## **Environment Variables**

### **Website** (`.env` in `website/`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Mobile App** (`.env.local` in `mobile/`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

Never commit secrets or service role keys.

---

## **Getting Started**

### **Website**

```bash
cd website
npm install
npm run dev
```

The website will be available at `http://localhost:5173`

See [docs/01-getting-started.md](./docs/01-getting-started.md) for detailed setup.

### **Mobile App**

```bash
cd mobile
npm install
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator  
- Scan QR code with **Expo Go** on your physical device

See [mobile/QUICKSTART.md](./mobile/QUICKSTART.md) for detailed setup.

---

## **Project Structure**

```
MANTIS/
├── website/                     # React + Vite web app
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── routes/             # TanStack Router pages
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilities and helpers
│   │   └── assets/             # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md
│
├── mobile/                      # Expo + React Native app
│   ├── app/                    # Expo Router screens
│   │   ├── (auth)/             # Auth screens
│   │   ├── (officer)/          # Officer screens
│   │   ├── (leader)/           # Team leader screens
│   │   └── _layout.tsx         # Root layout
│   ├── components/             # Reusable components
│   ├── lib/                    # Core utilities
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── assets/                 # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json                # Expo configuration
│   ├── QUICKSTART.md
│   └── README.md
│
├── docs/                        # Comprehensive documentation
│   ├── 01-getting-started.md   # Setup guide
│   ├── 02-architecture.md      # System architecture
│   ├── 03-tech-stack.md        # Technology details
│   ├── 04-data-model.md        # Database schema
│   ├── 10-mobile-app.md        # Mobile app guide
│   ├── 22-deployment.md        # Deployment guide
│   └── ...more docs
│
└── README.md                    # This file
```

---

## **Key Concepts**

### **Offline-First**
Both apps are designed to work seamlessly offline:
- Create infringements and capture evidence without internet
- All data automatically syncs when connection is restored
- IndexedDB (web) and AsyncStorage (mobile) for local caching

### **Multi-Tenancy**
Strict data isolation at three levels:
- **Agency** - LTA, Police, Councils operate independently
- **Team** - Sub-division within agencies
- **User** - Individual officer or team leader
- Enforced via Supabase RLS (Row Level Security)

### **GIS Integration**
- PostGIS-powered location hierarchy
- Point-in-polygon jurisdiction resolution
- Automatic location assignment based on GPS
- Interactive maps with OpenStreetMap

### **User Roles**
- **Officer** - Create infringements, capture evidence
- **Team Leader** - Review team work, manage team
- **Agency Admin** - Manage agency operations
- **Super Admin** - System-wide administration

---

## **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│              Client Layer                                   │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Website (PWA)   │  │  Mobile App      │               │
│  │  React + Vite    │  │  Expo + RN       │               │
│  │  TanStack Router │  │  Expo Router     │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                  ▼ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   Backend Layer (Supabase)                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Auth | Postgres+PostGIS | Storage | Realtime      │   │
│  │ Edge Functions | Row Level Security              │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## **Development**

### **Both Platforms**
```bash
npm install
npm run lint
npm run build
```

### **Type Safety**
```bash
npm run type-check
```

---

## **Deployment**

### **Website**
- Hosted on Firebase
- PWA installable on all modern browsers
- Static site generation with Vite

### **Mobile App**
- iOS: TestFlight / App Store
- Android: Google Play
- Built with EAS Build

See [docs/22-deployment.md](./docs/22-deployment.md) for details.

---

## **Documentation**

Complete documentation is available in the `/docs` folder:

- [Getting Started](./docs/01-getting-started.md)
- [Architecture](./docs/02-architecture.md)
- [Tech Stack](./docs/03-tech-stack.md)
- [Data Model](./docs/04-data-model.md)
- [GIS & Locations](./docs/05-gis-locations.md)
- [Authentication](./docs/06-auth.md)
- [Mobile App](./docs/10-mobile-app.md)
- [Deployment](./docs/22-deployment.md)
- [Troubleshooting](./docs/27-troubleshooting.md)
- [FAQ](./docs/28-faq.md)

---

## **Contributing**
1. Fork the repo  
2. Create a feature branch  
3. Follow the existing coding style  
4. Submit a pull request  

All contributions must respect:
- Data privacy  
- Agency separation  
- National governance requirements  

---

## **License**
This project is licensed under the MIT License unless your deployment requires a different civic/government license.

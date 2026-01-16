# Architecture Overview

MANTIS is a dual-platform system with separate frontend applications (website and mobile) sharing a common Supabase backend. Both platforms are designed with offline-first operation, multi-tenancy, and geographic intelligence at their core.

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       Client Layer                             │
│  ┌──────────────────────────────┐  ┌────────────────────────┐ │
│  │   Website (React + Vite)     │  │  Mobile (Expo + RN)    │ │
│  │  ┌──────────┐  ┌──────────┐  │  │  ┌──────────────────┐  │ │
│  │  │ React    │  │ Service  │  │  │  │ Expo Router      │  │ │
│  │  │ 19.2.0   │  │ Worker   │  │  │  │ AsyncStorage     │  │ │
│  │  └──────────┘  └──────────┘  │  │  └──────────────────┘  │ │
│  │  ┌──────────┐  ┌──────────┐  │  │  ┌──────────────────┐  │ │
│  │  │ TanStack │  │ Vite     │  │  │  │ React Native     │  │ │
│  │  │ Router   │  │ Build    │  │  │  │ 0.81.5           │  │ │
│  │  └──────────┘  └──────────┘  │  │  └──────────────────┘  │ │
│  │  ┌──────────┐  ┌──────────┐  │  │  ┌──────────────────┐  │ │
│  │  │ MapLibre │  │ Tailwind │  │  │  │ Expo Location    │  │ │
│  │  │ GL       │  │ CSS      │  │  │  │ Expo ImagePicker │  │ │
│  │  └──────────┘  └──────────┘  │  │  └──────────────────┘  │ │
│  └──────────────────────────────┘  └────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                   ▼ HTTPS/WebSocket (Supabase Client)
┌────────────────────────────────────────────────────────────────┐
│                 Backend Layer (Supabase)                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌────────────────┐  ┌──────────────┐  │   │
│  │  │   Auth   │  │ PostgreSQL 15+ │  │   Storage    │  │   │
│  │  │  Service │  │  + PostGIS     │  │  (S3-compat) │  │   │
│  │  └──────────┘  └────────────────┘  └──────────────┘  │   │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  │   │
│  │  │  RLS Policies        │  │  Edge Functions      │  │   │
│  │  │  (Data isolation)    │  │  (Business Logic)    │  │   │
│  │  └──────────────────────┘  └──────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────────┐
│              Data Layer (PostgreSQL + PostGIS)                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Agencies | Teams | Users | Locations (Hierarchical) │   │
│  │  Infringements | Evidence | Drivers | Vehicles       │   │
│  │  Payments | Appeals | Audit Logs                      │   │
│  │  RLS Policies | PostGIS Geometries | Indexes          │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Website (React + Vite)

**Technology Stack:**
- React 19.2.0 for UI components
- TypeScript 5.9.3 for type safety
- Vite 7.2.4 for fast builds and HMR
- TanStack Router 1.147.3 for file-based routing
- TanStack Query 5.90.16 for data fetching
- Tailwind CSS 4.1.18 for styling
- MapLibre GL 5.16.0 for maps
- Drizzle ORM 0.45.1 for type-safe queries

**Key Features:**
- Progressive Web App (installable)
- Service Worker for offline caching
- IndexedDB for local storage
- Background sync for queued operations
- Multi-role dashboards (Super Admin, Agency Admin, Officer)

**Use Cases:**
- Administrative operations
- Case management
- Analytics and reporting
- System configuration

### 2. Mobile App (Expo + React Native)

**Technology Stack:**
- Expo 54.0.31 for React Native development
- React Native 0.81.5 for native platform access
- TypeScript 5.9.2 for type safety
- Expo Router 6.0.21 for file-based navigation
- AsyncStorage 2.2.0 for local persistence
- Expo Location 19.0.8 for GPS
- Expo Image Picker 17.0.10 for camera/gallery
- React Native Reanimated 4.1.1 for animations
- React Native Maps for OpenStreetMap integration

**Key Features:**
- Offline-first field operations
- GPS location tracking
- Photo evidence capture
- Multi-step infringement form
- Draft management
- Automatic sync queue
- Real-time sync status

**Use Cases:**
- Field officer operations
- Infringement creation
- Evidence capture
- Team leader oversight

### 3. Shared Backend (Supabase)

**Components:**
- **Authentication:** Email/password, OTP, magic links, RLS-based role checking
- **Database:** PostgreSQL 15+ with PostGIS extension
- **Storage:** S3-compatible object storage for evidence files
- **Edge Functions:** Deno-based serverless compute for workflows
- **Realtime:** WebSocket subscriptions for live updates
- **Row Level Security:** Multi-tenant data isolation

**Database Schema:**
- Multi-tenant with strict RLS policies
- Hierarchical location model using PostGIS geometries
- Optimized indexes for high-volume queries
- Foreign key constraints for data integrity

## Architecture Principles

### 1. Offline-First

Both apps are designed to work seamlessly offline:

**Website:**
```
User Action → Service Worker → IndexedDB
                    ↓
              (When online)
                    ↓
              Background Sync → Supabase
```

**Mobile:**
```
User Action → Local Dispatch → AsyncStorage
                    ↓
              (When online)
                    ↓
              Sync Queue → Supabase
```

**Implementation:**
- All reads cached locally (IndexedDB/AsyncStorage)
- Writes queued locally when offline
- Automatic sync when connection restored
- Conflict resolution strategies for concurrent changes

### 2. Multi-Tenancy

Data isolation at three levels, enforced via RLS policies:

```
Agency → Team → User
   ↓      ↓      ↓
  RLS → RLS → RLS
```

**Security Model:**
- Agency-level isolation (LTA, Police, Councils operate independently)
- Team-level scoping within agencies
- User-level access based on roles and assignments
- PostGIS-based jurisdiction filtering
- User-level permissions (Super Admin, Agency Admin, Officer)
- PostGIS-based jurisdiction boundaries

### 3. Geographic Intelligence

Location-aware operations using PostGIS:

```
GPS Point → PostGIS Query → Jurisdiction Resolution
               ↓
        Auto-assign Agency/Team
```

**Features:**
- Point-in-polygon queries for jurisdiction
- Hierarchical location tree (Country → Office)
- Boundary validation
- Distance calculations

## Data Flow

### Officer Workflow

```
1. Officer Opens App (PWA)
   ↓
2. Service Worker Loads Cached Data
   ↓
3. Officer Creates Infringement (Offline)
   ↓
4. Data Saved to IndexedDB
   ↓
5. Background Sync Detects Connection
   ↓
6. Data Synced to Supabase
   ↓
7. RLS Policies Validate & Store
   ↓
8. Audit Log Created
```

### Payment Workflow

```
1. Citizen Views Infringement
   ↓
2. Selects Payment Method (M-PAiSA, MyCash, etc.)
   ↓
3. Edge Function Processes Payment
   ↓
4. Payment Record Created
   ↓
5. Infringement Status Updated
   ↓
6. SMS/Email Notification Sent
```

## Security Architecture

### 1. Authentication

```
Email/Password → Supabase Auth → JWT Token
                      ↓
              Stored in Memory + HTTP-Only Cookie
                      ↓
              Attached to All API Requests
```

### 2. Authorization (RLS)

```sql
-- Example: Officers can only see their agency's data
CREATE POLICY "officers_agency_read" ON infringements
FOR SELECT USING (
  agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
);
```

### 3. Data Protection

- Encryption at rest (Supabase default)
- Encryption in transit (TLS 1.3)
- No sensitive data in logs
- Regular security audits

## Scalability

### Horizontal Scaling

- **Frontend:** CDN distribution (Firebase Hosting)
- **Backend:** Supabase auto-scaling
- **Database:** Connection pooling + read replicas

### Performance Optimizations

- Lazy loading of routes and components
- Image optimization and compression
- Database query optimization
- Redis caching (future)

## Deployment Architecture

```
Developer → Git Push → GitHub Actions
                 ↓
           Build & Test
                 ↓
           Deploy to Firebase
                 ↓
           CDN Distribution
                 ↓
           HTTPS Access
```

## Technology Choices

### Why React?

- Component reusability
- Strong ecosystem
- Excellent mobile support
- PWA capabilities

### Why Supabase?

- Open-source (can self-host)
- Built-in auth and RLS
- PostGIS support
- Real-time subscriptions

### Why PostGIS?

- Native geospatial queries
- Jurisdiction resolution
- Boundary management
- High performance

## Future Enhancements

- **Redis caching** for high-traffic endpoints
- **Read replicas** for reporting queries
- **GraphQL API** for flexible queries
- **Mobile native apps** (React Native)
- **AI-powered OCR** for license plate detection
- **Predictive analytics** for traffic patterns

---

**Next:** [Tech Stack Details](./03-tech-stack.md)

# Architecture Overview

MANTIS is built as a modern, cloud-native Progressive Web App (PWA) with a focus on offline-first operation, multi-tenancy, and geographic intelligence.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (PWA)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  React   │  │ Vite     │  │ Service  │  │ TanStack │  │
│  │  19.x    │  │ Build    │  │ Worker   │  │ Router   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▼ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   Backend Layer (Supabase)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Auth     │  │ Postgres │  │ Storage  │  │ Edge     │  │
│  │ Service  │  │ +PostGIS │  │ (S3)     │  │ Functions│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (PostgreSQL)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Tables   │  │ RLS      │  │ PostGIS  │  │ Indexes  │  │
│  │          │  │ Policies │  │ (Geom)   │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (React + Vite)

**Technology Stack:**
- React 19.x for UI components
- TypeScript for type safety
- Vite for fast builds and HMR
- TanStack Router for routing
- TanStack Query for data fetching
- Tailwind CSS 4 for styling

**Key Features:**
- Progressive Web App (installable)
- Service Worker for offline caching
- IndexedDB for local storage
- Background sync for queued operations

### 2. Backend (Supabase)

**Components:**
- **Authentication:** Email/password, OTP, magic links
- **Database:** PostgreSQL 15+ with PostGIS extension
- **Storage:** S3-compatible object storage for evidence files
- **Edge Functions:** Serverless functions for business logic
- **Realtime:** WebSocket subscriptions for live updates

### 3. Database (PostgreSQL + PostGIS)

**Schema Design:**
- Multi-tenant with strict RLS (Row Level Security)
- Hierarchical location model using PostGIS geometries
- Optimized indexes for high-volume queries
- Foreign key constraints for data integrity

## Architecture Principles

### 1. Offline-First

MANTIS is designed to work seamlessly offline:

```
User Action → Service Worker → IndexedDB
                    ↓
              (When online)
                    ↓
              Background Sync → Supabase
```

**Implementation:**
- All reads cached in IndexedDB
- Writes queued locally when offline
- Automatic sync when connection restored
- Conflict resolution strategies

### 2. Multi-Tenancy

Data isolation at three levels:

```
Agency → Team → User
   ↓      ↓      ↓
  RLS → RLS → RLS
```

**Security Model:**
- Agency-level isolation (LTA, Police, Councils)
- Team-level scoping within agencies
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

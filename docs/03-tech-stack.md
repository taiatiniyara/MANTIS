# Tech Stack

MANTIS uses modern, battle-tested technologies optimized for APAC connectivity and mobile-first operations.

## Frontend Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool & dev server |
| **TanStack Router** | 1.147.3 | File-based routing |
| **TanStack Query** | 5.90.16 | Data fetching & caching |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.1.18 | Utility-first styling |
| **Radix UI** | Latest | Accessible components |
| **Lucide React** | 0.562.0 | Icon library |
| **Shadcn/ui** | 3.6.3 | Component library |
| **Class Variance Authority** | 0.7.1 | Component variants |

### Maps & GIS

| Technology | Version | Purpose |
|------------|---------|---------|
| **MapLibre GL** | 5.16.0 | Map rendering engine |
| **React Map GL** | 8.1.0 | React bindings for maps |

### State & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| **TanStack Query** | 5.90.16 | Server state management |
| **React Context** | Built-in | Local state management |
| **IndexedDB** | Native | Offline storage |

## Backend Stack

### Supabase Platform

| Service | Technology | Purpose |
|---------|------------|---------|
| **Database** | PostgreSQL 15+ | Primary data store |
| **GIS Extension** | PostGIS 3.x | Spatial queries |
| **Authentication** | Supabase Auth | User management |
| **Storage** | S3-compatible | File uploads |
| **Edge Functions** | Deno | Serverless compute |
| **Realtime** | WebSockets | Live updates |

### Database Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **Drizzle ORM** | 0.45.1 | Type-safe SQL queries |
| **Drizzle Kit** | 0.31.8 | Schema migrations |
| **PostgreSQL** | 15+ | Relational database |
| **PostGIS** | 3.x | Geographic data |

## Development Tools

### Linting & Formatting

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.39.1 | Code linting |
| **TypeScript** | 5.x | Type checking |
| **TanStack Router Plugin** | 1.149.0 | Route type generation |

### Build & Deploy

| Tool | Version | Purpose |
|------|---------|---------|
| **Vite** | 5.x | Build & bundling |
| **Firebase** | Latest | Static hosting |
| **GitHub Actions** | N/A | CI/CD pipeline |

## Key Dependencies

### Production Dependencies

```json
{
  "@supabase/supabase-js": "^2.90.1",
  "@tanstack/react-query": "^5.90.16",
  "@tanstack/react-router": "^1.147.3",
  "drizzle-orm": "^0.45.1",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "maplibre-gl": "^5.16.0",
  "tailwindcss": "^4.1.18"
}
```

### Development Dependencies

```json
{
  "@vitejs/plugin-react": "^5.1.1",
  "drizzle-kit": "^0.31.8",
  "typescript": "~5.x",
  "eslint": "^9.39.1"
}
```

## Architecture Decisions

### Why React 19?

- **Modern features:** Server Components (future-ready)
- **Performance:** Automatic batching, improved Suspense
- **Stability:** LTS support
- **Ecosystem:** Largest component library

### Why Vite over Create React App?

- **Speed:** 10-100x faster builds
- **Modern:** Native ESM support
- **Lightweight:** Minimal config
- **HMR:** Instant updates during development

### Why TanStack Query?

- **Caching:** Automatic cache management
- **Offline support:** Works seamlessly offline
- **DevTools:** Excellent debugging experience
- **Type-safe:** Full TypeScript support

### Why Supabase over Firebase?

| Feature | Supabase | Firebase |
|---------|----------|----------|
| **Open Source** | ✅ Yes | ❌ No |
| **Self-Hostable** | ✅ Yes | ❌ No |
| **PostGIS/GIS** | ✅ Native | ⚠️ Limited |
| **SQL Access** | ✅ Full | ❌ No |
| **RLS** | ✅ Native | ⚠️ Security Rules |
| **Cost** | ✅ Lower | ⚠️ Higher at scale |

### Why PostGIS?

- **Spatial queries:** Native point-in-polygon operations
- **Performance:** Indexed geospatial queries
- **Standards:** OGC-compliant
- **Maturity:** Battle-tested for 20+ years

### Why Drizzle ORM?

- **Type-safe:** Full TypeScript inference
- **Lightweight:** Minimal overhead
- **SQL-like:** Easy to learn
- **Migrations:** First-class schema versioning

## Browser Support

| Browser | Minimum Version | PWA Support |
|---------|----------------|-------------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ⚠️ Limited |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ⚠️ Limited |
| Chrome Mobile | 90+ | ✅ Full |

**Note:** Safari has limited PWA support (no background sync, limited storage).

## Mobile Support

### iOS

- **Minimum:** iOS 14
- **PWA:** Limited (can install, but restricted features)
- **Recommended:** Use in Safari or Chrome

### Android

- **Minimum:** Android 8 (API 26)
- **PWA:** Full support
- **Recommended:** Chrome or Firefox

## Server Requirements

### Minimum Specifications

For self-hosted Supabase:

- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 20GB SSD
- **Network:** 10 Mbps up/down

### Recommended Specifications

- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 100GB SSD
- **Network:** 100 Mbps up/down

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint** | < 1.5s | ~1.2s |
| **Time to Interactive** | < 3s | ~2.5s |
| **Largest Contentful Paint** | < 2.5s | ~2.1s |
| **Bundle Size** | < 300KB | ~250KB |
| **Lighthouse Score** | > 90 | 94 |

## Third-Party Services

### Required

- **Supabase** - Backend infrastructure
- **Firebase Hosting** - Static asset delivery

### Optional

- **Sentry** - Error tracking (future)
- **PostHog** - Analytics (future)
- **Twilio** - SMS notifications (future)

## Security & Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| **HTTPS** | ✅ Required | TLS 1.3 minimum |
| **CSP** | ✅ Enabled | Strict content policy |
| **CORS** | ✅ Configured | Whitelisted origins |
| **SameSite Cookies** | ✅ Enabled | Strict mode |
| **XSS Protection** | ✅ Enabled | React auto-escaping |

## Development Environment

### Recommended Setup

- **OS:** macOS, Linux, or Windows (WSL2)
- **Node.js:** v18 LTS or v20 LTS
- **Editor:** VS Code
- **Extensions:**
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin
  - Supabase (official)

### VS Code Configuration

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Package Management

We use **npm** as the primary package manager:

```bash
npm install    # Install dependencies
npm run dev    # Start dev server
npm run build  # Production build
```

**Note:** Lock file (`package-lock.json`) is committed to ensure reproducible builds.

## Version Policy

- **Major versions:** Breaking changes
- **Minor versions:** New features (backward compatible)
- **Patch versions:** Bug fixes

We follow **semantic versioning** (SemVer).

---

**Next:** [Data Model](./04-data-model.md)

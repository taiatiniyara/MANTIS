# MANTIS: Multi-Agency Traffic Infringement System (Fiji)

A minimal, unified Multi-Agency Traffic Infringement System (MANTIS) for Fiji, built on Supabase (Postgres + PostGIS, Auth, RLS, Edge Functions). It enables Police, LTA, and Town/City Councils to issue, reconcile, and manage infringements in one source of truth, with a citizen-facing portal for lookup and payment.

---

## Scope and Goals

- **Problem statement:** Infringements are booked by multiple agencies using separate systems, making reconciliation and citizen visibility difficult.
- **Goal:** Provide a single source of truth with strict role-based access, simple officer booking, unified citizen view/payments, and auditable multi-agency oversight.
- **Out of scope (MVP):** Court case management, appeals workflows beyond simple dispute flagging, complex analytics, and deep legacy system backfills.

---

## Users, Roles, and Permissions

### Roles Overview

| Role | Primary Actions | Data Visibility |
|------|-----------------|-----------------|
| Officer (Police/LTA/Council) | Create infringements, attach evidence, update status (issued, voided), view agency records | Own agency only |
| Agency admin | Manage officers, run reports, export data, resolve disputes | Own agency only |
| Central admin (Ministry) | Full oversight, configure offence catalog, tariffs, audit | All agencies |
| Citizen | Lookup by vehicle/licence, pay fines, submit dispute | Own vehicles/licence only |

### Permissions Summary

- **Officer:** create/read/update infringements for issuing_agency; create evidence; cannot alter payments.
- **Agency admin:** officer permissions + view/export reports for issuing_agency; manage users within agency.
- **Central admin:** read all; manage catalog/tariffs; resolve cross-agency conflicts; audit logs.
- **Citizen:** read infringements linked to their vehicle(s)/licence; create payments; create disputes.

---

## Functional Requirements

### Core Capabilities

- **Infringement booking:** Quick form with vehicle reg, offence, geotag, photos, issuing agency, officer ID, timestamp; offline-first with later sync.
- **Unified lookup:** Central database returns consolidated infringements regardless of issuing agency.
- **Payments:** Online payment via card or local wallets (M-Paisa/MyCash) with receipts; updates infringement status to paid.
- **Disputes:** Citizens can flag a dispute with a reason; agency admin can mark resolved or escalate.
- **Evidence:** Photo uploads linked to each infringement; immutable audit trail of edits.
- **Reporting:** Agency-level dashboards, exports (CSV) for reconciliation; central admin analytics (basic totals, heatmaps).
- **Location visualization:** Interactive Google Maps integration showing infringement locations, heatmaps, and geographic patterns.

### UX Flows

- **Officer flow:** New Infringement → vehicle reg lookup → offence select → auto fine → evidence attach → save → sync.
- **Citizen flow:** Login → search by vehicle/licence → view outstanding → pay → receipt via SMS/email → status updates.
- **Admin flow:** Filter by agency/offence/date → export → audit log review → manage offences/tariffs.


## Non-Functional Requirements

- **Security:** Supabase Auth + RLS; all actions auditable; evidence stored with signed URLs and integrity checks.
- **Reliability:** Offline booking with local cache; conflict-free sync; idempotent Edge Functions for payments.
- **Performance:** Sub-300ms API responses for core queries; pagination for lists; indexes on hot fields; map tile caching for optimal load times.
- **Compliance:** Data retention and access aligned with Fiji regulations; immutable audit logs; Google Maps API usage within quota limits.
- **Operability:** Simple deploy, environment separation (dev/stage/prod), metrics and error reporting.
- **Cost discipline:** Prefer Supabase managed services; minimal external dependencies; Google Maps API usage optimized with clustering and viewport restrictions.

---

## Data Model and Policies

### Tables

- **agencies**
  - id (uuid, pk)
  - name (text, unique)
  - code (text, unique)
  - active (boolean)

- **users**
  - id (uuid, pk, references auth.users)
  - agency_id (uuid, nullable for citizens)
  - role (enum: officer, agency_admin, central_admin, citizen)
  - display_name (text)

- **vehicles**
  - id (uuid, pk)
  - reg_number (text, unique)
  - owner_user_id (uuid, nullable)

- **offences**
  - id (uuid, pk)
  - code (text, unique)
  - description (text)
  - base_fine_amount (numeric)
  - active (boolean)

- **infringements**
  - id (uuid, pk)
  - issuing_agency_id (uuid, fk agencies)
  - officer_user_id (uuid, fk users)
  - vehicle_id (uuid, fk vehicles)
  - driver_licence_number (text, nullable)
  - offence_id (uuid, fk offences)
  - fine_amount (numeric)
  - status (enum: issued, paid, voided, disputed)
  - location (geography(Point, 4326))
  - issued_at (timestamptz)
  - updated_at (timestamptz)
  - evidence_urls (jsonb array of signed URLs)

- **payments**
  - id (uuid, pk)
  - infringement_id (uuid, fk infringements)
  - amount (numeric)
  - method (enum: card, mpaisa, mycash)
  - provider_ref (text)
  - status (enum: pending, success, failed)
  - paid_at (timestamptz)
  - receipt_number (text, unique)

- **disputes**
  - id (uuid, pk)
  - infringement_id (uuid, fk infringements)
  - citizen_user_id (uuid, fk users)
  - reason (text)
  - status (enum: open, resolved, escalated)
  - created_at (timestamptz)
  - resolved_by_user_id (uuid, fk users, nullable)

- **audit_logs**
  - id (bigserial, pk)
  - actor_user_id (uuid)
  - action (text)
  - entity_type (text)
  - entity_id (uuid)
  - diff (jsonb)
  - created_at (timestamptz)

### Indexes

- **Infringements:** idx_infr_vehicle_id, idx_infr_agency_status, idx_infr_issued_at, gist_infr_location
- **Payments:** idx_pay_infr_id_status, idx_pay_provider_ref
- **Disputes:** idx_disp_infr_id_status

### RLS Policies (High Level)

- **Citizens:** can select infringements where vehicle.owner_user_id = auth.uid() OR driver_licence_number matches the citizen profile; insert payments for their infringements.
- **Officers:** can insert and select infringements where issuing_agency_id = user.agency_id; update status only to voided for their own agency records; cannot modify paid records.
- **Agency admins:** same as officers + select all infringements for their agency; update disputes for their agency’s infringements.
- **Central admins:** bypass policies via a dedicated role with SECURITY DEFINER functions for cross-agency reads.

---

## APIs, Edge Functions, and Integrations

### Public REST Endpoints

- **POST /infringements:** create infringement (officer/agency admin).
- **GET /infringements:** list infringements with filters: status, agency, vehicle_reg, date range.
- **PATCH /infringements/:id:** update status to voided or disputed (agency).
- **POST /payments:** create a payment intent.
- **GET /payments?infringement_id=...:** list payments for an infringement.
- **POST /disputes:** create a dispute (citizen).
- **PATCH /disputes/:id:** resolve/escalate (agency admin).

### Edge Functions

- **payments/create-intent**
- **payments/webhook**
- **citizens/lookup**
- **reports/export**
- **evidence/upload**

### Storage

- **Buckets:** evidence (private), reports (private, time-limited signed URLs)
- **Rules:** only officers/agency admins can upload evidence for their agency’s infringements; citizens can view evidence only if policy allows (default: no).

---

### Client Applications and Offline

### Officer App (Mobile-First)

- **Stack:** Expo + React Native with NativeWind (Tailwind CSS-in-JS) theming, TanStack Query for cache/sync orchestration; local SQLite cache via Expo SQLite; react-native-maps with Google Maps provider
- **Features:**
  - Quick booking
  - Evidence capture
  - Offline sync
  - Minimal UI
  - Location capture with Google Maps picker
  - GPS auto-fill with map preview

### Citizen Portal

- **Stack:** Vite + React with the latest Tailwind CSS, shadcn/ui component primitives, TanStack Router for nested routing, TanStack Query for data fetching, Supabase client, @react-google-maps/api for location display
- **Features:**
  - Login
  - Lookup
  - Payment
  - Dispute
  - View infringement location on map

### Admin Dashboard

- **Stack:** Shared React code with Citizen Portal, leveraging shadcn/ui dashboard patterns, TanStack Router, TanStack Query, embedded Metabase for advanced analytics, @react-google-maps/api with heatmap visualization
- **Features:**
  - Filters
  - Exports
  - Audit
  - Interactive heatmap showing infringement hotspots
  - Cluster markers for high-density areas
  - Click-to-filter by geographic region

---

## Deployment, Testing, and Rollout

### Environments

- Dev
- Staging
- Prod

### CI/CD

- Migrations
- Tests
- Linting

### Observability

- Metrics
- Logs
- Alerts

### Rollout Plan

- **Phase 1:** Pilot with Police + LTA
- **Phase 2:** Onboard Councils
- **Phase 3:** Enhance analytics, reminders

---

## UI/UX Design System

The interface favors a minimal, high-contrast aesthetic with ample negative space, rounded corners, and soft micro-interactions. Tailwind CSS drives utility classes, while shadcn/ui supplies accessible primitives that inherit the custom orange and slate palette. Dark mode mirrors the same tokens with adjusted contrast ratios. Both web and mobile experiences share typography, spacing, and component tokens to maintain a unified visual language.

### Color Palette (Orange & Slate Theme)

#### Primary Colors
- **Primary Orange:** `#F97316` (orange-500) - Main brand color, CTAs, active states
- **Primary Orange Light:** `#FED7AA` (orange-200) - Hover states, backgrounds
- **Primary Orange Dark:** `#C2410C` (orange-700) - Pressed states, emphasis

#### Neutral Slate
- **Slate 950:** `#020617` - Primary text, headings
- **Slate 800:** `#1E293B` - Secondary text
- **Slate 600:** `#475569` - Tertiary text, captions
- **Slate 400:** `#94A3B8` - Disabled text, placeholders
- **Slate 200:** `#E2E8F0` - Borders, dividers
- **Slate 100:** `#F1F5F9` - Background light
- **Slate 50:** `#F8FAFC` - Background subtle

#### Semantic Colors
- **Success:** `#10B981` (green-500)
- **Warning:** `#F59E0B` (amber-500)
- **Error:** `#EF4444` (red-500)
- **Info:** `#3B82F6` (blue-500)

#### Status Colors
- **Issued:** `#F97316` (orange-500)
- **Paid:** `#10B981` (green-500)
- **Voided:** `#6B7280` (gray-500)
- **Disputed:** `#EAB308` (yellow-500)

### Typography

#### Web Application (mantis-web)

**Font Families:**
- **Primary:** Inter (sans-serif) - Body text, UI elements
- **Headings:** Manrope (sans-serif) - Headings, titles
- **Monospace:** JetBrains Mono - Code, reference numbers

**Type Scale:**
```css
/* Headings */
h1: 2.5rem (40px) / 1.2 / 700 - Manrope
h2: 2rem (32px) / 1.25 / 700 - Manrope
h3: 1.5rem (24px) / 1.3 / 600 - Manrope
h4: 1.25rem (20px) / 1.4 / 600 - Manrope
h5: 1.125rem (18px) / 1.4 / 600 - Manrope
h6: 1rem (16px) / 1.5 / 600 - Manrope

/* Body */
body-large: 1.125rem (18px) / 1.6 / 400 - Inter
body: 1rem (16px) / 1.6 / 400 - Inter
body-small: 0.875rem (14px) / 1.6 / 400 - Inter
caption: 0.75rem (12px) / 1.5 / 400 - Inter

/* UI Elements */
button-large: 1rem (16px) / 1.5 / 600 - Inter
button: 0.875rem (14px) / 1.5 / 600 - Inter
input: 1rem (16px) / 1.5 / 400 - Inter
label: 0.875rem (14px) / 1.5 / 500 - Inter
```

#### Mobile Application (mantis-mobile)

**Font Families:**
- **Primary:** System fonts (SF Pro for iOS, Roboto for Android)
- **Headings:** System fonts with increased weight
- **Monospace:** SF Mono / Roboto Mono

**Type Scale (Mobile):**
```css
/* Headings */
h1: 32px / 1.25 / 700
h2: 28px / 1.25 / 700
h3: 24px / 1.3 / 600
h4: 20px / 1.4 / 600
h5: 18px / 1.4 / 600

/* Body */
body-large: 18px / 1.5 / 400
body: 16px / 1.5 / 400
body-small: 14px / 1.5 / 400
caption: 12px / 1.4 / 400

/* UI Elements */
button-large: 17px / 1.5 / 600
button: 15px / 1.5 / 600
input: 16px / 1.5 / 400 (minimum for iOS)
label: 14px / 1.5 / 500
```

### Spacing System

**8-Point Grid System:**
```
xs: 4px (0.25rem)
sm: 8px (0.5rem)
md: 16px (1rem)
lg: 24px (1.5rem)
xl: 32px (2rem)
2xl: 48px (3rem)
3xl: 64px (4rem)
4xl: 96px (6rem)
```

### Component Specifications

#### Buttons
- **Primary:** Orange-500 bg, white text, subtle drop shadow, 12px radius, 12px/24px padding (vertical/horizontal), hover transitions via Tailwind `transition-colors`
- **Secondary:** Transparent bg, orange-500 border (2px), orange-500 text, focus ring in orange-200
- **Tertiary:** Transparent bg, slate-600 text, hover slate-100 bg, underline on focus for accessibility
- **Disabled:** Slate-300 bg, slate-500 text, `cursor-not-allowed`, 40% opacity on shadow

#### Input Fields
- **Default:** White bg, slate-300 border (1px), 8px radius, 12px/16px padding, `focus-visible` states via Tailwind
- **Focus:** Orange-500 border (2px), orange-100 bg, animated focus ring using `ring-2 ring-orange-200`
- **Error:** Red-500 border (2px), red-50 bg, inline helper text `text-sm text-red-600`
- **Disabled:** Slate-100 bg, slate-400 text, `opacity-60`

#### Cards
- **Elevation:** 0 8px 24px rgba(2, 6, 23, 0.08) with Tailwind `shadow-lg`
- **Border:** 1px solid slate-200 (`border-slate-200` dark: `border-slate-700`)
- **Radius:** 16px rounded corners with consistent `rounded-xl`
- **Padding:** 24px with responsive `p-6 sm:p-8`
- **Accent strip:** Optional 4px top border in orange-500 for highlighted states

#### Badges/Tags
- **Border radius:** 9999px (fully rounded)
- **Padding:** 4px/12px
- **Font:** 12px/500
- **Theme variants:** Orange (issued), emerald (paid), slate (voided), amber (disputed) implemented via Tailwind variants utilities

### Interaction Patterns

- **Loading states:** Use shadcn/ui skeletons with slate gradients; optimistic updates managed by TanStack Query mutation lifecycle hooks.
- **Empty states:** Minimal illustrations in slate-200 with concise copy and primary CTAs.
- **Feedback:** Toasts via shadcn/ui `sonner` integration positioned top-right on desktop, bottom-center on mobile.
- **Navigation:** TanStack Router handles progressive disclosure—side rail for desktop, bottom sheet for mobile filters.

### Mobile-Specific Guidelines

#### Touch Targets
- **Minimum size:** 44×44px (iOS) / 48×48px (Android)
- **Spacing:** Minimum 8px between interactive elements

#### Officer App (Mobile) Layout
- **Bottom Navigation:** 5 tabs maximum, 56px height
- **Header:** 56px height, includes agency logo, sync status
- **Quick Actions:** Floating action button (FAB) for new infringement (56×56px, orange-500)
- **Card Lists:** Full-width with 16px horizontal padding, 8px vertical spacing

#### Gestures
- **Swipe:** Refresh infringement list
- **Long-press:** Quick actions menu on infringement cards
- **Pinch-to-zoom:** Evidence photo viewer

### Citizen Portal Layout

#### Desktop (1024px+)
- **Two-column:** Sidebar navigation (240px), main content
- **Header:** 64px height, sticky
- **Max content width:** 1200px, centered

#### Tablet (768px-1023px)
- **Single column** with collapsible sidebar
- **Header:** 64px height

#### Mobile (<768px)
- **Single column**
- **Hamburger menu**
- **Bottom sheet** for filters

### Admin Dashboard Layout

- **Top navigation:** Agency selector, date range, export button
- **Cards grid:** 3-column (desktop), 2-column (tablet), 1-column (mobile)
- **Data tables:** Responsive with horizontal scroll on mobile
- **Charts:** Recharts/Chart.js with orange/slate palette

### Accessibility

- **WCAG 2.1 Level AA compliance**
- **Color contrast ratio:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus indicators:** 2px orange-500 outline with 2px offset
- **Screen reader:** Proper ARIA labels, semantic HTML
- **Keyboard navigation:** Full support, logical tab order

### Animations and Transitions

- **Duration:** 150ms (fast), 300ms (default), 500ms (slow)
- **Easing:** cubic-bezier(0.4, 0.0, 0.2, 1) - Material Design standard
- **Page transitions:** 300ms fade-slide
- **Hover states:** 150ms ease-in-out
- **Loading states:** Skeleton screens with shimmer effect (orange-200)

### Iconography

- **Library:** Lucide React (web), Lucide React Native (mobile)
- **Size:** 16px (small), 20px (default), 24px (large), 32px (extra large)
- **Stroke width:** 2px
- **Color:** Inherit from parent or slate-600 default

---

## Google Maps Integration

### Overview

Google Maps integration provides location visualization throughout the MANTIS system, enabling officers to pinpoint infringement locations, citizens to view where violations occurred, and administrators to analyze geographic patterns and hotspots.

### API Configuration

**Required APIs:**
- Maps JavaScript API (Web)
- Maps SDK for Android (Mobile)
- Maps SDK for iOS (Mobile)
- Geocoding API (Address lookup)
- Places API (Optional: for location autocomplete)

**Environment Variables:**
```bash
# Web Application (.env)
VITE_GOOGLE_MAPS_API_KEY=your_web_api_key_here

# Mobile Application (.env)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_mobile_api_key_here
```

**API Key Restrictions:**
- Web API key: Restrict to web application domain(s)
- Mobile API keys: Restrict to iOS Bundle ID and Android package name
- Enable only required APIs to minimize security exposure
- Set quota limits to control costs

### Implementation by Platform

#### Web Application (mantis-web)

**Library:** `@react-google-maps/api` (v2.19+)

**Components:**
1. **InfringementMapView** - Single infringement location marker
2. **InfringementHeatmap** - Density visualization for reports
3. **LocationPicker** - Interactive map for selecting locations (admin)

**Features:**
- Custom marker icons with color-coded status
- Info windows showing infringement details
- Marker clustering for performance (>100 markers)
- Heatmap gradient matching system orange/slate theme
- Responsive map sizing (mobile/desktop)
- Dark mode map styling

**Code Structure:**
```typescript
// src/components/maps/infringement-map-view.tsx
// src/components/maps/infringement-heatmap.tsx
// src/components/maps/location-picker.tsx
// src/hooks/use-google-maps.ts
// src/lib/maps/utils.ts - Map utilities and formatters
```

#### Mobile Application (mantis-mobile)

**Library:** `react-native-maps` with Google Maps provider

**Features:**
- Real-time location tracking during booking
- Map preview in infringement form
- Offline map tile caching
- GPS coordinate capture with accuracy indicator
- Compass and zoom controls
- Auto-center on user location

**Code Structure:**
```typescript
// app/components/maps/location-map.tsx
// app/components/maps/location-picker.tsx
// app/hooks/use-location.ts
// app/lib/maps/utils.ts
```

### Map Styling

**Custom Map Theme:**
Matches MANTIS orange/slate color palette for consistent branding.

**Light Mode:**
- Roads: Slate-300
- Background: Slate-50
- Water: Blue-100
- Parks: Green-50
- Labels: Slate-700
- Borders: Slate-400

**Dark Mode:**
- Roads: Slate-600
- Background: Slate-900
- Water: Blue-900
- Parks: Green-900
- Labels: Slate-200
- Borders: Slate-700

**Marker Styles:**
- Issued: Orange-500 pin
- Paid: Green-500 pin
- Voided: Gray-500 pin
- Disputed: Yellow-500 pin
- Selected: Orange-700 pin with animation

### Geographic Features by Module

#### Infringement Booking (Officer App)

**Location Capture:**
1. GPS auto-populates from device location
2. Officer can drag marker to adjust position
3. Address reverse-geocoded from coordinates
4. Location accuracy shown (±5m, ±10m, etc.)
5. Optional manual coordinate entry

**Map Display:**
- 400px height on mobile
- Centered on current location or last booking location
- Zoom level 16 (street-level detail)
- Satellite/map toggle button

#### Infringement Detail View

**Static Map Display:**
- Shows infringement location with marker
- Non-interactive (static image via Maps Static API)
- 300x200px thumbnail
- Click to open full interactive map
- Shows nearby landmarks/streets

**Interactive Map Modal:**
- Full-screen map overlay
- Infringement details in info window
- Directions link to Google Maps app
- Street view option
- Zoom range: 12-18

#### Reports & Analytics Dashboard

**Geographic Heatmap:**
- Displays all infringements as heat intensity
- Filters apply to map data
- Gradient: Low (green) → Medium (yellow) → High (orange) → Very High (red)
- Radius: 20px per point
- Opacity: 0.6 for overlay visibility

**Cluster Markers:**
- Groups nearby infringements (within 50m)
- Cluster size badge shows count
- Click to zoom into cluster
- Individual markers appear at zoom level 16+
- Cluster colors match status distribution

**Interactive Features:**
- Click marker to view infringement list
- Draw polygon to filter by custom area
- Click heatmap region to see breakdown
- Export visible map area as image

#### Citizen Portal

**Infringement Location:**
- Shows where citizen's infringement occurred
- Static map in infringement list (thumbnail)
- Interactive map in detail view
- "Get Directions" button opens Google Maps
- Optional street view for context

### Performance Optimization

**Best Practices:**
1. **Lazy Loading:** Load Maps API only when needed
2. **Marker Clustering:** Use `@googlemaps/markerclusterer` for >50 markers
3. **Viewport Bounds:** Only fetch infringements in visible map area
4. **Tile Caching:** Browser caches map tiles automatically
5. **Static Maps:** Use Static API for thumbnails (no JS overhead)
6. **Coordinate Precision:** Round to 5 decimal places (~1m accuracy)

**Query Optimization:**
```sql
-- Use PostGIS spatial index for fast queries
SELECT * FROM infringements
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  5000 -- 5km radius
)
AND status != 'voided'
LIMIT 500;
```

### Quota Management

**Estimated Monthly Usage:**
- Web Map Loads: 10,000 (dynamic maps)
- Mobile Map Loads: 5,000 (officer bookings)
- Static Maps: 15,000 (thumbnails)
- Geocoding Requests: 2,000 (address lookups)

**Cost Optimization:**
- Use Static Maps API for thumbnails ($2 per 1,000 requests)
- Cache geocoded addresses in database
- Implement viewport-based data loading
- Set reasonable zoom level limits (10-18)

**Free Tier:** $200/month credit covers typical usage for MVP phase

### Accessibility

**Map Alternatives:**
- Text description of location alongside map
- Coordinate display (lat/lon) for screen readers
- Keyboard navigation for map controls
- ARIA labels on all interactive elements
- High-contrast mode compatible

**Screen Reader Announcements:**
- "Map showing infringement location at [address]"
- "X infringements in this area"
- "Zoom level: Y, Center: [coordinates]"

### Security Considerations

**API Key Protection:**
- Never commit API keys to version control
- Use environment variables exclusively
- Implement key rotation policy (quarterly)
- Monitor API usage for anomalies

**Data Privacy:**
- Precise location shown only to authorized roles
- Citizens see location rounded to nearest 100m
- Heatmap data aggregated to prevent identification
- No location tracking or history retention

### Testing

**Unit Tests:**
- Coordinate validation and formatting
- Bounds calculation for viewport queries
- Marker clustering logic

**Integration Tests:**
- Map component rendering
- Marker click interactions
- Heatmap data loading
- Filter application to map

**Manual Testing:**
- Cross-browser compatibility (Chrome, Safari, Firefox)
- Mobile device testing (iOS/Android)
- Network throttling (slow 3G)
- Offline behavior (cached tiles)

---

## Developer-Ready Checklist

- Supabase project created with PostGIS enabled
- Auth roles mapped in `public.users`
- Schema applied (see `schema.sql`)
- Edge Functions scaffolded
- Client apps implemented with design system
- RLS tests
- Typography fonts loaded (Inter, Manrope)
- Color tokens configured in Tailwind/theme
- Component library built with accessible patterns
- Google Maps API keys configured (Web + Mobile)
- Google Maps API restrictions applied (domains/bundle IDs)
- Map components implemented with clustering and heatmap
- Location capture tested on mobile devices
- PostGIS spatial indexes created for performance
# MANTIS Mobile App

The MANTIS mobile application is a native iOS and Android app built with **Expo** and **React Native**, designed specifically for **field officers** and **team leaders** to capture and manage traffic infringements in real-time.

## Overview

The mobile app provides a streamlined, offline-first experience optimized for field enforcement work. Officers can:
- Create and manage infringements on the go
- Capture GPS coordinates and photos
- Work offline with automatic background sync
- View assigned cases and team activities
- Access maps for location-based enforcement

### Target Users
- **Field Officers**: Frontline enforcement personnel who issue infringements
- **Team Leaders**: Supervisors who oversee field teams and review cases

---

## Features

### Core Functionality
- ✅ **Offline-first operation**: Capture data without internet connectivity
- ✅ **Real-time sync**: Automatic background synchronization when online
- ✅ **GPS location tracking**: Automatic capture of infringement locations
- ✅ **Photo evidence**: Built-in camera integration for evidence capture
- ✅ **OpenStreetMap integration**: Interactive maps for location selection and jurisdiction verification
- ✅ **Supabase authentication**: Secure login with email/OTP
- ✅ **Multi-agency support**: Clean data separation per agency
- ✅ **Push notifications**: Alerts for case updates and assignments

### Officer Features
- ✅ **Create infringements** - Multi-step form with validation
  - Offence selection (searchable)
  - Driver information capture
  - Vehicle details
  - GPS location tracking
  - Multiple photo evidence
  - Save as draft or submit
- ✅ **GPS location capture** - Real-time positioning
- ✅ **Camera integration** - Take photos or pick from gallery
- ✅ **OpenStreetMap integration** - Interactive map view
- ✅ **Cases management** - View assigned cases
- ✅ **Offline functionality** - Work without internet
  - Create infringements offline
  - Automatic sync when online
  - Sync queue management
- ✅ **Draft management** - Save and edit unsent infringements
- ✅ **Session tracking** - View current sync and offline status
- ✅ **Profile access** - View user info and sign out

### Team Leader Features
- ✅ All officer features plus:
- **Team dashboard** (structure in place)
- **Case review** (foundation ready)
- **Team management** (framework ready)

### Planned Features
- [ ] **Driver/Vehicle lookup** - Search existing records
- [ ] **Approvals queue** - Review pending cases
- [ ] **Push notifications** - Case updates
- [ ] **Reports generation** - PDF export
- [ ] **Settings screen** - App configuration
- [ ] **Advanced analytics** - Team performance metrics

---

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Expo | 54.0.31 | React Native development platform |
| Runtime | React Native | 0.81.5 | Native mobile app runtime |
| Language | TypeScript | 5.9.2 | Type-safe development |
| Routing | Expo Router | 6.0.21 | File-based navigation |
| Backend | Supabase | 2.90.1 | Auth, database, storage, realtime |
| State Management | React Context | Built-in | App-level state |
| Local Storage | AsyncStorage | 2.2.0 | Persistent local data |
| Maps | React Native Maps | Custom | OpenStreetMap integration |
| Images | Expo Image Picker | 17.0.10 | Photo capture & gallery |
| Location | Expo Location | 19.0.8 | GPS tracking |
| Animations | React Native Reanimated | 4.1.1 | Smooth UI transitions |
| Gestures | React Native Gesture Handler | 2.28.0 | Touch gesture handling |
| Icons | Expo Vector Icons | 15.0.3 | Icon library |
| File System | Expo File System | 19.0.21 | File operations |
| Image Manipulation | Expo Image Manipulator | 14.0.8 | Photo processing |
| Biometrics | Expo Local Authentication | 17.0.8 | Fingerprint/Face ID |
| Network Status | Expo Network | 8.0.8 | Connectivity detection |
| Haptics | Expo Haptics | 15.0.8 | Vibration feedback |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MANTIS Mobile App                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Expo       │  │  React       │  │  TypeScript  │    │
│  │   Router     │  │  Native      │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ OpenStreetMap│  │  Supabase    │  │ AsyncStorage │    │
│  │ (MapLibre)   │  │  Client      │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ▼ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │     Auth     │  │   Postgres   │  │   Storage    │    │
│  │   + RLS      │  │   + PostGIS  │  │   (Photos)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
mobile/
├── app/                              # Expo Router pages
│   ├── _layout.tsx                  # Root layout with auth context
│   ├── index.tsx                    # Auth gate / splash
│   ├── modal.tsx                    # Modal for routes
│   ├── (auth)/                      # Authentication flow
│   │   ├── _layout.tsx              # Auth layout
│   │   └── login.tsx                # Login screen
│   ├── (officer)/                   # Officer screens (protected)
│   │   ├── _layout.tsx              # Tab navigation (Dashboard, Map, Cases, Drafts, Profile)
│   │   ├── index.tsx                # Dashboard home
│   │   ├── map.tsx                  # OpenStreetMap view
│   │   ├── cases.tsx                # Cases list
│   │   ├── create.tsx               # Multi-step infringement form
│   │   ├── drafts.tsx               # Draft management
│   │   └── profile.tsx              # User profile
│   ├── (leader)/                    # Team leader screens
│   │   ├── _layout.tsx              # Leader layout
│   │   ├── index.tsx                # Team dashboard
│   │   ├── team.tsx                 # Team management
│   │   ├── cases.tsx                # Cases list
│   │   ├── create.tsx               # Create infringement
│   │   └── profile.tsx              # User profile
│   └── (tabs)/                      # Tab-based screens
│       ├── _layout.tsx              # Tab layout
│       ├── explore.tsx              # Explore/discover
│       └── index.tsx                # Home tab
│
├── components/                       # Reusable UI components
│   ├── ComponentShowcase.tsx        # Component gallery
│   ├── OSMMap.tsx                   # OpenStreetMap wrapper
│   ├── SyncStatus.tsx               # Sync status indicator
│   ├── SessionStatus.tsx            # Session info component
│   ├── WatermarkedImage.tsx         # Image with watermark
│   ├── parallax-scroll-view.tsx     # Parallax scroll container
│   ├── haptic-tab.tsx               # Tab with haptic feedback
│   ├── themed-text.tsx              # Themed text component
│   ├── themed-view.tsx              # Themed view component
│   ├── hello-wave.tsx               # Greeting component
│   ├── external-link.tsx            # External link handler
│   └── ui/                          # Base UI components
│       ├── Alert.tsx                # Alert component
│       ├── Badge.tsx                # Badge component
│       ├── Button.tsx               # Button component
│       ├── Card.tsx                 # Card component
│       ├── Input.tsx                # Input field
│       ├── Select.tsx               # Select dropdown
│       ├── Separator.tsx            # Divider
│       ├── Text.tsx                 # Text component
│       ├── collapsible.tsx          # Collapsible section
│       ├── icon-symbol.tsx          # Icon symbols
│       ├── icon-symbol.ios.tsx      # iOS-specific icons
│       ├── index.ts                 # UI exports
│       └── README.md                # UI component docs
│
├── hooks/                            # Custom React hooks
│   ├── use-color-scheme.ts          # Color scheme detection
│   ├── use-color-scheme.web.ts      # Web color scheme fallback
│   └── use-theme-color.ts           # Theme color hook
│
├── contexts/                         # React contexts
│   └── AuthContext.tsx              # Authentication state
│
├── lib/                              # Core utilities
│   ├── index.ts                     # Central export barrel
│   ├── types.ts                     # TypeScript types & database schema
│   ├── database.ts                  # Supabase query helpers
│   ├── offline.ts                   # Offline storage & sync queue
│   ├── storage.ts                   # AsyncStorage wrapper
│   ├── validation.ts                # Form validation rules
│   ├── formatting.ts                # Date, currency, GPS formatting
│   ├── styles.ts                    # Style utilities
│   └── watermark.ts                 # Watermark utilities
│
├── constants/                        # App constants
│   └── theme.ts                     # Colors, fonts, spacing
│
├── utils/                            # Helper functions
│   └── supabase.ts                  # Supabase client config
│
├── assets/                           # Static assets
│   └── images/                      # Image files
│
├── scripts/                          # Build scripts
│   └── reset-project.js             # Project reset utility
│
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── expo-env.d.ts                    # Expo type definitions
├── app.json                         # Expo app configuration
├── eslint.config.js                 # ESLint rules
├── BUILD_SUMMARY.md                 # Latest build status
├── QUICKSTART.md                    # Quick start guide
├── TESTING.md                       # Testing documentation
├── THEME_IMPLEMENTATION.md          # Theme details
└── README.md                        # App documentation
```
    ├── formatting.ts            # Date, currency formatting
    └── permissions.ts           # Permission checks
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (macOS only) or **Android Studio** with emulator
- **Expo Go** app on physical device (for quick testing)
- **Supabase account** with MANTIS project setup

### Installation

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Create a `.env` file in the `mobile` directory:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
   ```

4. **Start the development server**:
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

### Development Workflow

1. **Hot reloading**: Changes automatically refresh in the app
2. **Device logs**: View in terminal or Expo dev tools
3. **Debug menu**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
4. **Network inspector**: Monitor API calls in dev tools

---

## OpenStreetMap Integration

The mobile app uses **OpenStreetMap (OSM)** for all mapping functionality, providing:
- Free, open-source mapping data
- Offline map support
- High-quality map tiles for Fiji
- No usage limits or API keys required

### Map Library Options

We recommend **React Native Maps** with **OpenStreetMap tiles**:

#### Option 1: React Native Maps (Recommended)
```bash
npx expo install react-native-maps
```

**Pros:**
- Native performance
- Well-maintained Expo integration
- Supports both iOS MapKit and Android Google Maps
- Can use custom OSM tile providers

**Implementation:**
```tsx
import MapView, { Marker } from 'react-native-maps';

const customMapStyle = [
  // OSM tile server configuration
];

<MapView
  customMapStyle={customMapStyle}
  provider="osm" // Use OpenStreetMap
  region={{
    latitude: -18.1416,
    longitude: 178.4419,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  }}
>
  <Marker coordinate={{ latitude: -18.1416, longitude: 178.4419 }} />
</MapView>
```

#### Option 2: React Native MapLibre GL
```bash
npm install @maplibre/maplibre-react-native
```

**Pros:**
- Full MapLibre GL support
- Vector tiles for better performance
- Advanced styling capabilities
- Excellent offline support

**Cons:**
- More complex setup
- Larger bundle size

#### Option 3: React Native Leaflet
**Not recommended** - Leaflet is web-based and has poor performance in React Native WebView.

### OSM Tile Servers for Fiji

1. **OpenStreetMap Standard** (Default)
   ```
   https://tile.openstreetmap.org/{z}/{x}/{y}.png
   ```
   - Free, no API key required
   - Usage policy: Must not exceed 2 requests/second
   - Must include attribution

2. **Humanitarian OpenStreetMap** (Backup)
   ```
   https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png
   ```
   - Good for rural areas
   - Better road coverage in developing regions

3. **Mapbox (Paid alternative)**
   - Better performance and caching
   - Requires API key and billing account

### Map Features

- **Location selection**: Tap to select infringement location
- **Current location**: GPS tracking with accuracy indicator
- **Jurisdiction overlay**: Display agency boundaries (PostGIS polygons)
- **Offline tiles**: Cache map tiles for offline use
- **Search**: Search for locations and addresses
- **Clustering**: Group nearby infringements on map

---

## Offline Support

### Strategy

The app uses a **queue-based offline sync** approach:

1. **Capture**: All user actions saved locally to AsyncStorage
2. **Queue**: Failed API calls added to sync queue
3. **Background sync**: Automatic retry when connection restored
4. **Conflict resolution**: Last-write-wins with server authority

### Implementation

```typescript
// Local queue structure
interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
  retries: number;
}

// Sync on network restore
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    processSyncQueue();
  }
});
```

### Offline Capabilities

✅ **Available offline**:
- View cached infringements
- Create new infringements
- Edit draft infringements
- Capture photos
- View cached maps
- Access user profile

❌ **Requires connection**:
- Initial login
- Submit infringements
- Upload photos
- Sync latest data
- Search database
- View team analytics

---

## Authentication & Security

### Login Flow

1. User enters email on login screen
2. Supabase sends magic link or OTP
3. User verifies (clicks link or enters code)
4. App receives session token
5. Token stored in AsyncStorage
6. Auto-refresh on app launch

### Row-Level Security

All data access controlled by Supabase RLS policies:

```sql
-- Officers can only see their own agency's data
CREATE POLICY "officers_select_own_agency"
ON infringements FOR SELECT
USING (
  agency_id = (
    SELECT agency_id FROM users WHERE id = auth.uid()
  )
);
```

### Permissions

| Role | View Cases | Create | Edit Own | Edit Others | Approve | Analytics |
|------|-----------|--------|----------|-------------|---------|-----------|
| Officer | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Team Leader | ✅ | ✅ | ✅ | ✅ (team) | ✅ | ✅ |
| Agency Admin | ✅ | ✅ | ✅ | ✅ (agency) | ✅ | ✅ |

---

## Data Model (Mobile-specific)

### Schema Synchronization

The mobile app's TypeScript types are **synchronized with the database schema** defined in `website/src/lib/supabase/schema.ts`. All types match the Drizzle ORM schema to ensure consistency across web and mobile platforms.

**Key types file**: [`mobile/lib/types.ts`](../mobile/lib/types.ts)

This file includes:
- Complete type definitions for all database tables
- Type-safe Database interface for Supabase client
- Enums matching database constraints
- Insert types (omitting auto-generated fields)
- Extended types with relations for complex queries

### Database Tables

All database tables are typed and match the schema:

| Table | Type | Purpose |
|-------|------|---------|
| `agencies` | `Agency` | Enforcement agencies (LTA, Police, Councils) |
| `locations` | `Location` | Hierarchical GIS locations |
| `teams` | `Team` | Agency teams |
| `users` | `User` | Officers, leaders, admins |
| `drivers` | `Driver` | Driver information |
| `vehicles` | `Vehicle` | Vehicle registration |
| `offences` | `Offence` | Offence types and penalties |
| `offence_categories` | `OffenceCategory` | Offence groupings |
| `infringements` | `Infringement` | Core infringement records |
| `evidence_files` | `EvidenceFile` | Photo/video evidence |
| `payments` | `Payment` | Payment transactions |
| `appeals` | `Appeal` | Appeal submissions |
| `audit_logs` | `AuditLog` | System audit trail |

### Local Storage Schema

```typescript
// Cached infringements
interface LocalInfringement {
  id: string;
  status: 'draft' | 'pending_sync' | 'synced';
  data: Infringement;
  photos: LocalPhoto[];
  created_at: Date;
  modified_at: Date;
  synced_at: Date | null;
}

// Photo queue
interface LocalPhoto {
  id: string;
  uri: string;              // Local file path
  infringement_id: string;
  uploaded: boolean;
  upload_url: string | null;
  created_at: Date;
}

// Sync queue
interface SyncQueue {
  items: SyncQueueItem[];
  last_sync: Date;
  pending_count: number;
}
```

### AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  AUTH_TOKEN: '@mantis:auth:token',
  USER_PROFILE: '@mantis:user:profile',
  INFRINGEMENTS: '@mantis:infringements',
  SYNC_QUEUE: '@mantis:sync:queue',
  SETTINGS: '@mantis:settings',
  MAP_CACHE: '@mantis:map:cache',
};
```

---

## Helper Libraries

The mobile app includes several utility libraries to simplify development:

### 1. Database Helper (`lib/database.ts`)

Type-safe wrapper around Supabase client with common query patterns:

```typescript
import { getCurrentUser, getInfringements, createInfringement } from '@/lib/database';

// Get current authenticated user with relations
const { data: user } = await getCurrentUser();

// Query infringements with filters
const { data: cases } = await getInfringements({
  status: 'pending',
  officer_id: user.id,
  limit: 20,
});

// Create new infringement
const { data: newCase } = await createInfringement({
  agency_id: user.agency_id,
  officer_id: user.id,
  offence_code: 'LTA-001',
  fine_amount: 150,
  // ... other fields
});
```

**Features:**
- Type-safe queries using Database types
- Automatic error handling
- Joined queries for related data
- Search helpers for drivers/vehicles
- File upload to Supabase Storage
- Real-time subscriptions

### 2. Storage Helper (`lib/storage.ts`)

AsyncStorage wrapper with type safety and data structure management:

```typescript
import {
  saveLocalInfringement,
  getLocalInfringements,
  getSyncQueue,
  getSettings,
} from '@/lib/storage';

// Save draft infringement
await saveLocalInfringement({
  id: uuid(),
  status: 'draft',
  data: { /* infringement data */ },
  photos: [],
  created_at: new Date(),
  modified_at: new Date(),
  synced_at: null,
});

// Get all local infringements
const drafts = await getDraftInfringements();

// Manage sync queue
const queue = await getSyncQueue();
```

**Features:**
- Type-safe local storage operations
- Draft management
- Sync queue management
- Map tile caching
- User preferences/settings
- Storage info and cleanup

### 3. Validation Helper (`lib/validation.ts`)

Form validation with Fiji-specific rules:

```typescript
import {
  validateLicenseNumber,
  validatePlateNumber,
  validateInfringementForm,
} from '@/lib/validation';

// Validate individual fields
const licenseCheck = validateLicenseNumber('ABC123');
if (!licenseCheck.valid) {
  console.error(licenseCheck.error);
}

// Validate entire form
const { valid, errors } = validateInfringementForm({
  offence_code: 'LTA-001',
  driver_license_number: 'ABC123',
  driver_full_name: 'John Smith',
  vehicle_plate_number: 'FX 1234',
  fine_amount: 150,
});
```

**Validation Functions:**
- License number (Fiji format)
- Plate number (Fiji format)
- GPS coordinates (Fiji region)
- Names, addresses, dates
- File sizes and types
- Fine amounts
- Form completeness

### 4. Formatting Helper (`lib/formatting.ts`)

Consistent data formatting across the app:

```typescript
import {
  formatDate,
  formatCurrency,
  formatRelativeTime,
  formatInfringementStatus,
} from '@/lib/formatting';

// Date formatting
formatDate(new Date(), 'short');        // "16/01/2026"
formatDate(new Date(), 'long');         // "16 January 2026"
formatDateTime(new Date());             // "16/01/2026 2:30 PM"
formatRelativeTime(yesterday);          // "1 day ago"

// Currency (Fiji Dollar)
formatCurrency(150.50);                 // "FJD 150.50"
formatCurrencyShort(1500);              // "FJD 1.5K"

// Status labels
formatInfringementStatus('pending');    // "Pending Review"
formatRole('Team Leader');              // "Team Leader"

// Coordinates
formatCoordinates(-18.1416, 178.4419);  // "-18.141600, 178.441900"
```

**Formatting Functions:**
- Dates and times (with relative time)
- Currency (Fiji Dollars)
- Status labels
- GPS coordinates
- File sizes
- Phone numbers
- Counts and percentages

---

## Performance Optimization

### Best Practices

1. **Lazy loading**: Use `React.lazy()` for heavy components
2. **Image optimization**: Compress photos before upload
3. **List virtualization**: Use `FlatList` for long lists
4. **Memo/useMemo**: Prevent unnecessary re-renders
5. **Navigation optimization**: Use native stack navigator
6. **Bundle splitting**: Separate officer and leader bundles

### Map Performance

- Load only visible area tiles
- Limit marker count (use clustering)
- Debounce map region changes
- Cache tiles locally
- Use vector tiles when possible

---

## Testing

### Development Testing

```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Type checking
npx tsc --noEmit
```

### Physical Device Testing

1. Install **Expo Go** app from App Store / Play Store
2. Run `npx expo start`
3. Scan QR code with device camera
4. Test in real-world conditions (offline, poor GPS, etc.)

### Production Testing

```bash
# Build preview release
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Install on device via internal distribution
```

---

## Deployment

### EAS Build & Submit

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS**:
   ```bash
   eas build:configure
   ```

3. **Build for production**:
   ```bash
   # iOS
   eas build --profile production --platform ios
   
   # Android
   eas build --profile production --platform android
   ```

4. **Submit to stores**:
   ```bash
   # iOS App Store
   eas submit --platform ios
   
   # Google Play Store
   eas submit --platform android
   ```

### Over-the-Air Updates

Use Expo Updates for instant app updates without store review:

```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

---

## Troubleshooting

### Common Issues

**Issue**: App won't connect to Supabase
- ✅ Check `.env` file has correct URLs
- ✅ Verify network connectivity
- ✅ Check Supabase project status
- ✅ Restart Expo dev server

**Issue**: Maps not loading
- ✅ Check internet connection for tile downloads
- ✅ Verify OSM tile server is responding
- ✅ Check rate limiting (max 2 req/sec for OSM)
- ✅ Try alternative tile server

**Issue**: Photos not uploading
- ✅ Check camera permissions granted
- ✅ Verify file size < 10MB
- ✅ Check Supabase Storage bucket exists
- ✅ Verify RLS policies allow upload

**Issue**: GPS not working
- ✅ Check location permissions granted
- ✅ Enable location services on device
- ✅ Test outdoors for better signal
- ✅ Check `Expo Location` configuration

**Issue**: Offline sync not working
- ✅ Check AsyncStorage quota not exceeded
- ✅ Verify network state detection working
- ✅ Review sync queue in debug tools
- ✅ Check for error logs

---

## Future Enhancements

### Planned Features
- 🔄 **Voice input**: Dictate infringement details
- 📊 **Advanced analytics**: Team dashboards and metrics
- 🔔 **Rich notifications**: Case assignments and updates
- 🗺️ **Route planning**: Optimize patrol routes
- 📱 **Tablet support**: Optimized UI for larger screens
- 🌐 **Multi-language**: Fijian, Hindi, English
- 🔐 **Biometric auth**: Face ID / fingerprint login
- 📸 **AI assistance**: Auto-detect license plates
- 🎯 **Geofencing**: Automatic location tracking
- 📡 **Realtime collaboration**: See team locations live

---

## Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)
- [MapLibre Documentation](https://maplibre.org/maplibre-react-native/)

### Support
- Expo Discord: [chat.expo.dev](https://chat.expo.dev)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: [Your repo issues page]

---

## License

MANTIS Mobile App © 2026 - Proprietary software for Fiji Government agencies.

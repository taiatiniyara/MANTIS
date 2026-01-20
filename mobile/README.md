# MANTIS Mobile App 📱

The MANTIS mobile application for field officers and team leaders. Built with **Expo** and **React Native**.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and add your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase URL and anon key:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

### 3. Start the Development Server

```bash
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan the QR code with Expo Go on your physical device

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── index.tsx          # Splash/Auth gate
│   ├── (auth)/            # Authentication flow
│   │   └── login.tsx      # Login screen
│   ├── (officer)/         # Officer screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── map.tsx        # Map view (placeholder)
│   │   ├── create.tsx     # Create infringement
│   │   ├── cases.tsx      # Cases list
│   │   └── profile.tsx    # User profile
│   └── (leader)/          # Team leader screens
│       ├── index.tsx      # Team dashboard
│       ├── team.tsx       # Team management
│       ├── create.tsx     # Create infringement
│       ├── cases.tsx      # Cases list
│       └── profile.tsx    # User profile
├── components/            # Reusable UI components
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication state
├── lib/                   # Core utilities
│   ├── types.ts          # TypeScript types (matches DB schema)
│   ├── database.ts       # Supabase queries
│   ├── storage.ts        # AsyncStorage wrapper
│   ├── validation.ts     # Form validation
│   └── formatting.ts     # Data formatting
└── utils/
    └── supabase.ts       # Supabase client config
```

## Features

### ✅ Implemented
- **Authentication** - Login with Supabase Auth
- **Auth Context** - Global authentication state
- **Officer Dashboard** - Quick stats and recent cases
- **Cases List** - View, search, and filter infringements
- **Profile Screen** - User info and sign out
- **Team Leader Dashboard** - Team stats and management
- **Type-safe Database** - All queries match the schema
- **Offline-ready Storage** - AsyncStorage helpers
- **Data Validation** - Fiji-specific validation rules
- **Formatting Utilities** - Date, currency, GPS formatting
- **Create Infringement Form** - Multi-step form with validation
- **GPS Location Capture** - Live location tracking with expo-location
- **Photo Evidence** - Camera and gallery integration with expo-image-picker
- **OpenStreetMap Integration** - Interactive maps with Leaflet
- **Offline Sync Queue** - Background synchronization with retry logic
- **Sync Status Display** - Visual feedback for pending syncs

### 🚧 To Be Implemented
- [ ] **Driver/Vehicle Lookup** - Search existing records before creating
- [ ] **Draft Management UI** - View and edit saved drafts
- [ ] **Team Member List** - View and manage team
- [ ] **Approvals Queue** - Review pending cases (Team Leader)
- [ ] **Push Notifications** - Case updates
- [ ] **Reports** - Generate PDF reports
- [ ] **Settings Screen** - App preferences and configuration

## User Roles

### Officer
- View personal dashboard
- Create infringements
- View assigned cases
- Access map for location selection
- Capture evidence photos

### Team Leader
- All officer features plus:
- View team dashboard
- Manage team members
- Review and approve cases
- View team performance
- Generate reports

## Database Schema

All TypeScript types in `lib/types.ts` match the database schema exactly. See the [main documentation](../docs/10-mobile-app.md) for details.

## Development

### Running Tests
```bash
npm test
```

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## Building

### Development Build
```bash
npx expo run:ios
npx expo run:android
```

### Production Build (with EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --platform ios
eas build --platform android
```

## Documentation

Full documentation available at [docs/10-mobile-app.md](../docs/10-mobile-app.md)

## Support

- Expo Discord: [chat.expo.dev](https://chat.expo.dev)
- GitHub Issues: [Report a bug](../../issues)

---

**MANTIS** - Multi-Agency National Traffic Infringement System
© 2026 - Built for Fiji Government Agencies


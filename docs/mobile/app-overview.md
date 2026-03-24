# MANTIS Mobile App

The MANTIS mobile application is built with Expo + React Native for field officers and team leaders.

It is optimized for offline-first infringement capture, GIS-assisted location selection, and secure Supabase-backed sync.

---

## Current Scope

### Officer
- Multi-step infringement creation (offence → driver → vehicle → location → evidence → review)
- GPS and map selection using Leaflet in WebView (`OSMMap`)
- Photo evidence capture / gallery import with watermarking
- Save draft, submit, and offline queue support
- Cases list with filters and case details modal
- Drafts management (edit/delete)
- Profile with sync controls and offline-mode toggle

### Team Leader
- Dashboard and basic cases listing
- Create/cases/profile screens are present (some still foundation-level)

---

## Production-Readiness Work Completed (Feb 2026)

- Base UI primitives hardened for accessibility:
  - `Button`, `Input`, `Select`, `Badge`
  - Minimum target sizes and improved contrast defaults
- Form accessibility improvements:
  - Login and create-flow announcements via `AccessibilityInfo`
  - Submit lockouts to prevent double-submit
- Action-screen hardening:
  - Cases/drafts/profile actions include accessibility labels and disabled/busy states
  - Refresh and destructive actions guarded against duplicate triggers
- Case details reliability:
  - Driver license and vehicle plate now load by ID from Supabase instead of static placeholders
- Tab bar stability:
  - Role-based tab layout uses default tab button rendering for consistent icon/label alignment
  - Haptics restored via `tabPress` listeners (no layout side effects)

---

## Tech Stack (Mobile)

| Layer | Technology |
|---|---|
| Framework | Expo 54 + React Native 0.81 |
| Language | TypeScript |
| Routing | Expo Router |
| Data Fetching | TanStack Query |
| Backend | Supabase (`@supabase/supabase-js`) |
| Local Data | AsyncStorage |
| Maps | Leaflet via `react-native-webview` |
| Media | Expo Image Picker + image manipulation |
| Location | Expo Location |
| Network | Expo Network |

---

## Project Layout (Key Paths)

- `mobile/app/(auth)/login.tsx` – login + reset
- `mobile/app/(officer)/create.tsx` – infringement creation flow
- `mobile/app/(officer)/cases.tsx` – cases list + details modal
- `mobile/app/(officer)/drafts.tsx` – draft management
- `mobile/app/(officer)/profile.tsx` – sync and preferences
- `mobile/app/(leader)/*` – leader routes
- `mobile/components/RoleBasedTabLayout.tsx` – tab shell
- `mobile/lib/database.ts` – Supabase data helpers
- `mobile/lib/offline.ts` – draft/sync queue logic
- `mobile/lib/queryKeys.ts` – query key factory

---

## Environment

Create `mobile/.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-or-publishable-key
```

Never use service-role keys in the mobile app.

---

## Run Locally

```bash
cd mobile
npm install
npm run start
```

Then use:
- `i` for iOS simulator (macOS)
- `a` for Android emulator
- Expo Go on a physical device for camera/GPS verification

---

## Related Docs

- [Quick Start](./quickstart.md)
- [Testing Guide](./testing.md)
- [Release Checklist](./release-checklist.md)
- [Theme Implementation](./theme-implementation.md)
- [Troubleshooting](../development/troubleshooting.md)

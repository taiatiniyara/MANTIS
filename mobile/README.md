# 📱 MANTIS Mobile App# Welcome to your Expo app 👋



**Traffic Infringement Recording App for Field Officers**# 📱 MANTIS Mobile Application



**Version**: 1.0.0 | **Status**: ✅ Production Ready | **Platform**: iOS & Android (Expo SDK 54)**Status**: ✅ 85% Complete | **Platform**: React Native + Expo SDK 54



---This is the mobile officer application for the MANTIS traffic infringement system.



## 🎯 Overview## 🚀 Quick Start



MANTIS Mobile is a React Native/Expo app for Fiji Police officers to record traffic infringements with GPS tracking, photo evidence with watermarks, and real-time sync to Supabase.```bash

npm install

---npx expo start

```

## ✨ Key Features

## 📚 Documentation

### 🚓 Infringement Recording

- Vehicle ID and infringement type selectionComplete mobile app documentation is available in the `/docs/mobile/` folder:

- Auto-generated notes with timestamp, officer, and location

- GPS location capture with real-time tracking- **[Current Status](../docs/mobile/PROJECT_STATUS.md)** - Latest development status

- Multiple photo capture with automatic watermarking- **[Development Plan](../docs/mobile/DEVELOPMENT_PLAN.md)** - Architecture and roadmap

- Form validation and auto-clear after submission- **[Sprint Reports](../docs/mobile/)** - Sprint completion summaries



### 📸 Evidence Capture & Watermarking## 🔗 Links

- Built-in camera with front/back toggle

- Automatic watermarking with metadata:- **[Main Project](../README.md)** - Project overview

  - 📸 Timestamp | 👤 Officer | 📍 GPS | 🚗 Vehicle | ⚠️ Violation- **[Documentation Index](../docs/INDEX.md)** - Complete documentation

- Large, high-contrast text (26px, bold)- **[Getting Started](../docs/GETTING_STARTED.md)** - Setup guide

- Dynamic watermark sizing (200-260px height)

- Direct upload to Supabase Storage---



### 📋 History & Records**For complete documentation, see [/docs/mobile/](../docs/mobile/)**

- Complete infringement history with search
- Filter by status (pending, issued, paid, appealed)
- Full-screen details modal with all information
- Evidence photo gallery with loading from storage
- Pull-to-refresh functionality

### 🏠 Dashboard
- Officer statistics (today, week, month, total)
- Quick actions (Record, View History)
- Online/offline and GPS status indicators
- Current location display

### 🔐 Authentication
- Secure login with Supabase Auth
- Token refresh with fallback handling
- SecureStore (with AsyncStorage fallback)
- Session persistence

---

## 🛠️ Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81.4
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based)
- **Backend**: Supabase (PostgreSQL + Storage)
- **Camera**: expo-camera (~16.0.7)
- **Watermarking**: react-native-view-shot (4.0.3)
- **Location**: expo-location (~18.0.7)
- **Storage**: expo-secure-store + AsyncStorage
- **Network**: @react-native-community/netinfo

---

## 📂 Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout + auth
│   ├── login.tsx          # Login screen
│   └── (tabs)/            # Tab navigation
│       ├── index.tsx      # Dashboard
│       ├── explore.tsx    # History/Search
│       ├── profile.tsx    # Profile
│       └── infringement/  # Recording
├── components/            # Reusable components
│   ├── watermarked-image.tsx  # Photo watermarking
│   └── ui/               # UI primitives
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Auth state
├── lib/                  # Libraries
│   ├── supabase.ts       # Supabase client
│   └── gps-service.ts    # Location services
├── constants/            
│   └── theme.ts          # Colors & typography
└── app.json             # Expo config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator

### Installation

1. **Install dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Configure environment**
   
   Create `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Start dev server**
   ```bash
   npx expo start
   ```

4. **Run on device**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR with Expo Go app

---

## 📸 Photo Upload System

### Upload Flow
1. Camera captures photo
2. WatermarkedImage processes with metadata overlay
3. react-native-view-shot captures final image
4. Direct HTTP POST to Supabase Storage (bypasses React Native Blob limitation)
5. Stored as: `{infringementId}_{timestamp}_{index}.jpg`

### Photo Retrieval
1. List files in `evidence-photos` bucket
2. Filter by infringement ID prefix
3. Generate public URLs
4. Display in horizontal gallery

---

## 🎨 Design

- **Primary Color**: Blue (#2563eb)
- **Background**: White (#ffffff)
- **Text**: Dark zinc (#18181b)
- **Currency**: Fijian Dollar ($)
- **Status Bar**: Dark icons on light background
- **Tab Bar**: White with blue active state

---

## 📦 Build & Deploy

### Development
```bash
npx expo start --dev-client
```

### Production
```bash
# Android
eas build --platform android

# iOS  
eas build --platform ios
```

---

## 📊 Status

### Completed ✅
- Authentication & token refresh
- Dashboard with statistics
- Infringement recording with camera
- Photo watermarking & upload
- GPS location tracking
- History with search & filters
- Details modal with photo gallery
- Profile screen
- Bottom tab navigation
- Centralized status bar
- Error handling

### Limitations ⚠️
- No offline sync
- No biometric auth
- No push notifications
- Web platform has limited camera support

---

## 🔧 Troubleshooting

**Token refresh errors**: All fields have null safety with fallbacks

**Photo upload errors**: Using direct HTTP upload with Uint8Array

**Watermark too small**: Text size 26px with shadows

**Status bar invisible**: Centralized "dark" style in root

**Tab icons missing**: Icon mappings added in icon-symbol.tsx

---

## 📝 License

Internal use for Fiji Police Force.

---

**Last Updated**: October 27, 2025

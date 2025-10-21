# 📱 MANTIS Mobile App Development Plan

**Date**: October 20, 2025  
**Platform**: React Native with Expo  
**Target**: iOS & Android

---

## 🎯 Mobile App Overview

The MANTIS Mobile app is designed specifically for **field officers** to:
- ✅ Record traffic infringements on-the-go
- ✅ Capture GPS location automatically
- ✅ Take photos of violations
- ✅ Work offline and sync when online
- ✅ Track their patrol routes
- ✅ View their recorded infringements

---

## 📋 Development Phases

### **Phase 1: Foundation & Setup** ⏱️ 2-3 hours
- ✅ Expo app already created (Expo SDK 54)
- ⏳ Configure Supabase connection
- ⏳ Set up authentication (login/logout)
- ⏳ Create navigation structure
- ⏳ Set up offline storage with AsyncStorage

### **Phase 2: Core Features** ⏱️ 4-5 hours
- ⏳ Infringement recording form
- ⏳ GPS location capture (using expo-location)
- ⏳ Camera integration for evidence photos (using expo-camera)
- ⏳ Offline mode with data sync
- ⏳ Real-time GPS tracking

### **Phase 3: User Experience** ⏱️ 2-3 hours
- ⏳ Dashboard for officers
- ⏳ List of recorded infringements
- ⏳ Biometric authentication (fingerprint/face)
- ⏳ Push notifications
- ⏳ Profile management

### **Phase 4: Polish & Testing** ⏱️ 2 hours
- ⏳ UI/UX refinement
- ⏳ Error handling
- ⏳ Performance optimization
- ⏳ Testing on real devices

---

## 🏗️ App Architecture

### **Screen Structure**:
```
/auth
  - login.tsx
  - forgot-password.tsx

/(tabs)
  - index.tsx (Dashboard/Home)
  - infringements.tsx (List)
  - record.tsx (New Infringement)
  - profile.tsx (User Profile)

/infringement
  - [id].tsx (View Details)
  - camera.tsx (Camera Screen)
```

### **Key Components**:
- `<InfringementForm />` - Record new violation
- `<GPSCapture />` - Auto-capture location
- `<EvidenceCamera />` - Already exists!
- `<OfflineIndicator />` - Show offline status
- `<SyncManager />` - Handle data synchronization

---

## 🔑 Key Features Breakdown

### **1. Authentication** 🔐
- Email/password login with Supabase Auth
- Biometric login (fingerprint/face ID)
- Auto-login on app launch
- Secure token storage in SecureStore
- Role verification (officers only)

### **2. GPS Location** 📍
**Already have**: `expo-location` installed

**Features**:
- Auto-capture current location
- Background GPS tracking during patrol
- Location accuracy indicator
- Manual location override
- Store GPS path history

**Implementation**:
```typescript
import * as Location from 'expo-location';

// Request permissions
const { status } = await Location.requestForegroundPermissionsAsync();

// Get current location
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High
});

// Background tracking
await Location.startLocationUpdatesAsync(TASK_NAME, {
  accuracy: Location.Accuracy.High,
  timeInterval: 30000, // 30 seconds
  distanceInterval: 100, // 100 meters
});
```

### **3. Camera & Photos** 📸
**Already have**: `expo-camera`, `expo-image-picker`

**Features**:
- Take photos of violations
- Multiple photos per infringement
- Compress before upload
- Store locally if offline
- Automatic upload when online

### **4. Offline Mode** 📴
**Already have**: `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`

**Features**:
- Record infringements offline
- Queue for sync when online
- Show sync status
- Retry failed uploads
- Conflict resolution

**Implementation**:
```typescript
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check connectivity
const netInfo = await NetInfo.fetch();
if (!netInfo.isConnected) {
  // Store offline
  await AsyncStorage.setItem('pending_infringements', JSON.stringify(data));
} else {
  // Sync to Supabase
  await supabase.from('infringements').insert(data);
}
```

### **5. Real-time Sync** 🔄
- Automatic sync when online
- Background sync queue
- Conflict resolution
- Progress indicators
- Success/failure notifications

---

## 📦 Required Packages (Already Installed!)

✅ **Authentication**: `@supabase/supabase-js`  
✅ **Storage**: `@react-native-async-storage/async-storage`, `expo-secure-store`  
✅ **Location**: `expo-location`  
✅ **Camera**: `expo-camera`, `expo-image-picker`  
✅ **Network**: `@react-native-community/netinfo`  
✅ **Notifications**: `expo-notifications`  
✅ **Biometrics**: `expo-local-authentication`  
✅ **Navigation**: `expo-router`  

**All dependencies are already installed!** ✨

---

## 🎨 UI Design Principles

### **Mobile-First**:
- Large touch targets (min 44x44 points)
- Easy one-handed operation
- Bottom navigation for core actions
- Swipe gestures for common tasks

### **Field-Optimized**:
- High contrast for outdoor visibility
- Large fonts for readability
- Quick access to camera and GPS
- Minimal text entry (use dropdowns/pickers)

### **Offline-Ready**:
- Clear offline indicator
- Queue visibility
- Retry mechanisms
- Graceful degradation

---

## 🚀 Implementation Priority

### **Sprint 1** (Today - Phase 1):
1. ✅ Configure Supabase (.env setup)
2. ✅ Create Supabase client utility
3. ✅ Build login screen
4. ✅ Set up navigation structure
5. ✅ Create basic dashboard

### **Sprint 2** (Phase 2 - Core Features): ✅ COMPLETE
1. ✅ GPS location service - `mobile/lib/gps-service.ts`
2. ✅ Dashboard screen - `mobile/app/(tabs)/index.tsx`
3. ✅ Infringement recording form - `mobile/app/record.tsx`
4. ✅ Offline storage with AsyncStorage
5. ✅ Network connectivity detection

**See `mobile/SPRINT_2_COMPLETE.md` for full details**

### **Sprint 3** (Phase 3 - Polish): ✅ COMPLETE
1. ✅ Camera integration - `mobile/app/camera.tsx`
2. ✅ Infringement list view - `mobile/app/(tabs)/explore.tsx`
3. ✅ Offline sync manager - `mobile/lib/sync-manager.ts`
4. ✅ Image compression with expo-image-manipulator
5. ✅ Search and filter functionality

**See `mobile/SPRINT_3_COMPLETE.md` for full details**

---

## 📝 Database Integration

### **Supabase Tables Used**:
- `users` - Officer authentication and profile
- `infringements` - Record violations with GPS
- `infringement_types` - Violation categories
- `gps_tracking` - Store GPS breadcrumb trail
- `locations` - Reference locations

### **Real-time Features**:
- Sync infringements when online
- Upload photos to Supabase Storage
- Track GPS position to `gps_tracking` table
- Receive notifications for updates

---

## 🔐 Security Considerations

1. **Authentication**:
   - Tokens stored in SecureStore (encrypted)
   - Auto-logout after inactivity
   - Biometric re-authentication for sensitive actions

2. **Data Protection**:
   - Encrypt offline data
   - Clear cache on logout
   - Secure photo storage

3. **Permissions**:
   - Request only necessary permissions
   - Explain why permissions are needed
   - Graceful handling if denied

---

## 🧪 Testing Strategy

### **Manual Testing**:
- Test on real devices (Android + iOS)
- Test offline mode (airplane mode)
- Test GPS accuracy in various conditions
- Test camera in different lighting
- Test sync with poor connectivity

### **Automated Testing**:
- Unit tests for utilities
- Integration tests for Supabase
- E2E tests for critical flows

---

## 📈 Success Metrics

- ⏱️ Average time to record infringement: < 60 seconds
- 📍 GPS accuracy: < 10 meters
- 📴 Offline reliability: 100% (no data loss)
- 🔄 Sync success rate: > 99%
- ⭐ User satisfaction: Positive feedback from officers

---

## 🎯 Next Steps

**Let's start with Sprint 1!**

1. Configure Supabase connection
2. Create authentication flow
3. Build navigation structure
4. Create dashboard screen
5. Set up offline storage

**Ready to begin?** Let me know and I'll start building! 🚀

# 🗺️ Phase 4 Sprint 1: Google Maps Mobile Integration - Implementation Plan

**Sprint:** Phase 4, Sprint 1  
**Start Date:** October 13, 2025  
**Target Completion:** October 20, 2025  
**Status:** 🚀 IN PROGRESS

---

## 📋 Sprint Overview

### Objective
Integrate Google Maps into the MANTIS mobile app to provide rich location visualization and selection capabilities, matching the functionality already delivered for the web application.

### Success Criteria
- ✅ Google Maps displays correctly on both iOS and Android
- ✅ Infringement detail view shows location on an interactive map
- ✅ Create infringement form includes a LocationPicker component
- ✅ Custom markers match MANTIS branding
- ✅ Maps are theme-aware (light/dark mode)
- ✅ Proper error handling and permissions management
- ✅ Zero TypeScript errors maintained
- ✅ Comprehensive documentation created

### Dependencies
- ✅ Phase 3 Mobile App complete (all features working)
- ✅ Google Maps API keys already configured (from web integration)
- ✅ Expo 54 project with proper configuration
- ⚠️ Need to add iOS/Android specific API key restrictions

---

## 🎯 Sprint Backlog

### Task 1: Install Dependencies & Configuration
**Estimated Time:** 1 hour  
**Priority:** High  
**Status:** 📋 Todo

**Steps:**
1. Install react-native-maps
   ```bash
   cd mantis-mobile
   npx expo install react-native-maps
   ```

2. Update `app.json` with Google Maps API keys
   ```json
   {
     "expo": {
       "android": {
         "config": {
           "googleMaps": {
             "apiKey": "YOUR_ANDROID_API_KEY"
           }
         }
       },
       "ios": {
         "config": {
           "googleMapsApiKey": "YOUR_IOS_API_KEY"
         }
       }
     }
   }
   ```

3. Update Google Cloud Platform API key restrictions
   - Add iOS app identifier restriction
   - Add Android package name + SHA-1 fingerprint restriction

**Deliverables:**
- ✅ Dependencies installed
- ✅ API keys configured in app.json
- ✅ GCP restrictions updated

---

### Task 2: Create MapView Component
**Estimated Time:** 2 hours  
**Priority:** High  
**Status:** 📋 Todo

**Component:** `components/maps/infringement-map-view.tsx`

**Features:**
- Display a single location on the map
- Custom marker icon
- Zoom controls
- Map type selector (standard, satellite, hybrid)
- Theme-aware styling
- Loading state
- Error handling
- "Get Directions" button (opens native maps app)

**Props Interface:**
```typescript
interface InfringementMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  showDirections?: boolean;
}
```

**Implementation Notes:**
- Use `MapView` from react-native-maps
- Use `Marker` component for location pin
- Set initial region with appropriate zoom level
- Handle map load errors gracefully
- Integrate with device's native maps app for directions

**Deliverables:**
- ✅ `infringement-map-view.tsx` component created
- ✅ Component exports proper TypeScript types
- ✅ Error boundaries implemented
- ✅ Loading states added

---

### Task 3: Create LocationPicker Component
**Estimated Time:** 3 hours  
**Priority:** High  
**Status:** 📋 Todo

**Component:** `components/maps/location-picker.tsx`

**Features:**
- Interactive map with draggable marker
- Search functionality (address/place search)
- Current location button (get device GPS)
- Map type selector
- Coordinate display (latitude, longitude)
- Address reverse geocoding
- Zoom controls
- Save/Cancel buttons

**Props Interface:**
```typescript
interface LocationPickerProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  onCancel: () => void;
}
```

**Implementation Notes:**
- Use draggable `Marker` component
- Integrate with Google Places API for address search
- Use Geocoding API for reverse geocoding
- Request location permissions properly
- Smooth map animations when location changes
- Validate coordinates are within Fiji bounds

**Deliverables:**
- ✅ `location-picker.tsx` component created
- ✅ Search and geocoding integrated
- ✅ Current location functionality working
- ✅ Proper permission handling

---

### Task 4: Integrate Map into Infringement Detail View
**Estimated Time:** 1.5 hours  
**Priority:** High  
**Status:** 📋 Todo

**File:** `components/infringement-detail-modal.tsx`

**Changes:**
1. Add new "Location" section after "Offence Details"
2. Import and use `InfringementMapView` component
3. Display map when coordinates are available
4. Show "No location data" message when coordinates missing
5. Add "Get Directions" button

**Implementation Notes:**
- Only show map section if `latitude` and `longitude` exist
- Set appropriate height for map view (~250-300px)
- Add proper loading state while map initializes
- Ensure smooth scrolling in modal

**Deliverables:**
- ✅ Map integrated into detail modal
- ✅ Conditional rendering based on coordinate availability
- ✅ UI is consistent with existing sections

---

### Task 5: Integrate LocationPicker into Create Form
**Estimated Time:** 2 hours  
**Priority:** High  
**Status:** 📋 Todo

**File:** `app/(tabs)/create.tsx`

**Changes:**
1. Add "Location" section with two options:
   - "Use Current GPS Location" button (existing functionality)
   - "Pick Location on Map" button (new)
2. Create modal to show `LocationPicker` component
3. Update location state when user selects from map
4. Display selected location (address or coordinates)
5. Allow switching between GPS and map selection

**Implementation Notes:**
- Keep existing GPS auto-capture functionality
- Add new map-based selection as alternative
- Store both coordinates and address (if available)
- Show visual indicator of which method was used
- Validate location is within Fiji

**Deliverables:**
- ✅ LocationPicker integrated into create form
- ✅ Modal wrapper created for picker
- ✅ Both GPS and map selection methods available
- ✅ UI is intuitive and user-friendly

---

### Task 6: Custom Markers & Styling
**Estimated Time:** 2 hours  
**Priority:** Medium  
**Status:** 📋 Todo

**Features:**
- Create custom marker images for different infringement statuses
  - Issued: Orange marker
  - Paid: Green marker
  - Disputed: Blue marker
  - Voided: Gray marker
- Implement theme-aware map styling
  - Light theme: Standard Google Maps style
  - Dark theme: Night mode style
- Add MANTIS branding to markers

**Implementation Notes:**
- Use SVG or PNG images for markers
- Store marker assets in `assets/images/markers/`
- Create reusable marker component
- Apply map styles based on color scheme context
- Ensure markers are visible on all map types

**Deliverables:**
- ✅ Custom marker images created
- ✅ Marker component with status-based styling
- ✅ Theme-aware map styling implemented
- ✅ Assets properly optimized

---

### Task 7: Testing & Quality Assurance
**Estimated Time:** 2 hours  
**Priority:** High  
**Status:** 📋 Todo

**Testing Checklist:**
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify location permissions flow
- [ ] Test offline behavior (graceful degradation)
- [ ] Test with no GPS hardware available
- [ ] Verify map loads on slow network
- [ ] Test marker interactions
- [ ] Test LocationPicker in create form
- [ ] Verify map in detail view
- [ ] Test theme switching with maps
- [ ] Check TypeScript compilation (zero errors)
- [ ] Test memory usage (no leaks)
- [ ] Verify "Get Directions" opens native app

**Edge Cases to Test:**
- Location permissions denied
- GPS unavailable
- Network offline
- Invalid coordinates
- Map load failure
- Search API errors
- Large coordinate values

**Deliverables:**
- ✅ All tests passing
- ✅ Bug list created and addressed
- ✅ Performance verified

---

### Task 8: Documentation
**Estimated Time:** 1.5 hours  
**Priority:** Medium  
**Status:** 📋 Todo

**Documents to Create:**
1. **PHASE4_SPRINT1_MAPS_MOBILE_SUMMARY.md**
   - Sprint overview
   - Components created
   - Features implemented
   - Code metrics
   - Screenshots
   - Known issues
   - Next steps

2. **Update README.md** in mantis-mobile
   - Add Google Maps setup instructions
   - Document API key configuration
   - Add troubleshooting section

3. **Update Milestones.md**
   - Mark Sprint 1 tasks complete
   - Update Phase 4 progress percentage
   - Add changelog entry

**Deliverables:**
- ✅ Sprint summary document created
- ✅ README updated with setup instructions
- ✅ Milestones.md updated

---

## 📦 Technical Specifications

### API Integration

**Google Maps APIs Used:**
1. **Maps SDK for Android** - Display maps on Android
2. **Maps SDK for iOS** - Display maps on iOS
3. **Geocoding API** - Convert addresses to coordinates
4. **Places API** - Search for locations
5. **Directions API** - Optional (for route planning)

**API Key Configuration:**
```typescript
// Use environment variables for security
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
```

### Component Architecture

```
components/maps/
├── infringement-map-view.tsx     // Display single location
├── location-picker.tsx            // Interactive location selection
├── map-marker.tsx                 // Reusable marker component
└── map-styles.ts                  // Theme-aware map styles

assets/images/markers/
├── marker-issued.png
├── marker-paid.png
├── marker-disputed.png
└── marker-voided.png
```

### State Management

**Location State in Create Form:**
```typescript
interface LocationState {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  source: 'gps' | 'map' | 'manual';
}
```

---

## 🎨 UI/UX Considerations

### Map Styling
- **Light Theme:** Standard Google Maps colors
- **Dark Theme:** Night mode with muted colors
- **Marker Colors:** Status-based (orange, green, blue, gray)
- **Map Height:** 250-300px in detail view, full screen in picker

### User Flow

**Viewing Location (Detail View):**
1. User taps infringement in list
2. Detail modal opens
3. Scrolls to "Location" section
4. Map displays with marker at infringement coordinates
5. User can tap "Get Directions" to open native maps app

**Selecting Location (Create Form):**
1. User taps "Create Infringement"
2. Fills in vehicle/offence details
3. In "Location" section, user has two options:
   - Tap "Use Current GPS" → Auto-captures GPS coordinates
   - Tap "Pick on Map" → Opens LocationPicker modal
4. If using map:
   - Map opens with current location centered
   - User can search for address or drag marker
   - User taps "Confirm Location"
   - Coordinates and address saved to form
5. Location displayed in form as confirmation

### Accessibility
- Proper labels for map controls
- Alternative text for markers
- Keyboard navigation support (where applicable)
- Clear error messages
- Loading indicators

---

## 🚀 Deployment Notes

### iOS Considerations
- Add `NSLocationWhenInUseUsageDescription` to Info.plist (already done)
- Verify Google Maps SDK for iOS is included in build
- Test on physical device (maps don't work well in simulator)

### Android Considerations
- Add API key to `app.json` in android config
- Add SHA-1 fingerprint to Google Cloud Console
- Request location permissions at runtime
- Test on both emulator and physical device

### Environment Variables
```bash
# .env file
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

---

## 📊 Success Metrics

### Code Metrics
- **New Components:** 4-5 components
- **Lines of Code:** ~800-1000 lines
- **TypeScript Errors:** 0
- **Test Coverage:** >80% (if implementing tests)

### Performance Metrics
- Map load time: <2 seconds
- Location selection response: <500ms
- Memory usage: <50MB increase
- Smooth 60fps map interactions

### User Experience Metrics
- Location accuracy: ±10 meters
- Map usability score: 4.5+/5
- Feature adoption: >70% officers use map picker
- Error rate: <5%

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. Maps require internet connection (no offline tiles)
2. API usage costs apply (monitor quotas)
3. Simulator performance may be poor (test on device)
4. First map load may be slow (caching helps)

### Future Enhancements
- Offline map caching
- Heat map visualization
- Multiple marker display
- Route planning between infringements
- Location history tracking

---

## 📚 Resources

### Documentation
- [react-native-maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Google Maps Platform](https://developers.google.com/maps)
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)

### Examples
- Web implementation: `mantis-web/src/components/maps/`
- GOOGLE_MAPS_IMPLEMENTATION_COMPLETE.md
- GOOGLE_MAPS_API_SETUP.md

---

## 🎯 Next Sprint Preview

### Phase 4 Sprint 2: Evidence Management Enhancement
**Planned Features:**
- Video evidence upload (mobile)
- Advanced photo editing tools
- Evidence integrity verification
- Signed URL generation
- Bulk evidence operations

**Estimated Duration:** 1 week  
**Complexity:** Medium-High

---

**Sprint Start:** October 13, 2025  
**Sprint End:** October 20, 2025  
**Sprint Lead:** TBD  
**Status:** 🚀 IN PROGRESS

# 🗺️ Quick Start: Google Maps Mobile Integration

**Sprint:** Phase 4, Sprint 1  
**Duration:** 1 week  
**Complexity:** Medium  

---

## 🎯 What We're Building

Adding Google Maps to the MANTIS mobile app so officers can:
- View infringement locations on an interactive map
- Select locations visually instead of just using GPS
- Get directions to infringement sites
- See location data in a more intuitive way

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
cd mantis-mobile
npx expo install react-native-maps
```

### Step 2: Configure API Keys

Edit `mantis-mobile/app.json`:
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

### Step 3: Update GCP Restrictions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Add restrictions:
   - **iOS:** Bundle ID (com.yourcompany.mantismobile)
   - **Android:** Package name + SHA-1 fingerprint

---

## 📁 Files to Create

### Components (4 files)
```
mantis-mobile/components/maps/
├── infringement-map-view.tsx    (~200 lines)
├── location-picker.tsx           (~350 lines)
├── map-marker.tsx                (~100 lines)
└── map-styles.ts                 (~150 lines)
```

### Assets (4 images)
```
mantis-mobile/assets/images/markers/
├── marker-issued.png
├── marker-paid.png
├── marker-disputed.png
└── marker-voided.png
```

---

## 🛠️ Component Specs

### 1. InfringementMapView
**Purpose:** Display a single infringement location  
**Used in:** Infringement detail modal  

**Basic Usage:**
```typescript
<InfringementMapView
  latitude={-17.8216}
  longitude={178.4219}
  title="Speeding Violation"
  showDirections={true}
/>
```

**Key Features:**
- Custom marker icon
- Map type selector
- Get directions button
- Theme-aware styling

---

### 2. LocationPicker
**Purpose:** Interactive location selection  
**Used in:** Create infringement form  

**Basic Usage:**
```typescript
<LocationPicker
  initialLocation={{ latitude: -17.8216, longitude: 178.4219 }}
  onLocationSelect={(location) => {
    console.log('Selected:', location);
  }}
  onCancel={() => {
    console.log('Cancelled');
  }}
/>
```

**Key Features:**
- Draggable marker
- Address search
- Current location button
- Reverse geocoding
- Coordinate display

---

## 🎨 Integration Points

### 1. Detail Modal Integration
**File:** `components/infringement-detail-modal.tsx`

Add after "Offence Details" section:
```typescript
{/* Location Section */}
{infringement.latitude && infringement.longitude && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>📍 Location</Text>
    <InfringementMapView
      latitude={infringement.latitude}
      longitude={infringement.longitude}
      title={`Infringement #${infringement.infringement_number}`}
      showDirections={true}
    />
    {infringement.location && (
      <Text style={styles.locationText}>{infringement.location}</Text>
    )}
  </View>
)}
```

---

### 2. Create Form Integration
**File:** `app/(tabs)/create.tsx`

Add in location section:
```typescript
{/* Location Selection */}
<View style={styles.locationSection}>
  <Text style={styles.label}>Location</Text>
  
  {/* Current GPS Button */}
  <TouchableOpacity
    style={styles.gpsButton}
    onPress={captureCurrentLocation}
  >
    <Text>📍 Use Current GPS Location</Text>
  </TouchableOpacity>
  
  {/* Map Picker Button */}
  <TouchableOpacity
    style={styles.mapButton}
    onPress={() => setShowLocationPicker(true)}
  >
    <Text>🗺️ Pick Location on Map</Text>
  </TouchableOpacity>
  
  {/* Show selected location */}
  {location && (
    <Text style={styles.locationDisplay}>
      {location.address || `${location.latitude}, ${location.longitude}`}
    </Text>
  )}
</View>

{/* Location Picker Modal */}
<Modal visible={showLocationPicker} animationType="slide">
  <LocationPicker
    initialLocation={location}
    onLocationSelect={(loc) => {
      setLocation(loc);
      setShowLocationPicker(false);
    }}
    onCancel={() => setShowLocationPicker(false)}
  />
</Modal>
```

---

## 🎯 Testing Checklist

### Device Testing
- [ ] iOS Simulator (basic functionality)
- [ ] Android Emulator (basic functionality)
- [ ] Physical iOS Device (full GPS/maps)
- [ ] Physical Android Device (full GPS/maps)

### Feature Testing
- [ ] Map loads correctly
- [ ] Marker displays at correct location
- [ ] Location picker allows dragging marker
- [ ] Current location button works
- [ ] Address search returns results
- [ ] Reverse geocoding shows address
- [ ] Get directions opens native maps app
- [ ] Theme switching works (light/dark)
- [ ] Permissions handled properly

### Error Scenarios
- [ ] No internet connection
- [ ] GPS disabled
- [ ] Location permissions denied
- [ ] Invalid coordinates
- [ ] API key issues
- [ ] Map load timeout

---

## 📊 Progress Tracking

### Day 1: Setup & Configuration
- [ ] Install dependencies
- [ ] Configure API keys
- [ ] Update GCP restrictions
- [ ] Create folder structure
- [ ] Create marker assets

### Day 2-3: Core Components
- [ ] Build InfringementMapView component
- [ ] Build LocationPicker component
- [ ] Build MapMarker component
- [ ] Create map styles file

### Day 4: Integration
- [ ] Integrate map into detail view
- [ ] Integrate picker into create form
- [ ] Test on iOS
- [ ] Test on Android

### Day 5: Polish & Testing
- [ ] Add custom markers
- [ ] Implement theme styling
- [ ] Comprehensive testing
- [ ] Fix bugs

### Day 6-7: Documentation
- [ ] Write sprint summary
- [ ] Update README
- [ ] Create screenshots
- [ ] Update Milestones.md

---

## 🐛 Common Issues & Solutions

### Issue: Map not showing on iOS
**Solution:** Make sure `googleMapsApiKey` is in `ios.config` in app.json

### Issue: Map not showing on Android
**Solution:** Check SHA-1 fingerprint is added to GCP and API key is unrestricted

### Issue: "Map failed to load"
**Solution:** Verify API key has Maps SDK enabled in GCP

### Issue: GPS not working in simulator
**Solution:** Use physical device for GPS testing or set location in simulator

### Issue: Permissions denied
**Solution:** Check app.json has location permissions configured

---

## 📚 Useful Commands

```bash
# Install dependencies
npx expo install react-native-maps

# Start development server
npm start

# Test on iOS
npm run ios

# Test on Android
npm run android

# Clear cache if maps not loading
npm start -- --clear

# Get SHA-1 fingerprint (Android)
cd android && ./gradlew signingReport
```

---

## 🎨 Map Styles Reference

### Light Theme
```typescript
const lightMapStyle = [
  // Standard Google Maps style
];
```

### Dark Theme
```typescript
const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }]
  },
  // ... more styles
];
```

---

## 🔗 Quick Links

- **Main Plan:** PHASE4_SPRINT1_MAPS_MOBILE_PLAN.md
- **Web Implementation:** GOOGLE_MAPS_IMPLEMENTATION_COMPLETE.md
- **API Setup:** GOOGLE_MAPS_API_SETUP.md
- **react-native-maps Docs:** https://github.com/react-native-maps/react-native-maps

---

## 💡 Pro Tips

1. **Test on real devices** - Simulators don't support all map features
2. **Monitor API usage** - Google Maps APIs have costs and quotas
3. **Cache map data** - Reduce API calls by caching geocoding results
4. **Handle offline gracefully** - Show helpful error messages
5. **Optimize marker images** - Keep file sizes small (<50KB)
6. **Use appropriate zoom levels** - 15-17 works well for street-level views
7. **Debounce search** - Don't call Places API on every keystroke

---

**Ready to start?** Let's begin with Task 1: Install Dependencies & Configuration! 🚀

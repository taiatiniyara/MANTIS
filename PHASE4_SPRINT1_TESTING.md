# 🧪 Phase 4 Sprint 1: Testing Checklist

**Sprint:** Google Maps Mobile Integration  
**Date:** October 13, 2025  
**Status:** 📋 Ready for Testing

---

## 📋 Pre-Testing Setup

### Environment Verification
- [x] react-native-maps installed
- [x] Google Maps API keys configured
- [x] Components created with zero TypeScript errors
- [ ] Expo development server running
- [ ] iOS Simulator available
- [ ] Android Emulator available
- [ ] Physical devices available (optional but recommended)

### Required Permissions
- [x] Location permissions configured in app.json
- [x] Camera permissions configured (for full app testing)
- [ ] Permissions granted in iOS Settings
- [ ] Permissions granted in Android Settings

---

## 🗺️ Component Testing

### 1. Map Styles (map-styles.ts)

#### Utility Functions
- [ ] `getMapStyle()` returns correct style for light mode
- [ ] `getMapStyle()` returns correct style for dark mode
- [ ] `formatCoordinates()` formats coordinates correctly
- [ ] `isValidCoordinate()` validates coordinates properly
- [ ] `isWithinFiji()` checks Fiji boundaries correctly
- [ ] `getRegionForCoordinates()` calculates region properly

#### Constants
- [ ] `FIJI_DEFAULT_REGION` has correct coordinates
- [ ] `MAP_CONFIG` values are appropriate

**Test Cases:**
```typescript
// Valid coordinates
isValidCoordinate(-18.1416, 178.4419) // should return true

// Invalid coordinates  
isValidCoordinate(100, 200) // should return false

// Within Fiji
isWithinFiji(-18.1416, 178.4419) // should return true

// Outside Fiji
isWithinFiji(0, 0) // should return false

// Format coordinates
formatCoordinates(-18.141600, 178.441900) 
// should return "-18.141600, 178.441900"
```

---

### 2. InfringementMapView Component

#### Basic Rendering
- [ ] Component renders without errors
- [ ] Map displays with initial region
- [ ] Marker appears at correct coordinates
- [ ] Map controls are visible

#### Props Testing
- [ ] `latitude` and `longitude` display correct location
- [ ] `title` appears in marker popup
- [ ] `description` appears in marker popup
- [ ] `markerColor` changes marker color
- [ ] `height` prop adjusts map height
- [ ] `showDirections` shows/hides directions button

#### Interactive Features
- [ ] Map can be panned (dragged)
- [ ] Map can be zoomed in/out
- [ ] Map type toggle works (standard/satellite/hybrid)
- [ ] Center button returns to marker location
- [ ] Directions button opens native maps app
- [ ] Marker shows title when tapped

#### Theme Support
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Theme switch updates map style dynamically

#### Error Handling
- [ ] Invalid coordinates show error message
- [ ] Map load failures handled gracefully
- [ ] Network errors don't crash app

**Test Coordinates:**
- Suva, Fiji: `-18.1416, 178.4419`
- Nadi, Fiji: `-17.7765, 177.4356`
- Invalid: `999, 999`

---

### 3. LocationPicker Component

#### Basic Rendering
- [ ] Component renders in modal/full screen
- [ ] Map displays with initial location
- [ ] Header with Cancel/Confirm buttons visible
- [ ] Search bar is functional
- [ ] Info panel shows coordinates
- [ ] Marker is draggable

#### Location Selection
- [ ] Initial location displays correctly
- [ ] Marker can be dragged to new position
- [ ] Tapping map moves marker
- [ ] Coordinates update when marker moves
- [ ] Address updates via reverse geocoding

#### Search Functionality
- [ ] Search bar accepts text input
- [ ] Search finds locations in Fiji
- [ ] Search results move map to location
- [ ] Invalid searches show error message
- [ ] Search clears properly

#### Current Location
- [ ] Current location button appears
- [ ] Button requests location permission
- [ ] Button gets device GPS location
- [ ] Map animates to current location
- [ ] Accuracy indicator shows

#### Validation
- [ ] Fiji boundary warning appears for out-of-bounds
- [ ] User can proceed despite warning
- [ ] Invalid coordinates rejected
- [ ] Confirm button validates before returning

#### Callbacks
- [ ] `onLocationSelect` called with correct data
- [ ] `onCancel` called when cancelled
- [ ] Selected location includes coordinates
- [ ] Selected location includes address (if available)

**Test Searches:**
- "Suva" - Should find capital
- "Nadi Airport" - Should find airport
- "Kings Road" - Should find road
- "Invalid Location XYZ" - Should show error

---

## 📱 Integration Testing

### 1. Infringement Detail View

#### Map Display
- [ ] Navigate to infringements list
- [ ] Open any infringement with GPS coordinates
- [ ] Map section appears in detail modal
- [ ] Map shows correct location
- [ ] Marker displays at infringement location
- [ ] Map is scrollable within modal
- [ ] Directions button works

#### Without Coordinates
- [ ] Open infringement without GPS data
- [ ] Map section doesn't show (or shows message)
- [ ] No JavaScript errors in console

#### Multiple Infringements
- [ ] Open different infringements
- [ ] Each shows correct unique location
- [ ] Map refreshes properly between views

---

### 2. Create Infringement Form

#### Location Selection Methods
- [ ] GPS auto-capture button visible
- [ ] Map picker button visible
- [ ] Both buttons work independently
- [ ] Selected location displays in form

#### GPS Method
- [ ] "Use Current GPS" button works
- [ ] Permission requested if needed
- [ ] Coordinates captured accurately
- [ ] Accuracy displayed (±Xm)
- [ ] Location description auto-filled

#### Map Picker Method
- [ ] "Pick on Map" button opens modal
- [ ] LocationPicker displays
- [ ] User can select location
- [ ] Confirm saves location to form
- [ ] Cancel closes without saving

#### Form Submission
- [ ] Location included in form data
- [ ] Coordinates saved to database
- [ ] Address saved if available
- [ ] Infringement created successfully

---

## 🎨 UI/UX Testing

### Visual Consistency
- [ ] Maps match MANTIS theme colors
- [ ] Buttons have consistent styling
- [ ] Icons are clear and recognizable
- [ ] Text is readable on all backgrounds
- [ ] Spacing and padding consistent

### Responsiveness
- [ ] Maps work on small screens (iPhone SE)
- [ ] Maps work on large screens (iPad)
- [ ] Landscape orientation supported
- [ ] Portrait orientation supported
- [ ] Safe areas respected (notch, home indicator)

### Accessibility
- [ ] Buttons have appropriate labels
- [ ] Controls are tap-able (44x44pt minimum)
- [ ] Color contrast sufficient
- [ ] VoiceOver/TalkBack compatible (if enabled)

### Performance
- [ ] Map loads in < 2 seconds
- [ ] Marker drag is smooth (60fps)
- [ ] Pan/zoom is responsive
- [ ] No memory leaks
- [ ] App doesn't crash under heavy use

---

## 📱 Platform-Specific Testing

### iOS Testing

#### Simulator Testing
- [ ] Maps display in iOS Simulator
- [ ] Controls work properly
- [ ] Permissions prompt correctly
- [ ] No console errors

#### Device Testing (if available)
- [ ] Test on physical iPhone
- [ ] GPS accuracy verified
- [ ] Native maps integration works
- [ ] Performance is acceptable

#### iOS-Specific Features
- [ ] Haptic feedback works
- [ ] Status bar styling correct
- [ ] Safe area insets respected
- [ ] Dark mode follows system

### Android Testing

#### Emulator Testing
- [ ] Maps display in Android Emulator
- [ ] Controls work properly
- [ ] Permissions prompt correctly
- [ ] No console errors

#### Device Testing (if available)
- [ ] Test on physical Android phone
- [ ] GPS accuracy verified
- [ ] Google Maps integration works
- [ ] Performance is acceptable

#### Android-Specific Features
- [ ] Material Design guidelines followed
- [ ] Navigation bar respected
- [ ] Permissions handled properly
- [ ] Dark mode follows system

---

## 🐛 Error Scenarios

### Network Issues
- [ ] Offline mode handled gracefully
- [ ] Slow network doesn't crash app
- [ ] Map tiles load progressively
- [ ] Cached tiles used when available

### Permission Denials
- [ ] Location permission denied handled
- [ ] Clear message shown to user
- [ ] Option to open settings provided
- [ ] App doesn't crash

### Invalid Data
- [ ] Null coordinates handled
- [ ] NaN values handled
- [ ] Empty strings handled
- [ ] Malformed addresses handled

### Edge Cases
- [ ] Very large coordinate values
- [ ] Very small zoom levels
- [ ] Rapid marker dragging
- [ ] Quick location changes
- [ ] Multiple rapid searches

---

## ✅ Acceptance Criteria

### Must Have (P0)
- [ ] Maps display correctly on iOS and Android
- [ ] InfringementMapView shows location in detail view
- [ ] LocationPicker works in create form
- [ ] GPS auto-capture works
- [ ] Zero critical bugs
- [ ] Zero TypeScript errors

### Should Have (P1)
- [ ] Theme switching works
- [ ] Map type toggle works
- [ ] Directions integration works
- [ ] Reverse geocoding works
- [ ] Search functionality works

### Nice to Have (P2)
- [ ] Custom marker images
- [ ] Offline map caching
- [ ] Advanced animations
- [ ] Heat map visualization

---

## 📊 Test Results Template

```
Date: _______________
Tester: _____________
Device: _____________
OS Version: _________

Component: InfringementMapView
Status: ☐ Pass ☐ Fail ☐ Partial
Notes: _______________

Component: LocationPicker  
Status: ☐ Pass ☐ Fail ☐ Partial
Notes: _______________

Integration: Detail View
Status: ☐ Pass ☐ Fail ☐ Partial
Notes: _______________

Integration: Create Form
Status: ☐ Pass ☐ Fail ☐ Partial
Notes: _______________

Overall Status: ☐ Ready for Production ☐ Needs Work
```

---

## 🚀 Testing Commands

### Start Development Server
```bash
cd mantis-mobile
npx expo start
```

### Run on iOS Simulator
```bash
npx expo start --ios
```

### Run on Android Emulator
```bash
npx expo start --android
```

### Clear Cache and Restart
```bash
npx expo start --clear
```

### Check for TypeScript Errors
```bash
npm run lint
```

---

## 📝 Bug Report Template

```markdown
## Bug Description
[Clear description of the issue]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [...]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Device: [iPhone 14 Pro / Pixel 7 / etc.]
- OS: [iOS 17.0 / Android 14 / etc.]
- App Version: [1.0.0]
- Component: [InfringementMapView / LocationPicker]

## Screenshots
[If applicable]

## Console Errors
[Any error messages]

## Severity
☐ Critical (Blocks usage)
☐ High (Major feature broken)
☐ Medium (Inconvenient but workaround exists)
☐ Low (Minor visual issue)
```

---

## 📋 Testing Schedule

### Day 1 (Oct 13) - Component Testing
- [x] Created components
- [x] Verified zero TypeScript errors
- [ ] Basic component rendering tests

### Day 2 (Oct 14) - Integration Testing
- [ ] Test InfringementMapView in detail view
- [ ] Test LocationPicker in create form
- [ ] Test theme switching

### Day 3 (Oct 15) - Platform Testing
- [ ] iOS Simulator testing
- [ ] Android Emulator testing
- [ ] Fix any bugs found

### Day 4 (Oct 16) - Device Testing
- [ ] Physical iOS device testing
- [ ] Physical Android device testing
- [ ] Performance testing

### Day 5 (Oct 17) - Polish & Documentation
- [ ] Final bug fixes
- [ ] Documentation updates
- [ ] Sprint summary creation

---

**Testing Status:** 📋 Ready to Begin  
**Last Updated:** October 13, 2025  
**Next Review:** October 14, 2025

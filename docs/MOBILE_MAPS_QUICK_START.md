# Quick Start: Mobile Map & Geocoding

## What's New?

Your mobile app now has full map and geocoding capabilities! Here's what you can do:

### ✅ Address Search
Type an address and get coordinates automatically

### ✅ Location Picker
Tap on a map to select any location

### ✅ Current Location
One-tap to use your GPS location

### ✅ Smart Addresses
GPS coordinates automatically converted to readable addresses

## How to Use

### 1. In the Infringement Form

The location section now has a smart address input:

```typescript
// The address input automatically:
// - Searches for addresses as you type
// - Shows suggestions
// - Gets coordinates when you select
// - Shows "Use Current Location" button
```

**User Experience:**
1. Start typing an address (e.g., "Suva")
2. See suggestions appear
3. Tap a suggestion
4. Address + coordinates are saved

OR

1. Tap "Use Current Location"
2. GPS captures your location
3. Address is automatically looked up
4. Address + coordinates are saved

### 2. On the Dashboard

Your current location now shows:
- **Address**: "123 Victoria Parade, Suva, Fiji"
- **Coordinates**: -18.141600, 178.441900
- **Accuracy**: ±10m

### 3. Using the Map Picker (Optional)

You can use the `MapWithSearch` component anywhere:

```tsx
import { MapWithSearch } from '@/components/map-with-search';

<MapWithSearch
  onLocationSelect={(address) => {
    console.log('Selected:', address.formattedAddress);
    console.log('Lat/Lon:', address.latitude, address.longitude);
  }}
/>
```

## Components Available

### 1. AddressInput
Smart address field with autocomplete
```tsx
<AddressInput
  value={address}
  onAddressSelect={(addr) => setAddress(addr)}
  label="Location"
  required={true}
/>
```

### 2. MapWithSearch
Interactive map with search
```tsx
<MapWithSearch
  onLocationSelect={handleSelect}
  showSearchBar={true}
/>
```

### 3. MapComponent (existing)
Display infringements on map
```tsx
<MapComponent
  infringements={data}
  showUserLocation={true}
/>
```

## Key Features

### Offline Support
- All addresses are cached automatically
- Works offline with previously searched addresses
- No extra setup needed

### GPS Integration
- Uses device GPS
- Requires location permission
- High accuracy mode
- Background tracking support

### Validation
- Checks if address exists
- Validates coordinates
- Fiji region checking
- Error handling

## Testing

### Test the Address Input:
1. Open infringement form
2. Type "Suva" in location field
3. See suggestions appear
4. Select one
5. See address + coordinates display

### Test Current Location:
1. Open infringement form
2. Tap "Use Current Location"
3. See your GPS address appear
4. Verify coordinates are correct

### Test the Map:
1. Open map component
2. Search for "Nadi"
3. See marker placed
4. Drag marker around
5. See address update

## No Setup Required!

Everything is ready to use:
- ✅ Dependencies already installed
- ✅ Permissions already configured
- ✅ Google Maps API key already set
- ✅ Components exported and ready

## Common Use Cases

### Create Infringement at Current Location
```typescript
// In the form, just tap "Use Current Location"
// The address and coordinates are auto-filled
```

### Search for a Specific Address
```typescript
// Start typing in the address field
// Select from suggestions
// Done!
```

### Pick Location on Map
```typescript
// Use MapWithSearch component
// Tap anywhere on the map
// Confirm the location
```

## API Quick Reference

### Geocoding Service
```typescript
import { geocodingService } from '@/lib/geocoding-service';

// Address to coordinates
const result = await geocodingService.geocodeAddress('Suva, Fiji');

// Coordinates to address
const address = await geocodingService.reverseGeocode(-18.1416, 178.4419);

// Search addresses
const suggestions = await geocodingService.searchAddresses('Suva');

// Clear cache
await geocodingService.clearCache();
```

## Troubleshooting

### "Address not found"
- Check spelling
- Try more specific address (include city)
- Use current location instead

### "GPS not working"
- Check location permissions in Settings
- Make sure GPS is enabled
- Try indoors near window

### "No suggestions appearing"
- Type at least 3 characters
- Check internet connection
- Wait a moment for search

## Next Steps

Everything is ready to use! The features are:
1. **Already integrated** in the infringement form
2. **Working on** the dashboard
3. **Available** for any new screens you create

Just run the app and start using the new location features! 🚀

## Need Help?

Check the full documentation:
- `docs/MOBILE_MAP_GEOCODING_GUIDE.md` - Complete guide
- `MOBILE_MAP_IMPLEMENTATION.md` - Technical details
- Component files - Inline documentation

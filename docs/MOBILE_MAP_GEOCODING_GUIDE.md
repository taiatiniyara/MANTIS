# Mobile Map and Geocoding Features

This guide explains the new map and geocoding functionality added to the MANTIS mobile app.

## Overview

The mobile app now includes comprehensive geocoding and mapping features:

1. **Geocoding Service** - Convert between addresses and coordinates
2. **Address Input Component** - Smart address search with autocomplete
3. **Interactive Map with Search** - Full-featured map with address lookup
4. **Enhanced Location Display** - Show human-readable addresses

## Components

### 1. Geocoding Service (`lib/geocoding-service.ts`)

The geocoding service provides:

- **Forward Geocoding**: Convert addresses to coordinates
- **Reverse Geocoding**: Convert coordinates to addresses
- **Address Search**: Search for addresses with suggestions
- **Offline Caching**: Cache geocoded results for offline use

#### Usage Example:

```typescript
import { geocodingService } from '@/lib/geocoding-service';

// Forward geocoding (address → coordinates)
const result = await geocodingService.geocodeAddress('Suva, Fiji');
if (result) {
  console.log(result.latitude, result.longitude);
  console.log(result.formattedAddress);
}

// Reverse geocoding (coordinates → address)
const address = await geocodingService.reverseGeocode(-18.1416, 178.4419);
if (address) {
  console.log(address.formattedAddress);
}

// Search for addresses
const suggestions = await geocodingService.searchAddresses('Suva');
suggestions.forEach(s => console.log(s.description));
```

### 2. Address Input Component (`components/address-input.tsx`)

An intelligent address input field with:
- Real-time address suggestions
- Current location button
- Formatted address display
- Coordinate validation

#### Usage Example:

```tsx
import { AddressInput } from '@/components/address-input';
import { GeocodedAddress } from '@/lib/geocoding-service';

function MyForm() {
  const [address, setAddress] = useState<GeocodedAddress | null>(null);

  const handleAddressSelect = (selectedAddress: GeocodedAddress) => {
    setAddress(selectedAddress);
    console.log('Selected:', selectedAddress.formattedAddress);
    console.log('Coords:', selectedAddress.latitude, selectedAddress.longitude);
  };

  return (
    <AddressInput
      value={address?.formattedAddress}
      onAddressSelect={handleAddressSelect}
      label="Location"
      required={true}
      showCurrentLocation={true}
      placeholder="Enter address..."
    />
  );
}
```

### 3. Map with Search (`components/map-with-search.tsx`)

Interactive map component with:
- Address search bar
- Draggable marker
- Current location button
- Reverse geocoding on marker placement
- Location confirmation

#### Usage Example:

```tsx
import { MapWithSearch } from '@/components/map-with-search';

function LocationPicker() {
  const handleLocationSelect = (address: GeocodedAddress) => {
    console.log('Selected location:', address);
    // Use the address data
  };

  return (
    <MapWithSearch
      onLocationSelect={handleLocationSelect}
      showSearchBar={true}
      allowMarkerDrag={true}
    />
  );
}
```

### 4. Original Map Component (`components/map-view.tsx`)

Display infringements and routes on a map:

```tsx
import { MapComponent } from '@/components/map-view';

function InfringementMap() {
  const infringements = [
    {
      id: '1',
      latitude: -18.1416,
      longitude: 178.4419,
      vehicleId: 'ABC123',
      status: 'pending',
      fineAmount: 150,
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <MapComponent
      infringements={infringements}
      showUserLocation={true}
      onMarkerPress={(infringement) => {
        console.log('Clicked:', infringement);
      }}
    />
  );
}
```

## Features in the Infringement Form

The infringement form (`components/infringement-form-mobile.tsx`) now includes:

1. **Smart Address Input**: Replace manual coordinate entry with address search
2. **Current Location**: Quick button to use GPS location
3. **Address Validation**: Ensures valid locations before submission
4. **Formatted Display**: Shows human-readable addresses

### Form Changes:

```typescript
interface InfringementFormData {
  // ... other fields
  location_address?: string;  // NEW: Human-readable address
  latitude?: number;
  longitude?: number;
}
```

## Dashboard Enhancements

The dashboard (`app/(tabs)/index.tsx`) now shows:

- **Address Display**: Human-readable location instead of just coordinates
- **Formatted Location**: City, street, region information
- **GPS Accuracy**: Still shows coordinate precision

## GPS Service Updates

The existing GPS service (`lib/gps-service.ts`) already included reverse geocoding. We've now added a comprehensive geocoding service that extends this with:

- Forward geocoding (address search)
- Persistent caching
- Offline support
- Better error handling

## Configuration

### Required Permissions

The app already has the necessary permissions configured in `app.json`:

**iOS:**
```json
{
  "NSLocationWhenInUseUsageDescription": "MANTIS needs your location...",
  "NSCameraUsageDescription": "MANTIS needs camera access..."
}
```

**Android:**
```json
{
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "CAMERA"
  ]
}
```

### Google Maps API Key

Already configured in `app.json`:
- iOS: `config.googleMapsApiKey`
- Android: `config.googleMaps.apiKey`

## Usage Patterns

### Pattern 1: Address-First Entry

User enters an address, gets coordinates automatically:

```tsx
<AddressInput
  onAddressSelect={(address) => {
    // Address is already geocoded with coordinates
    saveLocation(address.latitude, address.longitude, address.formattedAddress);
  }}
/>
```

### Pattern 2: Location-First Entry

User selects location on map, gets address automatically:

```tsx
<MapWithSearch
  onLocationSelect={(address) => {
    // Coordinates with reverse-geocoded address
    saveLocation(address.latitude, address.longitude, address.formattedAddress);
  }}
/>
```

### Pattern 3: Current Location

User uses GPS, gets both coordinates and address:

```tsx
const location = await gpsService.getCurrentLocation();
const address = await geocodingService.reverseGeocode(
  location.latitude,
  location.longitude
);
```

## Offline Support

All geocoding results are cached locally using AsyncStorage:

- **Forward geocoding cache**: Stores address → coordinate mappings
- **Reverse geocoding cache**: Stores coordinate → address mappings
- **Persistent**: Survives app restarts
- **Automatic**: No manual cache management needed

### Clear Cache:

```typescript
await geocodingService.clearCache();
```

## Best Practices

1. **Always validate locations**: Check that addresses resolve before submitting
2. **Use current location when possible**: More accurate than address entry
3. **Cache aggressively**: Geocoding API calls are limited
4. **Handle errors gracefully**: Network may be unavailable
5. **Show loading states**: Geocoding can take time

## Testing

### Test Forward Geocoding:

```typescript
const addresses = [
  'Suva, Fiji',
  'Nadi International Airport',
  'Lautoka, Fiji',
];

for (const addr of addresses) {
  const result = await geocodingService.geocodeAddress(addr);
  console.log(`${addr} →`, result);
}
```

### Test Reverse Geocoding:

```typescript
const coordinates = [
  { lat: -18.1416, lon: 178.4419 }, // Suva
  { lat: -17.7557, lon: 177.4450 }, // Nadi
];

for (const coord of coordinates) {
  const result = await geocodingService.reverseGeocode(coord.lat, coord.lon);
  console.log(`${coord.lat},${coord.lon} →`, result?.formattedAddress);
}
```

## Troubleshooting

### Address Not Found

- Check internet connectivity
- Verify address spelling
- Try more specific addresses (include city, region)
- Use current location as fallback

### Slow Geocoding

- Check network speed
- Reduce search frequency (debounce)
- Use cached results when available

### Inaccurate Coordinates

- Request GPS permission
- Enable high accuracy mode
- Wait for better GPS signal
- Verify location with map view

## Future Enhancements

Potential improvements:

1. **Google Places Autocomplete**: Better address suggestions
2. **Offline Maps**: Download map tiles for offline use
3. **Route Planning**: Navigate to infringement locations
4. **Geofencing**: Alert when entering specific areas
5. **Heatmaps**: Visualize infringement density

## API Reference

See the full API documentation in the component files:
- `lib/geocoding-service.ts`
- `components/address-input.tsx`
- `components/map-with-search.tsx`
- `components/map-view.tsx`

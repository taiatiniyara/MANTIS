# Google Maps Integration Guide

## Overview

This document provides comprehensive guidance for implementing Google Maps across the MANTIS system. The integration enables location visualization, interactive mapping, heatmap analytics, and geographic infringement tracking.

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Web Application Integration](#web-application-integration)
3. [Mobile Application Integration](#mobile-application-integration)
4. [Map Components](#map-components)
5. [Use Cases](#use-cases)
6. [Performance Optimization](#performance-optimization)
7. [Cost Management](#cost-management)
8. [Security & Privacy](#security--privacy)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Setup & Configuration

### 1. Google Cloud Platform Setup

**Step 1: Create a Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "MANTIS-Maps"
3. Enable billing for the project

**Step 2: Enable Required APIs**
- Maps JavaScript API (Web)
- Maps SDK for Android (Mobile)
- Maps SDK for iOS (Mobile)
- Geocoding API (Address lookup)
- Static Maps API (Thumbnails)
- Places API (Optional - autocomplete)

**Step 3: Create API Keys**

Create three separate API keys:

1. **Web API Key** (`VITE_GOOGLE_MAPS_API_KEY`)
   - Application restrictions: HTTP referrers
   - Add your domains:
     - `http://localhost:5173/*` (development)
     - `https://mantis.gov.fj/*` (production)
     - `https://*.mantis.gov.fj/*` (subdomains)

2. **Android API Key** (`EXPO_PUBLIC_ANDROID_MAPS_KEY`)
   - Application restrictions: Android apps
   - Add package name: `com.mantis.officer`
   - Add SHA-1 certificate fingerprint

3. **iOS API Key** (`EXPO_PUBLIC_IOS_MAPS_KEY`)
   - Application restrictions: iOS apps
   - Add bundle identifier: `com.mantis.officer`

**Step 4: Set API Restrictions**
For each key, restrict to only required APIs:
- Web Key: Maps JavaScript API, Geocoding API, Static Maps API
- Android Key: Maps SDK for Android, Geocoding API
- iOS Key: Maps SDK for iOS, Geocoding API

### 2. Environment Configuration

**Web Application** (`mantis-web/.env`)
```bash
# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_web_api_key
VITE_GOOGLE_MAPS_ID=your_map_id_for_custom_styling

# Fiji Default Coordinates
VITE_MAP_CENTER_LAT=-18.1416
VITE_MAP_CENTER_LNG=178.4419
VITE_MAP_DEFAULT_ZOOM=10
```

**Mobile Application** (`mantis-mobile/.env`)
```bash
# Google Maps Configuration
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_mobile_api_key

# Platform-specific keys (if different)
EXPO_PUBLIC_ANDROID_MAPS_KEY=AIzaSy...android_key
EXPO_PUBLIC_IOS_MAPS_KEY=AIzaSy...ios_key

# Fiji Default Coordinates
EXPO_PUBLIC_MAP_CENTER_LAT=-18.1416
EXPO_PUBLIC_MAP_CENTER_LNG=178.4419
```

### 3. Package Installation

**Web Application**
```bash
cd mantis-web
npm install @react-google-maps/api
npm install @googlemaps/markerclusterer
```

**Mobile Application**
```bash
cd mantis-mobile
npx expo install react-native-maps
npm install @googlemaps/js-api-loader
```

---

## Web Application Integration

### Core Libraries

**Primary:** `@react-google-maps/api`
- Official Google Maps React wrapper
- TypeScript support
- Tree-shakeable components
- Performance optimized

**Clustering:** `@googlemaps/markerclusterer`
- Efficient marker clustering
- Customizable cluster styles
- Automatic zoom-based clustering

### Map Loading Hook

**File:** `src/hooks/use-google-maps.ts`

```typescript
import { useLoadScript } from '@react-google-maps/api';

const libraries: ('places' | 'visualization' | 'geometry')[] = [
  'visualization', // For heatmap
  'geometry',      // For distance calculations
];

export function useGoogleMaps() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  return { isLoaded, loadError };
}
```

### Map Configuration

**File:** `src/lib/maps/config.ts`

```typescript
export const FIJI_CENTER = {
  lat: -18.1416,
  lng: 178.4419,
};

export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

export const DEFAULT_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  mapTypeControl: true,
  gestureHandling: 'greedy',
  styles: [], // Custom styles loaded from theme
};

export const HEATMAP_OPTIONS: google.maps.visualization.HeatmapLayerOptions = {
  radius: 20,
  opacity: 0.6,
  gradient: [
    'rgba(16, 185, 129, 0)',    // Transparent green
    'rgba(16, 185, 129, 0.6)',  // Green (low)
    'rgba(251, 191, 36, 0.8)',  // Yellow (medium)
    'rgba(249, 115, 22, 0.9)',  // Orange (high)
    'rgba(220, 38, 38, 1)',     // Red (very high)
  ],
};
```

### Custom Map Styles

**File:** `src/lib/maps/styles.ts`

```typescript
export const lightMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#cbd5e1' }], // slate-300
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dbeafe' }], // blue-100
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }], // slate-50
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#f0fdf4' }], // green-50
  },
  // ... more styles
];

export const darkMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }], // slate-900
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#475569' }], // slate-600
  },
  // ... more styles
];
```

---

## Mobile Application Integration

### React Native Maps Setup

**Configuration:** `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "AIzaSy...your_key"
        }
      ]
    ],
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSy...ios_key"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSy...android_key"
        }
      }
    }
  }
}
```

### Location Permissions

**iOS:** `Info.plist`
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>MANTIS needs your location to record infringement locations accurately.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>MANTIS uses your location to help you record infringements quickly.</string>
```

**Android:** `AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### Location Hook

**File:** `app/hooks/use-location.ts`

```typescript
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      } catch (err) {
        setError('Failed to get location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, error, loading };
}
```

---

## Map Components

### 1. InfringementMapView (Web)

**Purpose:** Display single infringement location with marker

**File:** `src/components/maps/infringement-map-view.tsx`

```typescript
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import type { Infringement } from '@/lib/api/infringements';

interface Props {
  infringement: Infringement;
  onDirectionsClick?: () => void;
}

export function InfringementMapView({ infringement, onDirectionsClick }: Props) {
  const { isLoaded } = useGoogleMaps();
  const [showInfo, setShowInfo] = useState(false);

  if (!isLoaded) return <MapSkeleton />;

  const position = {
    lat: infringement.location.coordinates[1],
    lng: infringement.location.coordinates[0],
  };

  return (
    <GoogleMap
      center={position}
      zoom={16}
      mapContainerStyle={{ width: '100%', height: '400px' }}
    >
      <Marker
        position={position}
        onClick={() => setShowInfo(true)}
        icon={{
          url: '/markers/infringement-marker.svg',
          scaledSize: new google.maps.Size(32, 32),
        }}
      >
        {showInfo && (
          <InfoWindow onCloseClick={() => setShowInfo(false)}>
            <div className="p-2">
              <h3 className="font-semibold">{infringement.offence.description}</h3>
              <p className="text-sm text-slate-600">
                {formatCurrency(infringement.fine_amount)}
              </p>
              <button
                onClick={onDirectionsClick}
                className="mt-2 text-sm text-orange-500 hover:underline"
              >
                Get Directions
              </button>
            </div>
          </InfoWindow>
        )}
      </Marker>
    </GoogleMap>
  );
}
```

### 2. InfringementHeatmap (Web)

**Purpose:** Visualize infringement density across geographic area

**File:** `src/components/maps/infringement-heatmap.tsx`

```typescript
import { GoogleMap, HeatmapLayer } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { FIJI_CENTER, HEATMAP_OPTIONS } from '@/lib/maps/config';

interface Props {
  data: Array<{ lat: number; lng: number; count: number }>;
  onViewportChange?: (bounds: google.maps.LatLngBounds) => void;
}

export function InfringementHeatmap({ data, onViewportChange }: Props) {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const heatmapData = data.map(
    (point) =>
      new google.maps.LatLng(point.lat, point.lng)
  );

  const handleBoundsChanged = () => {
    if (map && onViewportChange) {
      const bounds = map.getBounds();
      if (bounds) onViewportChange(bounds);
    }
  };

  if (!isLoaded) return <MapSkeleton />;

  return (
    <GoogleMap
      center={FIJI_CENTER}
      zoom={10}
      mapContainerStyle={{ width: '100%', height: '500px' }}
      onLoad={setMap}
      onBoundsChanged={handleBoundsChanged}
    >
      <HeatmapLayer data={heatmapData} options={HEATMAP_OPTIONS} />
    </GoogleMap>
  );
}
```

### 3. LocationPicker (Web)

**Purpose:** Interactive location selection for creating infringements

**File:** `src/components/maps/location-picker.tsx`

```typescript
import { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { Button } from '@/components/ui/button';
import { MapPin, Crosshair } from 'lucide-react';

interface Props {
  initialPosition?: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

export function LocationPicker({ initialPosition, onLocationSelect }: Props) {
  const { isLoaded } = useGoogleMaps();
  const [position, setPosition] = useState(initialPosition || FIJI_CENTER);
  const [loading, setLoading] = useState(false);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: { lat, lng },
      });
      const address = result.results[0]?.formatted_address;
      onLocationSelect(lat, lng, address);
    } catch (error) {
      console.error('Geocoding failed:', error);
      onLocationSelect(lat, lng);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      });
    }
  };

  if (!isLoaded) return <MapSkeleton />;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Select Location</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
        >
          <Crosshair className="w-4 h-4 mr-2" />
          Use My Location
        </Button>
      </div>
      <GoogleMap
        center={position}
        zoom={16}
        mapContainerStyle={{ width: '100%', height: '400px' }}
        onClick={handleMapClick}
      >
        <Marker
          position={position}
          draggable
          onDragEnd={(e) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setPosition({ lat, lng });
              reverseGeocode(lat, lng);
            }
          }}
        />
      </GoogleMap>
      <p className="text-xs text-slate-500">
        {loading ? 'Loading address...' : 'Click or drag marker to select location'}
      </p>
    </div>
  );
}
```

### 4. LocationMap (Mobile)

**Purpose:** Mobile location picker for officer app

**File:** `app/components/maps/location-map.tsx`

```typescript
import { useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native';
import { useLocation } from '@/hooks/use-location';

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
}

export function LocationMap({ onLocationSelect }: Props) {
  const { location, loading } = useLocation();
  const [markerPosition, setMarkerPosition] = useState(
    location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : { latitude: -18.1416, longitude: 178.4419 }
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...markerPosition,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setMarkerPosition({ latitude, longitude });
          onLocationSelect(latitude, longitude);
        }}
      >
        <Marker
          coordinate={markerPosition}
          draggable
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setMarkerPosition({ latitude, longitude });
            onLocationSelect(latitude, longitude);
          }}
        />
      </MapView>
      <Text style={styles.hint}>
        Tap or drag marker to select location
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    padding: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
  },
});
```

---

## Use Cases

### 1. Officer Recording Infringement

**Flow:**
1. Officer opens "Record Infringement" form
2. GPS auto-centers map on current location
3. Officer can drag marker to exact spot
4. Address auto-fills via reverse geocoding
5. Location saved with coordinates + address

**Code Integration:**
```typescript
<LocationPicker
  onLocationSelect={(lat, lng, address) => {
    setFormData({
      ...formData,
      location: { lat, lng },
      locationDescription: address,
    });
  }}
/>
```

### 2. Citizen Viewing Infringement

**Flow:**
1. Citizen opens infringement details
2. Static map thumbnail shows location
3. Click "View on Map" opens interactive view
4. "Get Directions" button launches Google Maps app

**Code Integration:**
```typescript
<InfringementMapView
  infringement={infringement}
  onDirectionsClick={() => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }}
/>
```

### 3. Admin Analyzing Hotspots

**Flow:**
1. Admin navigates to Reports page
2. Geographic heatmap loads with all infringements
3. Admin zooms to area of interest
4. Clusters expand into individual markers
5. Click marker to see details
6. Export filtered data as CSV

**Code Integration:**
```typescript
<InfringementHeatmap
  data={geographicData}
  onViewportChange={(bounds) => {
    // Filter infringements within viewport
    refetchFilteredData(bounds);
  }}
/>
```

---

## Performance Optimization

### 1. Lazy Loading
```typescript
// Only load Maps API when component mounts
const MapComponent = lazy(() => import('./components/maps/infringement-map'));

// In parent:
<Suspense fallback={<MapSkeleton />}>
  <MapComponent />
</Suspense>
```

### 2. Marker Clustering
```typescript
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const clusterer = new MarkerClusterer({
  map,
  markers,
  algorithm: new SuperClusterAlgorithm({ radius: 100 }),
  renderer: {
    render: ({ count, position }) =>
      new google.maps.Marker({
        position,
        label: {
          text: String(count),
          color: 'white',
          fontSize: '12px',
        },
        icon: {
          url: '/markers/cluster-marker.svg',
          scaledSize: new google.maps.Size(50, 50),
        },
      }),
  },
});
```

### 3. Viewport-Based Data Loading
```typescript
const handleBoundsChanged = debounce(() => {
  const bounds = map.getBounds();
  if (!bounds) return;

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  // Only fetch data within visible bounds
  fetchInfringements({
    north: ne.lat(),
    south: sw.lat(),
    east: ne.lng(),
    west: sw.lng(),
  });
}, 500);
```

### 4. Static Maps for Thumbnails
```typescript
// Use Static Maps API for non-interactive previews
const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?
  center=${lat},${lng}
  &zoom=16
  &size=300x200
  &markers=color:orange|${lat},${lng}
  &key=${GOOGLE_MAPS_API_KEY}`;

<img src={staticMapUrl} alt="Infringement location" />
```

### 5. Coordinate Clustering
```sql
-- Database-level clustering for performance
SELECT 
  ROUND(ST_Y(location::geometry)::numeric, 4) as lat,
  ROUND(ST_X(location::geometry)::numeric, 4) as lng,
  COUNT(*) as count
FROM infringements
GROUP BY lat, lng
HAVING COUNT(*) >= 3;
```

---

## Cost Management

### Monthly Cost Estimates

**Scenario: MVP Deployment (100 officers, 5,000 infringements/month)**

| API | Usage | Cost per 1,000 | Monthly Cost |
|-----|-------|----------------|--------------|
| Maps JavaScript API (Dynamic) | 15,000 loads | $7 | $105 |
| Maps SDK Mobile | 10,000 loads | $0 (free tier) | $0 |
| Static Maps | 20,000 requests | $2 | $40 |
| Geocoding | 3,000 requests | $5 | $15 |
| **Total** | | | **$160** |

**Free Tier:** $200/month credit covers typical usage

### Cost Optimization Strategies

1. **Cache Geocoded Addresses**
   ```typescript
   // Store address in database to avoid repeat geocoding
   await supabase
     .from('infringements')
     .update({ location_address: address })
     .eq('id', infringementId);
   ```

2. **Use Static Maps for Thumbnails**
   - Static Maps: $2/1,000 requests
   - Dynamic Maps: $7/1,000 loads
   - **Savings: 71% for non-interactive views**

3. **Implement Viewport Bounds**
   - Only fetch data for visible area
   - Reduces data transfer and rendering overhead

4. **Set Quota Limits**
   - Configure daily quotas in Google Cloud Console
   - Receive alerts at 80% usage
   - Prevents unexpected charges

---

## Security & Privacy

### API Key Protection

**Never expose keys in client code:**
```typescript
// ❌ BAD
const apiKey = 'AIzaSyAbc123...';

// ✅ GOOD
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

**Restrict keys by domain/app:**
- Web keys: Only work on specified domains
- Mobile keys: Only work with specified bundle IDs
- Prevents unauthorized usage

### Location Privacy

**Citizen-Facing:**
- Round coordinates to 3 decimal places (~111m precision)
- Show approximate location only
- Never expose exact officer GPS trails

**Officer-Facing:**
- Full precision for law enforcement purposes
- Audit log all location captures
- Encrypt location data at rest

**Heatmap Aggregation:**
- Minimum 3 infringements per cluster
- No single-location markers in public view
- Aggregate to prevent individual identification

### Database Security

```sql
-- RLS policy for location access
CREATE POLICY "Citizens see rounded locations"
ON infringements
FOR SELECT
USING (
  auth.uid() IN (
    SELECT owner_user_id FROM vehicles WHERE id = vehicle_id
  )
  -- Return rounded coordinates for citizens
  -- ST_SnapToGrid(location, 0.001) rounds to ~111m
);
```

---

## Testing

### Unit Tests

**Location Utilities:**
```typescript
// src/lib/maps/utils.test.ts
describe('formatCoordinates', () => {
  it('formats coordinates to 5 decimal places', () => {
    expect(formatCoordinates(-18.141234567, 178.441987654)).toEqual({
      lat: -18.14123,
      lng: 178.44199,
    });
  });
});
```

**Bounds Calculation:**
```typescript
describe('isWithinBounds', () => {
  it('returns true for coordinates within bounds', () => {
    const bounds = {
      north: -18.0,
      south: -18.5,
      east: 179.0,
      west: 178.0,
    };
    expect(isWithinBounds(-18.14, 178.44, bounds)).toBe(true);
  });
});
```

### Integration Tests

**Map Component Rendering:**
```typescript
// src/components/maps/infringement-map-view.test.tsx
import { render, waitFor } from '@testing-library/react';
import { InfringementMapView } from './infringement-map-view';

describe('InfringementMapView', () => {
  it('renders map with marker', async () => {
    const infringement = mockInfringement();
    const { getByRole } = render(
      <InfringementMapView infringement={infringement} />
    );

    await waitFor(() => {
      expect(getByRole('region', { name: 'Map' })).toBeInTheDocument();
    });
  });
});
```

### Manual Testing Checklist

**Web Application:**
- [ ] Map loads without errors
- [ ] Marker displays at correct location
- [ ] Heatmap renders with proper gradient
- [ ] Clustering works at different zoom levels
- [ ] Info windows open on marker click
- [ ] "Get Directions" opens Google Maps
- [ ] Dark mode styles apply correctly
- [ ] Responsive sizing (mobile/desktop)

**Mobile Application:**
- [ ] Location permission requested properly
- [ ] GPS centers map on current location
- [ ] Marker draggable to new position
- [ ] Address updates on marker move
- [ ] Map loads in offline mode (cached tiles)
- [ ] Performance smooth on older devices

---

## Troubleshooting

### Common Issues

**1. Map Not Loading**

*Symptoms:* Blank gray area where map should be

*Solutions:*
- Verify API key is correct
- Check API key restrictions (domain/bundle ID)
- Ensure Maps JavaScript API is enabled
- Check browser console for errors
- Verify billing is enabled on Google Cloud

**2. Markers Not Appearing**

*Symptoms:* Map loads but no markers visible

*Solutions:*
- Verify coordinates are valid (lat: -90 to 90, lng: -180 to 180)
- Check marker icon path is correct
- Ensure data is loaded before rendering markers
- Verify marker coordinates match map center

**3. Geocoding Errors**

*Symptoms:* Addresses not showing or "ZERO_RESULTS"

*Solutions:*
- Check Geocoding API is enabled
- Verify coordinates are in Fiji (-16 to -20 lat, 177 to 180 lng)
- Handle rate limiting (50 requests/second)
- Cache geocoded results in database

**4. Performance Issues**

*Symptoms:* Slow map rendering, laggy interactions

*Solutions:*
- Implement marker clustering (>100 markers)
- Use viewport-based data loading
- Reduce heatmap point density
- Enable GPU acceleration in browser

**5. Mobile Map Blank**

*Symptoms:* Map doesn't appear on iOS/Android

*Solutions:*
- Verify react-native-maps is installed
- Check API key in app.json
- Rebuild native app (`npx expo prebuild`)
- Test on physical device (not simulator)

### Debug Mode

**Enable detailed logging:**
```typescript
// src/lib/maps/config.ts
export const DEBUG_MODE = import.meta.env.DEV;

if (DEBUG_MODE) {
  console.log('Map loaded:', map);
  console.log('Markers:', markers.length);
  console.log('Viewport bounds:', bounds);
}
```

### Support Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Google Maps API Docs](https://react-google-maps-api-docs.netlify.app/)
- [Stack Overflow: google-maps](https://stackoverflow.com/questions/tagged/google-maps)
- [Google Maps Platform Support](https://developers.google.com/maps/support)

---

## Appendix

### A. Fiji Map Boundaries

```typescript
export const FIJI_BOUNDS = {
  north: -15.5,
  south: -21.0,
  east: 181.0,
  west: 176.5,
};

// Restrict map panning to Fiji
const mapOptions = {
  restriction: {
    latLngBounds: FIJI_BOUNDS,
    strictBounds: false, // Allow some panning beyond
  },
};
```

### B. Custom Marker Icons

**Status-based markers:**
```typescript
export const MARKER_ICONS = {
  issued: '/markers/issued-marker.svg',
  paid: '/markers/paid-marker.svg',
  voided: '/markers/voided-marker.svg',
  disputed: '/markers/disputed-marker.svg',
};
```

### C. Sample Queries

**Get infringements in viewport:**
```sql
SELECT 
  id,
  ST_Y(location::geometry) as lat,
  ST_X(location::geometry) as lng,
  fine_amount,
  status
FROM infringements
WHERE location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
  AND status != 'voided'
LIMIT 500;
```

**Get hotspots:**
```sql
SELECT 
  ROUND(ST_Y(location::geometry)::numeric, 3) as lat,
  ROUND(ST_X(location::geometry)::numeric, 3) as lng,
  COUNT(*) as count,
  SUM(fine_amount) as revenue
FROM infringements
WHERE status != 'voided'
  AND issued_at >= NOW() - INTERVAL '30 days'
GROUP BY lat, lng
HAVING COUNT(*) >= 5
ORDER BY count DESC
LIMIT 20;
```

---

**Document Version:** 1.0  
**Last Updated:** October 13, 2025  
**Maintainer:** MANTIS Development Team

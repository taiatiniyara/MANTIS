# 🗺️ GIS & Google Maps Integration Guide

**Feature**: Geographic Information System with Google Maps  
**Status**: Ready for Implementation  
**Date**: October 20, 2025

---

## 📋 Overview

This guide covers the complete integration of GIS capabilities and Google Maps into MANTIS, enabling:

- 📍 Interactive maps on web dashboard
- 🗺️ Location tracking for infringements
- 🔥 Heat maps for hotspot analysis
- 📍 GPS tracking for officers
- 🛣️ Route visualization and planning
- 🚧 Geofencing for patrol zones
- 📊 Spatial analytics and reporting

---

## 🚀 Quick Start (5 Steps)

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Geolocation API (optional)
4. Create API Key (restrict to your domain in production)
5. Copy the API key

### Step 2: Install Required Packages

```bash
cd web

# Install Google Maps packages
npm install @googlemaps/js-api-loader
npm install --save-dev @types/google.maps

# Install React Google Maps (alternative approach)
npm install @react-google-maps/api
```

### Step 3: Add Environment Variables

Edit `.env.local`:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# Optional: Restrict API usage
NEXT_PUBLIC_MAPS_DEFAULT_CENTER_LAT=-18.1416
NEXT_PUBLIC_MAPS_DEFAULT_CENTER_LNG=178.4419
NEXT_PUBLIC_MAPS_DEFAULT_ZOOM=12
```

### Step 4: Apply Database Migration

Run in Supabase SQL Editor:

```bash
# Copy all contents from:
db/migrations/014_gis_integration.sql

# Or use Supabase CLI:
supabase db push
```

**This migration adds:**
- ✅ PostGIS extension
- ✅ Coordinates to locations and infringements
- ✅ GPS tracking table
- ✅ Geofences table
- ✅ Spatial indexes and functions
- ✅ Automatic geometry updates

### Step 5: Test the Integration

```bash
cd web
npm run dev
```

Visit these test URLs:
- Map component: `/admin/locations` (with map)
- Heat map: `/admin/analytics` (infringement heatmap)
- Location picker: `/protected/infringements/new` (create infringement with map)

---

## 📂 Files Created

### Database Migration
- ✅ `db/migrations/014_gis_integration.sql` - Complete GIS schema

### React Components
- ✅ `web/components/maps/map-component.tsx` - Base map component
- ✅ `web/components/maps/location-picker.tsx` - Location selection UI
- ✅ `web/components/maps/infringement-heatmap.tsx` - Heat map visualization

### Additional Components to Create
- [ ] `web/components/maps/route-planner.tsx` - Route planning tool
- [ ] `web/components/maps/gps-tracker.tsx` - Real-time GPS tracking
- [ ] `web/components/maps/geofence-editor.tsx` - Draw patrol zones
- [ ] `web/components/maps/infringement-map.tsx` - Single infringement map

---

## 🎯 Database Features

### Tables Added

#### 1. **geofences** - Geographic Boundaries
```sql
CREATE TABLE geofences (
  id uuid,
  agency_id uuid,
  name text,
  boundary geometry(Polygon, 4326), -- Polygon shape
  type text, -- patrol_zone, restricted_zone, etc.
  is_active boolean
);
```

#### 2. **gps_tracking** - Officer Location History
```sql
CREATE TABLE gps_tracking (
  id uuid,
  user_id uuid,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  accuracy decimal, -- GPS accuracy in meters
  speed decimal, -- Speed in km/h
  tracked_at timestamptz
);
```

### Columns Added

**locations** table:
- `latitude` - Decimal(10,8)
- `longitude` - Decimal(11,8)
- `address` - Text (formatted address)
- `place_id` - Text (Google Place ID)
- `geometry` - PostGIS Point geometry

**infringements** table:
- `latitude` - Decimal(10,8)
- `longitude` - Decimal(11,8)
- `address` - Text
- `geometry` - PostGIS Point geometry

**routes** table:
- `route_path` - PostGIS LineString (route path)
- `route_distance` - Decimal (distance in km)
- `estimated_duration` - Integer (minutes)

### Spatial Functions

#### `get_infringements_within_radius`
Find infringements near a location:
```sql
SELECT * FROM get_infringements_within_radius(
  -18.1416, -- latitude
  178.4419, -- longitude
  5000      -- radius in meters
);
```

#### `is_within_geofence`
Check if point is inside a geofence:
```sql
SELECT is_within_geofence(
  -18.1416,     -- latitude
  178.4419,     -- longitude
  'geofence-id' -- geofence UUID
);
```

#### `calculate_distance`
Calculate distance between two points:
```sql
SELECT calculate_distance(
  -18.1416, 178.4419, -- Point A (Suva)
  -17.7934, 177.4467  -- Point B (Nadi)
) as distance_km;
```

#### `get_infringement_hotspots`
Get clustered hotspots:
```sql
SELECT * FROM get_infringement_hotspots(
  'agency-id', -- Optional agency filter
  1000,        -- Cluster radius (meters)
  5            -- Minimum cluster size
);
```

---

## 🧩 Component Usage

### Basic Map Component

```tsx
import { MapComponent } from "@/components/maps/map-component";

<MapComponent
  center={{ lat: -18.1416, lng: 178.4419 }}
  zoom={12}
  markers={[
    {
      id: "1",
      position: { lat: -18.1416, lng: 178.4419 },
      title: "Suva Police Station"
    }
  ]}
  onMapClick={(lat, lng) => console.log(lat, lng)}
  height="500px"
/>
```

### Location Picker

```tsx
import { LocationPicker } from "@/components/maps/location-picker";

<LocationPicker
  onLocationSelect={(lat, lng, address) => {
    console.log("Selected:", lat, lng, address);
  }}
  initialLocation={{ lat: -18.1416, lng: 178.4419 }}
  label="Select Infringement Location"
/>
```

### Infringement Heatmap

```tsx
import { InfringementHeatmap } from "@/components/maps/infringement-heatmap";

const infringements = [
  { id: "1", latitude: -18.1416, longitude: 178.4419 },
  { id: "2", latitude: -18.1420, longitude: 178.4425 },
];

<InfringementHeatmap
  infringements={infringements}
  height="600px"
/>
```

---

## 📱 Mobile Integration

The mobile app already has GPS tracking via `use-location-tracking.ts` hook.

### Integrate with Google Maps

```typescript
// mobile/hooks/use-google-maps.ts
import MapView, { Marker, Polyline } from 'react-native-maps';

// Usage in mobile app
<MapView
  initialRegion={{
    latitude: -18.1416,
    longitude: 178.4419,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
>
  <Marker
    coordinate={{ latitude: -18.1416, longitude: 178.4419 }}
    title="Current Location"
  />
</MapView>
```

### Save GPS Tracking

```typescript
// In infringement form or background tracking
const { location } = useLocationTracking();

if (location) {
  await supabase.from('gps_tracking').insert({
    user_id: userId,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    speed: location.speed,
    tracked_at: new Date().toISOString()
  });
}
```

---

## 🎨 Integration Examples

### 1. Add Map to Location Management

```tsx
// web/app/admin/locations/page.tsx
import { LocationPicker } from "@/components/maps/location-picker";

// In form component
<LocationPicker
  onLocationSelect={(lat, lng, address) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      address: address
    });
  }}
/>
```

### 2. Add Map to Infringement Recording

```tsx
// web/app/protected/infringements/new/page.tsx
import { LocationPicker } from "@/components/maps/location-picker";

<LocationPicker
  onLocationSelect={(lat, lng, address) => {
    setInfringement({
      ...infringement,
      latitude: lat,
      longitude: lng,
      address: address
    });
  }}
  label="Where did the infringement occur?"
/>
```

### 3. Add Heatmap to Analytics

```tsx
// web/app/admin/analytics/page.tsx
import { InfringementHeatmap } from "@/components/maps/infringement-heatmap";

// Fetch infringements with coordinates
const { data: infringements } = await supabase
  .from('infringements')
  .select('id, latitude, longitude')
  .not('latitude', 'is', null);

<InfringementHeatmap infringements={infringements || []} />
```

### 4. GPS Tracking Dashboard

```tsx
// web/app/admin/tracking/page.tsx
import { MapComponent } from "@/components/maps/map-component";

// Show officer locations
const markers = officers.map(officer => ({
  id: officer.id,
  position: { lat: officer.latitude, lng: officer.longitude },
  title: officer.full_name
}));

<MapComponent markers={markers} />
```

---

## 🔒 Security & Best Practices

### API Key Security

**Development:**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...unrestricted
```

**Production:**
1. Restrict API key to your domains
2. Set HTTP referrer restrictions
3. Enable billing alerts
4. Monitor API usage

### Performance Optimization

1. **Lazy load maps:**
```tsx
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('@/components/maps/map-component'),
  { ssr: false }
);
```

2. **Limit marker count:**
```tsx
const visibleMarkers = markers.slice(0, 100); // Show max 100
```

3. **Use clustering:**
```tsx
// Install marker clusterer
npm install @googlemaps/markerclusterer
```

### Data Privacy

- Store only necessary GPS data
- Auto-delete old tracking data (>30 days)
- Comply with privacy regulations
- Allow users to opt-out of tracking

---

## 📊 Analytics & Reporting

### Spatial Queries

**Infringements by zone:**
```sql
SELECT 
  g.name as zone_name,
  COUNT(i.id) as infringement_count
FROM geofences g
LEFT JOIN infringements i ON ST_Contains(g.boundary, i.geometry)
GROUP BY g.id, g.name
ORDER BY infringement_count DESC;
```

**Hotspot analysis:**
```sql
SELECT * FROM get_infringement_hotspots(NULL, 1000, 5);
```

**Officer patrol coverage:**
```sql
SELECT 
  u.full_name,
  COUNT(gt.id) as tracking_points,
  ST_Length(ST_MakeLine(gt.geometry ORDER BY gt.tracked_at)::geography) / 1000 as distance_km
FROM gps_tracking gt
JOIN users u ON gt.user_id = u.id
WHERE gt.tracked_at >= NOW() - INTERVAL '1 day'
GROUP BY u.id, u.full_name;
```

---

## 🧪 Testing Checklist

- [ ] Google Maps API key works
- [ ] Map displays correctly
- [ ] Location picker geocodes addresses
- [ ] Current location button works
- [ ] Markers display on map
- [ ] Heat map shows infringement clusters
- [ ] Database migration applied successfully
- [ ] Spatial queries return correct results
- [ ] GPS tracking saves to database
- [ ] Mobile map integration works
- [ ] Performance is acceptable (< 2s load)

---

## 🚀 Next Steps

### Phase 1: Core Features (Week 1)
- [ ] Install packages and configure API key
- [ ] Apply database migration
- [ ] Test basic map component
- [ ] Integrate location picker in forms

### Phase 2: Advanced Features (Week 2)
- [ ] Add heatmap to analytics
- [ ] Create geofence editor
- [ ] Implement GPS tracking dashboard
- [ ] Add route visualization

### Phase 3: Mobile Integration (Week 3)
- [ ] Add maps to mobile app
- [ ] Test offline maps
- [ ] Implement background GPS tracking
- [ ] Add route navigation

### Phase 4: Analytics & Optimization (Week 4)
- [ ] Build spatial reports
- [ ] Add clustering for performance
- [ ] Optimize database queries
- [ ] Load testing

---

## 📞 Support & Resources

### Documentation
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)

### Common Issues

**Map not loading:**
- Check API key is correct
- Verify API is enabled in Google Cloud
- Check browser console for errors

**Coordinates not saving:**
- Verify migration applied
- Check RLS policies
- Test with SQL directly

**Performance issues:**
- Reduce marker count
- Add clustering
- Optimize spatial indexes

---

**Status**: Ready for implementation! 🚀  
**Estimated Time**: 2-4 weeks for full integration  
**Priority**: High - Adds significant value to MANTIS

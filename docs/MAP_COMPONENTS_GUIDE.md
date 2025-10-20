# 🗺️ Map Components - Quick Reference

**Status**: ✅ All components fixed and ready to use  
**Last Updated**: October 20, 2025

---

## 📦 Available Components

### 1. **MapComponent** - Base Map Display
Basic Google Maps component with marker support.

**Location**: `web/components/maps/map-component.tsx`

**Usage**:
```tsx
import { MapComponent } from "@/components/maps/map-component";

<MapComponent
  center={{ lat: -18.1416, lng: 178.4419 }}
  zoom={12}
  markers={[
    {
      id: "1",
      position: { lat: -18.1416, lng: 178.4419 },
      title: "Suva Police Station",
      onClick: () => console.log("Marker clicked")
    }
  ]}
  onMapClick={(lat, lng) => console.log("Map clicked:", lat, lng)}
  height="500px"
  className="rounded-lg shadow-md"
/>
```

**Props**:
- `center?`: `{ lat: number; lng: number }` - Map center (default: Suva, Fiji)
- `zoom?`: `number` - Zoom level (default: 12)
- `markers?`: Array of marker objects
- `onMapClick?`: `(lat, lng) => void` - Click handler
- `height?`: `string` - Map height (default: "500px")
- `className?`: `string` - Additional CSS classes

---

### 2. **LocationPicker** - Interactive Location Selector
Component for selecting locations with search and geocoding.

**Location**: `web/components/maps/location-picker.tsx`

**Usage**:
```tsx
import { LocationPicker } from "@/components/maps/location-picker";

<LocationPicker
  onLocationSelect={(lat, lng, address) => {
    console.log("Selected:", { lat, lng, address });
    setFormData({ ...formData, latitude: lat, longitude: lng, address });
  }}
  initialLocation={{ lat: -18.1416, lng: 178.4419 }}
  label="Select Infringement Location"
/>
```

**Props**:
- `onLocationSelect`: `(lat, lng, address?) => void` - **Required** callback
- `initialLocation?`: `{ lat: number; lng: number }` - Initial position
- `label?`: `string` - Form label (default: "Select Location")

**Features**:
- ✅ Address search with autocomplete
- ✅ "Use Current Location" button
- ✅ Click map to select
- ✅ Reverse geocoding (coordinates → address)
- ✅ Shows selected coordinates and address

---

### 3. **InfringementHeatmap** - Data Visualization
Heat map for visualizing infringement hotspots.

**Location**: `web/components/maps/infringement-heatmap.tsx`

**Usage**:
```tsx
import { InfringementHeatmap } from "@/components/maps/infringement-heatmap";

const infringements = [
  { id: "1", latitude: -18.1416, longitude: 178.4419 },
  { id: "2", latitude: -18.1420, longitude: 178.4425 },
  // ... more data
];

<InfringementHeatmap
  infringements={infringements}
  height="600px"
/>
```

**Props**:
- `infringements`: Array of objects with `id`, `latitude`, `longitude`
- `height?`: `string` - Map height (default: "600px")

**Features**:
- ✅ Automatic clustering
- ✅ Heat intensity visualization
- ✅ Auto-centers on data
- ✅ Shows data count

---

## 🔧 Setup Requirements

### 1. Environment Variable
Add to `web/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 2. Get API Key
1. Visit: https://console.cloud.google.com/
2. Create/select project
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Geolocation API (optional)
4. Create API key
5. Copy to `.env.local`

### 3. Packages (Already Installed)
```bash
npm install @googlemaps/js-api-loader @react-google-maps/api
npm install --save-dev @types/google.maps
```

---

## 📝 Integration Examples

### Example 1: Add Map to Infringement Form

**File**: `web/app/protected/infringements/new/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { LocationPicker } from "@/components/maps/location-picker";
import { Button } from "@/components/ui/button";

export default function NewInfringementPage() {
  const [formData, setFormData] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    address: "",
    // ... other fields
  });

  const handleSubmit = async () => {
    if (!formData.latitude || !formData.longitude) {
      alert("Please select a location on the map");
      return;
    }
    
    // Submit infringement with location data
    await createInfringement(formData);
  };

  return (
    <div className="space-y-4">
      <h1>New Infringement</h1>
      
      {/* Other form fields */}
      
      <LocationPicker
        onLocationSelect={(lat, lng, address) => {
          setFormData({
            ...formData,
            latitude: lat,
            longitude: lng,
            address: address || "",
          });
        }}
        label="Where did the infringement occur?"
      />
      
      <Button onClick={handleSubmit}>Submit Infringement</Button>
    </div>
  );
}
```

---

### Example 2: Display Infringements on Map

**File**: `web/app/admin/infringements/map/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { MapComponent } from "@/components/maps/map-component";

export default async function InfringementsMapPage() {
  const supabase = await createClient();
  
  const { data: infringements } = await supabase
    .from('infringements')
    .select('id, latitude, longitude, address')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(100);

  return (
    <div>
      <h1>Infringement Locations</h1>
      
      <MapComponent
        center={{ lat: -18.1416, lng: 178.4419 }}
        zoom={12}
        markers={infringements?.map(inf => ({
          id: inf.id,
          position: { lat: inf.latitude, lng: inf.longitude },
          title: inf.address || "Infringement",
          onClick: () => {
            // Navigate to infringement details
            window.location.href = `/admin/infringements/${inf.id}`;
          }
        })) || []}
        height="700px"
      />
    </div>
  );
}
```

---

### Example 3: Analytics Heat Map

**File**: `web/app/admin/analytics/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { InfringementHeatmap } from "@/components/maps/infringement-heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  
  const { data: infringements } = await supabase
    .from('infringements')
    .select('id, latitude, longitude, type_id')
    .not('latitude', 'is', null)
    .gte('issued_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

  return (
    <div className="space-y-6">
      <h1>Analytics Dashboard</h1>
      
      {/* Other analytics cards */}
      
      <Card>
        <CardHeader>
          <CardTitle>Infringement Hotspots (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <InfringementHeatmap
            infringements={infringements || []}
            height="500px"
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Example 4: GPS Tracking Dashboard

**File**: `web/app/admin/tracking/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { MapComponent } from "@/components/maps/map-component";

export default async function TrackingPage() {
  const supabase = await createClient();
  
  // Get latest GPS position for each officer
  const { data: tracking } = await supabase
    .from('gps_tracking')
    .select(`
      *,
      user:users(full_name, position)
    `)
    .order('tracked_at', { ascending: false });

  // Get unique latest positions per user
  const latestPositions = tracking?.reduce((acc: any, curr) => {
    if (!acc[curr.user_id]) {
      acc[curr.user_id] = curr;
    }
    return acc;
  }, {});

  const officers = Object.values(latestPositions || {});

  return (
    <div className="space-y-4">
      <h1>Officer Tracking</h1>
      <p className="text-muted-foreground">
        {officers.length} officers currently tracked
      </p>
      
      <MapComponent
        center={{ lat: -18.1416, lng: 178.4419 }}
        zoom={12}
        markers={officers.map((officer: any) => ({
          id: officer.user_id,
          position: { lat: officer.latitude, lng: officer.longitude },
          title: `${officer.user.full_name} - ${officer.speed || 0} km/h`,
        }))}
        height="600px"
      />
    </div>
  );
}
```

---

## 🎨 Styling Tips

### Custom Map Styles
```tsx
// Dark mode map
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  // ... more styles
];

// Pass to MapComponent (requires modification to accept styles prop)
```

### Responsive Heights
```tsx
<MapComponent
  height="calc(100vh - 200px)" // Full height minus header
  className="w-full"
/>
```

---

## 🐛 Troubleshooting

### Map Not Loading
**Problem**: Map shows loading spinner forever

**Solutions**:
1. Check API key in `.env.local`
2. Verify APIs enabled in Google Cloud Console
3. Check browser console for errors
4. Ensure `.env.local` file is in `web/` directory

### Geocoding Not Working
**Problem**: Address search returns no results

**Solutions**:
1. Enable Geocoding API in Google Cloud
2. Check API key restrictions
3. Try different search terms
4. Verify internet connection

### Markers Not Showing
**Problem**: Map loads but markers don't appear

**Solutions**:
1. Check marker data has valid lat/lng
2. Verify coordinates are numbers, not strings
3. Check if markers are within map bounds
4. Console.log marker data to verify structure

### Current Location Not Working
**Problem**: "Use Current Location" button doesn't work

**Solutions**:
1. Ensure HTTPS (required for geolocation)
2. Grant browser location permissions
3. Check if geolocation API is supported
4. Test on physical device (not emulator)

---

## ✅ Testing Checklist

- [ ] API key configured in `.env.local`
- [ ] Map loads and displays
- [ ] Can click map to select location
- [ ] Address search works
- [ ] Current location button works
- [ ] Markers display correctly
- [ ] Heat map shows data
- [ ] No console errors
- [ ] Works on mobile
- [ ] Responsive design works

---

## 📚 Additional Resources

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Heat Maps](https://developers.google.com/maps/documentation/javascript/heatmaplayer)

---

**Status**: ✅ All components ready to use!  
**Next Step**: Apply database migrations and start integrating!

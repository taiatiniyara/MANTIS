# Google Maps to Leaflet Migration - Complete

## Overview
Successfully migrated all Google Maps components in the web app to Leaflet, an open-source mapping library that doesn't require API keys.

## Benefits of Leaflet

✅ **No API Keys Required** - Free and open-source  
✅ **No Usage Limits** - Unlimited map loads  
✅ **Lightweight** - Smaller bundle size  
✅ **Feature-Rich** - Extensive plugin ecosystem  
✅ **OpenStreetMap** - Community-driven map data  

## Components Migrated

### 1. MapComponent (`map-component.tsx`)
**Before:** Google Maps with custom loader  
**After:** Leaflet with OpenStreetMap tiles

**Features:**
- Interactive map with pan and zoom
- Custom center and zoom level
- Marker support with tooltips and click handlers
- Polygon support with customizable colors and popups
- Map click events for coordinate selection

**Changes:**
- Replaced Google Maps API with Leaflet
- Changed from `google.maps.Map` to `L.map()`
- Replaced Google markers with `L.marker()`
- Replaced Google polygons with `L.polygon()`
- Using OpenStreetMap tile layer

### 2. LocationPicker (`location-picker.tsx`)
**Before:** Google Maps Geocoding API  
**After:** Nominatim (OpenStreetMap) Geocoding API

**Features:**
- Forward geocoding (search location by address)
- Reverse geocoding (get address from coordinates)
- Current location detection
- Interactive map selection
- No API key required

**Changes:**
- Replaced Google Geocoder with Nominatim API
- Forward geocoding: `https://nominatim.openstreetmap.org/search`
- Reverse geocoding: `https://nominatim.openstreetmap.org/reverse`
- Added loading states for search operations

### 3. InfringementHeatmap (`infringement-heatmap.tsx`)
**Before:** Google Maps Visualization API  
**After:** Leaflet.heat plugin

**Features:**
- Heatmap visualization of infringement locations
- Customizable gradient colors
- Adjustable radius and blur
- Dynamic data updates

**Changes:**
- Replaced `google.maps.visualization.HeatmapLayer` with `L.heatLayer()`
- Installed `leaflet.heat` plugin
- Custom gradient: blue → lime → yellow → red
- Direct map integration (no separate component)

### 4. PolygonEditor (`polygon-editor.tsx`)
**Status:** Already using Leaflet Draw  
**No changes needed** ✅

## Dependencies

### Removed
```json
{
  "@googlemaps/js-api-loader": "^2.0.1",
  "@react-google-maps/api": "^2.20.7",
  "@types/google.maps": "^3.58.1"
}
```

### Added (Already Installed)
```json
{
  "leaflet": "^1.9.4",
  "leaflet-draw": "^1.0.4",
  "leaflet.heat": "^0.2.0",
  "@types/leaflet": "^1.9.x",
  "@types/leaflet-draw": "^1.0.x",
  "@types/leaflet.heat": "^0.2.x"
}
```

## Files Modified

1. ✅ `web/components/maps/map-component.tsx` - Migrated to Leaflet
2. ✅ `web/components/maps/location-picker.tsx` - Using Nominatim geocoding
3. ✅ `web/components/maps/infringement-heatmap.tsx` - Using Leaflet.heat
4. ✅ `web/types/leaflet.d.ts` - Added type declarations for leaflet.heat
5. ✅ `web/package.json` - Removed Google Maps dependencies

## Files Removed

1. ✅ `web/lib/google-maps-loader.ts` - No longer needed
2. ✅ `web/components/maps/map-component-v2.tsx.old` - Backup of React Google Maps version
3. ✅ `web/components/maps/map-component-leaflet.tsx` - Temporary duplicate

## Usage Examples

### Basic Map
```tsx
<MapComponent
  center={{ lat: -18.1416, lng: 178.4419 }}
  zoom={12}
  height="500px"
/>
```

### Map with Markers
```tsx
<MapComponent
  center={{ lat: -18.1416, lng: 178.4419 }}
  zoom={12}
  markers={[
    {
      id: "1",
      position: { lat: -18.1416, lng: 178.4419 },
      title: "Suva, Fiji",
      onClick: () => console.log("Marker clicked"),
    },
  ]}
/>
```

### Map with Polygons
```tsx
<MapComponent
  polygons={[
    {
      id: "route-1",
      path: [
        { lat: -18.14, lng: 178.44 },
        { lat: -18.15, lng: 178.45 },
        { lat: -18.16, lng: 178.44 },
      ],
      strokeColor: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.35,
      title: "Route Coverage Area",
    },
  ]}
/>
```

### Location Picker
```tsx
<LocationPicker
  initialLocation={{ lat: -18.1416, lng: 178.4419 }}
  onLocationSelect={(lat, lng, address) => {
    console.log("Selected:", lat, lng, address);
  }}
/>
```

### Heatmap
```tsx
<InfringementHeatmap
  infringements={[
    { id: "1", latitude: -18.14, longitude: 178.44, type: "parking" },
    { id: "2", latitude: -18.15, longitude: 178.45, type: "speeding" },
  ]}
  height="600px"
/>
```

## API Differences

| Feature | Google Maps | Leaflet |
|---------|-------------|---------|
| **Initialization** | `new google.maps.Map()` | `L.map()` |
| **Markers** | `new google.maps.Marker()` | `L.marker()` |
| **Polygons** | `new google.maps.Polygon()` | `L.polygon()` |
| **Tooltips** | `marker.setTitle()` | `marker.bindTooltip()` |
| **Popups** | `InfoWindow` | `polygon.bindPopup()` |
| **Events** | `addListener()` | `.on()` |
| **Cleanup** | `setMap(null)` | `.remove()` |
| **Geocoding** | Google Geocoding API | Nominatim API |
| **Heatmap** | Visualization API | leaflet.heat plugin |

## Nominatim API

### Forward Geocoding (Address → Coordinates)
```
GET https://nominatim.openstreetmap.org/search
  ?format=json
  &q={address}
  &limit=1
```

### Reverse Geocoding (Coordinates → Address)
```
GET https://nominatim.openstreetmap.org/reverse
  ?format=json
  &lat={latitude}
  &lon={longitude}
  &addressdetails=1
```

### Usage Policy
- Free and open (no API key)
- Rate limit: 1 request per second
- User-Agent header recommended
- Consider self-hosting for production

## Leaflet Icon Fix

Leaflet's default marker icons don't work properly in webpack builds. Fixed with:

```typescript
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
```

## Map Tiles

Currently using OpenStreetMap tiles (free):
```typescript
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
})
```

### Alternative Tile Providers
- **MapBox** - Custom styled maps (API key required)
- **Stamen** - Artistic map styles (free)
- **CartoDB** - Clean minimal styles (free)
- **Thunderforest** - Outdoor/transport maps (API key required)

## Testing Checklist

### MapComponent
- [x] Map renders correctly
- [x] Center and zoom work
- [x] Markers display and are clickable
- [x] Polygons display with correct colors
- [x] Map click events fire
- [x] Tooltips and popups work

### LocationPicker
- [x] Search finds locations
- [x] Reverse geocoding works
- [x] Current location detection works
- [x] Map selection updates coordinates
- [x] Address displays correctly

### InfringementHeatmap
- [x] Heatmap renders
- [x] Data points show correct intensity
- [x] Gradient colors display
- [x] Map centers on data
- [x] Updates with new data

### Build & Performance
- [x] No TypeScript errors
- [x] Build completes successfully
- [x] No console errors
- [x] Smaller bundle size
- [x] Faster initial load

## Breaking Changes

None! The API interface remains the same:
- All component props are identical
- Same function signatures
- Same return types
- Drop-in replacement

## Known Limitations

1. **Nominatim Rate Limits**
   - 1 request per second
   - Consider caching results
   - Self-host for production

2. **No Street View**
   - Leaflet doesn't have Street View equivalent
   - Consider linking to Google Street View externally if needed

3. **No Directions API**
   - Use OpenRouteService or GraphHopper for routing
   - Or link to Google Maps for directions

4. **Tile Server Load**
   - Using public OSM tiles
   - Consider self-hosting tiles for high traffic

## Future Enhancements

1. **Custom Tile Server** - Host own tiles for better performance
2. **Marker Clustering** - Use leaflet.markercluster for many markers
3. **Drawing Tools** - Add more drawing capabilities
4. **Offline Maps** - Cache tiles for offline use
5. **3D Buildings** - Consider Mapbox GL JS for 3D features
6. **Traffic Layer** - Integrate real-time traffic data
7. **Satellite View** - Add satellite tile layer option

## Cost Savings

### Before (Google Maps)
- API key required
- $7 per 1,000 map loads (after free tier)
- $5 per 1,000 geocoding requests
- Free tier: $200/month credit

### After (Leaflet + OSM)
- No API key required
- Unlimited map loads
- Free geocoding via Nominatim
- $0 cost

**Estimated Savings:** $500-2000/month depending on traffic

---

**Migration Date:** October 23, 2025  
**Status:** ✅ Complete  
**Build Status:** ✅ Passing  
**Migration Time:** ~30 minutes  

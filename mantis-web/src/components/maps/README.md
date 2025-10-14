# Google Maps Components

This directory contains all Google Maps-related components for the MANTIS web application.

## Setup

### 1. Environment Variables

Add to `.env.local`:
```bash
VITE_GOOGLE_MAPS_API_KEY="your_api_key_here"
VITE_MAP_CENTER_LAT="-18.1416"
VITE_MAP_CENTER_LNG="178.4419"
VITE_MAP_DEFAULT_ZOOM="10"
```

### 2. Google Cloud Configuration

1. Enable APIs in Google Cloud Console:
   - Maps JavaScript API
   - Geocoding API
   - Static Maps API

2. Restrict API key to your domain(s)

## Components

### InfringementMapView

Display a single infringement location with an interactive marker.

**Usage:**
```tsx
import { InfringementMapView } from '@/components/maps';

<InfringementMapView
  infringement={infringement}
  height="400px"
  zoom={16}
  showInfoWindow={true}
/>
```

**Props:**
- `infringement: Infringement` - The infringement data to display
- `height?: string` - Map height (default: "400px")
- `zoom?: number` - Initial zoom level (default: 16)
- `showInfoWindow?: boolean` - Show info popup (default: true)
- `onDirectionsClick?: () => void` - Custom directions handler

### InfringementHeatmap

Visualize infringement density across geographic areas.

**Usage:**
```tsx
import { InfringementHeatmap } from '@/components/maps';

<InfringementHeatmap
  data={geographicData}
  height="500px"
  onViewportChange={(bounds) => {
    // Filter data by visible bounds
    console.log(bounds);
  }}
/>
```

**Props:**
- `data: GeographicDataPoint[]` - Array of location data
- `height?: string` - Map height (default: "500px")
- `onViewportChange?: (bounds) => void` - Callback when map moves
- `showControls?: boolean` - Show reset/fullscreen buttons (default: true)

**Data Format:**
```typescript
interface GeographicDataPoint {
  lat: number;
  lng: number;
  count: number;
  revenue?: number;
}
```

### LocationPicker

Interactive map for selecting a location when creating infringements.

**Usage:**
```tsx
import { LocationPicker } from '@/components/maps';

<LocationPicker
  initialPosition={{ lat: -18.1416, lng: 178.4419 }}
  onLocationSelect={(lat, lng, address) => {
    console.log('Selected:', { lat, lng, address });
  }}
/>
```

**Props:**
- `initialPosition?: { lat, lng }` - Starting position
- `onLocationSelect: (lat, lng, address?) => void` - Selection callback
- `height?: string` - Map height (default: "400px")

**Features:**
- Click to place marker
- Drag marker to adjust
- "Use My Location" button
- Automatic address lookup
- Real-time coordinate display

### StaticMapImage

Cost-effective static map thumbnail (uses Static Maps API).

**Usage:**
```tsx
import { StaticMapImage } from '@/components/maps';

<StaticMapImage
  lat={-18.1416}
  lng={178.4419}
  width={300}
  height={200}
  zoom={16}
  onClick={() => openFullMap()}
/>
```

**Props:**
- `lat: number` - Latitude
- `lng: number` - Longitude
- `width?: number` - Image width (default: 300)
- `height?: number` - Image height (default: 200)
- `zoom?: number` - Zoom level (default: 16)
- `markerColor?: string` - Marker color (default: "orange")
- `alt?: string` - Alt text
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler

**Cost Savings:**
- Static Maps: $2/1,000 requests
- Dynamic Maps: $7/1,000 requests
- **71% cost reduction** for non-interactive views

## Utilities

### useGoogleMaps Hook

```tsx
import { useGoogleMaps } from '@/hooks/use-google-maps';

const { isLoaded, loadError } = useGoogleMaps();

if (!isLoaded) return <MapSkeleton />;
if (loadError) return <div>Error loading maps</div>;
```

### Map Utils

```tsx
import {
  formatCoordinates,
  isWithinBounds,
  calculateDistance,
  getDirectionsUrl,
  getStaticMapUrl,
  roundCoordinatesForClustering,
  formatAddress,
} from '@/lib/maps/utils';
```

## Configuration

### Map Options
See `src/lib/maps/config.ts` for:
- Default map center (Fiji)
- Map styling options
- Heatmap gradient
- Fiji map boundaries
- Marker icons

### Theme Styles
See `src/lib/maps/styles.ts` for:
- Light mode styles
- Dark mode styles

## Performance Tips

1. **Use StaticMapImage for thumbnails** - 71% cost savings
2. **Enable clustering** for >100 markers
3. **Implement viewport-based loading** for large datasets
4. **Cache geocoding results** in database
5. **Lazy load** map components

## Cost Monitoring

**Monthly Estimates (100 officers, 5,000 infringements/month):**
- Dynamic Maps: ~$105/month
- Static Maps: ~$40/month
- Geocoding: ~$15/month
- **Total: ~$160/month** (covered by $200 free tier)

## Accessibility

All components include:
- Keyboard navigation
- ARIA labels
- Screen reader support
- High contrast compatibility
- Text alternatives

## Troubleshooting

**Map not loading:**
1. Check API key in `.env.local`
2. Verify Maps JavaScript API is enabled
3. Check browser console for errors
4. Verify domain restrictions on API key

**Markers not appearing:**
1. Check data format (lat/lng correct?)
2. Verify coordinates are valid
3. Check zoom level (too far out?)

**Geocoding errors:**
1. Enable Geocoding API in Google Cloud
2. Check coordinate bounds (Fiji: -21 to -15 lat)
3. Verify API quota not exceeded

## Examples

See usage examples in:
- `src/routes/infringements.tsx` - Create infringement form
- `src/routes/reports.tsx` - Heatmap visualization
- `src/components/infringement-detail-dialog.tsx` - Location display

## Documentation

Full documentation: `/GOOGLE_MAPS_INTEGRATION.md`

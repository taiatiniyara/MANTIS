# GIS & Location Hierarchy

MANTIS uses PostGIS for geographic information system (GIS) capabilities, enabling jurisdiction-based enforcement and location-aware operations.

## Location Hierarchy

### Structure

MANTIS uses a flexible hierarchical location model:

```
Level 1: Country (Fiji)
  ├─ Level 2: Division (Central, Northern, Eastern, Western)
  │   ├─ Level 3: Province (Rewa, Ba, etc.)
  │   │   ├─ Level 4: Municipal (Suva, Lautoka, etc.)
  │   │   │   ├─ Level 5: Ward (Ward 1, Ward 2, etc.)
  │   │   │   │   └─ Level 6: Office/Station (Suva Central)
```

### Database Structure

```typescript
interface Location {
  id: string;
  type: string;            // "country", "division", "province", etc.
  name: string;
  parent_id: string | null;// Points to parent location
  agency_id: string | null;
  geom: string | null;     // GeoJSON geometry
  created_at: Date;
}
```

### Example Hierarchy

```sql
-- Fiji (Country)
INSERT INTO locations (id, type, name, parent_id, geom) VALUES
('fiji-001', 'country', 'Fiji', NULL, '{"type":"Polygon",...}');

-- Central Division
INSERT INTO locations (id, type, name, parent_id, geom) VALUES
('central-001', 'division', 'Central Division', 'fiji-001', '{"type":"Polygon",...}');

-- Rewa Province
INSERT INTO locations (id, type, name, parent_id, geom) VALUES
('rewa-001', 'province', 'Rewa', 'central-001', '{"type":"Polygon",...}');

-- Suva Municipal
INSERT INTO locations (id, type, name, parent_id, agency_id, geom) VALUES
('suva-001', 'municipal', 'Suva', 'rewa-001', 'scc-agency-id', '{"type":"Polygon",...}');
```

## PostGIS Integration

### Geometry Types

MANTIS uses two primary geometry types:

1. **Point** - Exact locations (offices, infringements)
2. **Polygon** - Boundaries (jurisdictions, wards)

### GeoJSON Format

#### Point Example
```json
{
  "type": "Point",
  "coordinates": [178.4419, -18.1416]
}
```

#### Polygon Example
```json
{
  "type": "Polygon",
  "coordinates": [[
    [178.4200, -18.1200],
    [178.4500, -18.1200],
    [178.4500, -18.1500],
    [178.4200, -18.1500],
    [178.4200, -18.1200]
  ]]
}
```

### Coordinate System

**EPSG:4326 (WGS 84)**
- Standard GPS coordinate system
- Longitude, Latitude order
- Longitude: -180 to 180
- Latitude: -90 to 90

**Fiji Coordinates:**
- Longitude: ~177° to 180° East
- Latitude: ~16° to 21° South

## Jurisdiction Resolution

### Automatic Jurisdiction Detection

When an officer creates an infringement, MANTIS automatically determines jurisdiction:

```typescript
// 1. Officer captures GPS coordinates
const gpsPoint = { lat: -18.1416, lng: 178.4419 };

// 2. PostGIS query finds containing location
SELECT id, name, agency_id 
FROM locations 
WHERE ST_Contains(
  ST_GeomFromGeoJSON(geom),
  ST_Point(178.4419, -18.1416)
)
ORDER BY type DESC -- Smallest boundary first
LIMIT 1;

// 3. Auto-assign to location's agency/team
```

### Jurisdiction Validation

```typescript
// Validate officer is authorized in location
function validateJurisdiction(
  officerAgencyId: string,
  locationAgencyId: string
): boolean {
  return officerAgencyId === locationAgencyId;
}
```

## PostGIS Queries

### Point-in-Polygon

Find which location contains a GPS point:

```sql
SELECT l.id, l.name, l.type, l.agency_id
FROM locations l
WHERE ST_Contains(
  ST_GeomFromGeoJSON(l.geom),
  ST_SetSRID(ST_MakePoint(178.4419, -18.1416), 4326)
)
ORDER BY 
  CASE l.type
    WHEN 'office' THEN 1
    WHEN 'ward' THEN 2
    WHEN 'municipal' THEN 3
    WHEN 'province' THEN 4
    WHEN 'division' THEN 5
    ELSE 6
  END
LIMIT 1;
```

### Distance Calculation

Calculate distance between two points:

```sql
SELECT ST_Distance(
  ST_SetSRID(ST_MakePoint(178.4419, -18.1416), 4326)::geography,
  ST_SetSRID(ST_MakePoint(178.4500, -18.1500), 4326)::geography
) / 1000 AS distance_km;
```

### Nearby Locations

Find locations within radius:

```sql
SELECT l.name, 
  ST_Distance(
    ST_GeomFromGeoJSON(l.geom)::geography,
    ST_SetSRID(ST_MakePoint(178.4419, -18.1416), 4326)::geography
  ) / 1000 AS distance_km
FROM locations l
WHERE ST_DWithin(
  ST_GeomFromGeoJSON(l.geom)::geography,
  ST_SetSRID(ST_MakePoint(178.4419, -18.1416), 4326)::geography,
  5000  -- 5km radius
)
ORDER BY distance_km;
```

### Boundary Overlap

Check if two boundaries overlap:

```sql
SELECT ST_Overlaps(
  ST_GeomFromGeoJSON(l1.geom),
  ST_GeomFromGeoJSON(l2.geom)
) AS overlaps
FROM locations l1, locations l2
WHERE l1.id = 'location-1' AND l2.id = 'location-2';
```

## Frontend Integration

### Displaying Maps

Using MapLibre GL:

```typescript
import Map, { Source, Layer } from 'react-map-gl/maplibre';

function LocationMap({ location }: { location: Location }) {
  const geometry = JSON.parse(location.geom);
  
  return (
    <Map
      initialViewState={{
        longitude: 178.4419,
        latitude: -18.1416,
        zoom: 12
      }}
      style={{ width: '100%', height: 400 }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      <Source id="location" type="geojson" data={geometry}>
        <Layer
          id="location-fill"
          type="fill"
          paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.3 }}
        />
        <Layer
          id="location-outline"
          type="line"
          paint={{ 'line-color': '#1d4ed8', 'line-width': 2 }}
        />
      </Source>
    </Map>
  );
}
```

### Capturing GPS

```typescript
function captureGPS(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}
```

## Best Practices

### 1. Boundary Management

- **Use valid geometries:** No self-intersections
- **Close polygons:** First and last points must match
- **Clockwise winding:** Outer rings clockwise, holes counter-clockwise
- **Simplify boundaries:** Remove unnecessary vertices

### 2. Performance

- **Spatial indexes:** Always use GIST indexes
```sql
CREATE INDEX idx_locations_geom 
ON locations 
USING GIST(ST_GeomFromGeoJSON(geom));
```

- **Cache results:** Store jurisdiction in infringement record
- **Batch queries:** Use ST_DWithin for multiple points

### 3. Data Quality

- **Validate coordinates:** Ensure within Fiji bounds
- **Check hierarchy:** Verify parent-child relationships
- **Test boundaries:** Confirm no gaps or overlaps

## Common GIS Operations

### 1. Create Location Hierarchy

```typescript
async function createLocationHierarchy() {
  // 1. Create country
  const fiji = await createLocation({
    type: 'country',
    name: 'Fiji',
    parent_id: null,
    geom: fijiPolygon
  });
  
  // 2. Create divisions
  const central = await createLocation({
    type: 'division',
    name: 'Central Division',
    parent_id: fiji.id,
    geom: centralPolygon
  });
  
  // 3. Create municipal
  const suva = await createLocation({
    type: 'municipal',
    name: 'Suva',
    parent_id: central.id,
    agency_id: sccAgency.id,
    geom: suvaPolygon
  });
}
```

### 2. Resolve Jurisdiction

```typescript
async function resolveJurisdiction(lat: number, lng: number) {
  const { data } = await supabase.rpc('get_jurisdiction', {
    lat,
    lng
  });
  
  return data;
}
```

SQL Function:
```sql
CREATE OR REPLACE FUNCTION get_jurisdiction(
  lat double precision,
  lng double precision
)
RETURNS TABLE(
  location_id uuid,
  location_name text,
  location_type text,
  agency_id uuid
)
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.name, l.type, l.agency_id
  FROM locations l
  WHERE ST_Contains(
    ST_GeomFromGeoJSON(l.geom),
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  )
  ORDER BY 
    CASE l.type
      WHEN 'office' THEN 1
      WHEN 'ward' THEN 2
      WHEN 'municipal' THEN 3
      ELSE 99
    END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

### 3. Validate GPS Coordinates

```typescript
function isValidCoordinate(lat: number, lng: number): boolean {
  // Fiji bounds (approximate)
  const FIJI_BOUNDS = {
    minLat: -21,
    maxLat: -16,
    minLng: 177,
    maxLng: 180
  };
  
  return (
    lat >= FIJI_BOUNDS.minLat &&
    lat <= FIJI_BOUNDS.maxLat &&
    lng >= FIJI_BOUNDS.minLng &&
    lng <= FIJI_BOUNDS.maxLng
  );
}
```

## Troubleshooting

### GPS Not Available

```typescript
if (!navigator.geolocation) {
  // Fallback: Manual location selection
  showLocationPicker();
}
```

### Inaccurate GPS

- Request high accuracy mode
- Wait for better signal
- Allow location permissions
- Use manual override if necessary

### Boundary Overlap

- Review boundary definitions
- Use ST_MakeValid() to fix geometries
- Implement priority rules (smallest boundary wins)

---

**Next:** [Authentication & Authorization](./06-auth.md)

# Polygon Coverage Areas for Routes

## Overview
Updated the route system from waypoint-based paths to polygon-based coverage areas. This better represents patrol zones and coverage regions that officers monitor.

## Changes Made

### 1. Database Migration
**File**: `db/migrations/017_route_polygon_areas.sql`

Added `coverage_area` JSONB column to routes table:
- Stores array of `{lat, lng}` objects defining polygon vertices
- Minimum 3 points required to form a valid polygon
- Automatically closes the polygon when rendered

**To Apply**: Run this SQL in Supabase SQL Editor

### 2. Create Route Dialog
**File**: `web/components/admin/create-route-dialog.tsx`

**Complete Redesign**:
- **Drawing Mode**: Toggle on/off to add polygon vertices
- **Interactive Plotting**: Click map to add vertices in sequence
- **Visual Feedback**: 
  - Green polygon shows current drawing with opacity
  - Blue polygons show existing routes for context
  - Numbered markers show each vertex
- **Controls**:
  - "Start Drawing Polygon" - Activates drawing mode
  - "Complete Polygon" - Finishes polygon (min 3 vertices)
  - "Undo Last" - Removes last added vertex
  - "Clear All" - Resets polygon and drawing mode
- **Validation**: Enforces minimum 3 vertices before submission

### 3. Map Component Enhancement
**File**: `web/components/maps/map-component.tsx`

**New Features**:
- Added `polygons` prop for polygon overlays
- Polygon interface:
  ```typescript
  polygons?: Array<{
    id: string;
    path: Array<{ lat: number; lng: number }>;
    strokeColor?: string;
    fillColor?: string;
    fillOpacity?: number;
    title?: string;
  }>;
  ```
- Automatic Google Maps Polygon rendering
- Click to show info window with polygon title
- Proper cleanup on unmount

### 4. Routes Pages Updated
**Files**: 
- `web/app/protected/routes/page.tsx`
- `web/app/admin/routes/page.tsx`

**Changes**:
- Removed waypoints query
- Now fetches `coverage_area` from routes table directly
- Simplified queries (no JOIN to route_waypoints needed)

### 5. Routes Table
**File**: `web/components/admin/routes-table.tsx`

**Display Updates**:
- Changed column from "Waypoints" to "Coverage Area"
- Shows "X vertices" badge with "Polygon defined" text
- Cleaner display without waypoint names

## User Experience

### Creating a Coverage Area

1. **Open Create Route Dialog**
   - Click "Create Route" button
   - Fill in route name and description
   - Select agency (if super admin)

2. **Start Drawing**
   - Click "Start Drawing Polygon" button
   - Drawing mode activates (green indicator)

3. **Plot Coverage Area**
   - Click on map to add vertices
   - Each click adds a vertex in sequence
   - Progress shown: "X vertices" counter
   - Green polygon fills in as you draw

4. **Refine Polygon**
   - "Undo Last" to remove mistakes
   - "Clear All" to start over
   - Keep adding vertices for detailed coverage

5. **Complete**
   - Click "Complete Polygon" when done (min 3 vertices)
   - Drawing mode deactivates
   - Click "Create Route" to save

### Visual Feedback

**Color Coding**:
- 🟢 **Green Polygon**: Current drawing (opacity 0.3)
- 🔵 **Blue Polygons**: Existing routes (opacity 0.2)
- **Numbered Markers**: Vertex sequence

**Status Indicators**:
- 🟢 "Drawing Active" - Can click to add vertices
- ⚪ "Ready" - Drawing mode off

**Info Messages**:
- **No vertices**: "Click Start Drawing Polygon..."
- **1-2 vertices**: "Keep going, need 3 points minimum"
- **3+ vertices**: "Ready to complete or add more"

## Benefits

### For Operations
✅ **Area Coverage**: Defines patrol zones, not just paths
✅ **Visual Planning**: See overlapping areas, gaps in coverage
✅ **Flexible Boundaries**: Irregular shapes match real geography
✅ **Context Aware**: View existing coverage while planning

### For System
✅ **Simpler Data Model**: Single JSONB column vs separate table
✅ **Better Performance**: No JOIN queries needed
✅ **Flexible Storage**: JSON handles any polygon complexity
✅ **Easy Queries**: Direct access to polygon data

## Technical Details

### Data Structure

```typescript
// Route with coverage area
{
  id: "uuid",
  name: "Downtown Patrol Zone",
  description: "Main street coverage",
  agency_id: "uuid",
  coverage_area: [
    { lat: -1.2864, lng: 36.8172 },
    { lat: -1.2870, lng: 36.8180 },
    { lat: -1.2875, lng: 36.8175 },
    { lat: -1.2869, lng: 36.8168 }
  ]
}
```

### Polygon Rendering

Google Maps API automatically:
- Closes the polygon (connects last to first vertex)
- Fills interior with specified color/opacity
- Draws stroke around perimeter
- Handles clicks for info windows

### Migration Path

**Old waypoints table can be**:
- Kept for reference (doesn't interfere)
- Dropped if no longer needed
- Migrated to polygons if desired

**Migration script example**:
```sql
-- Optional: Convert first/last waypoints to simple polygon
UPDATE routes r
SET coverage_area = (
  SELECT json_agg(json_build_object('lat', latitude, 'lng', longitude))
  FROM route_waypoints
  WHERE route_id = r.id
  ORDER BY waypoint_order
)
WHERE EXISTS (
  SELECT 1 FROM route_waypoints WHERE route_id = r.id
);
```

## Future Enhancements

Potential additions:
- [ ] Area calculation (km² coverage)
- [ ] Heat map of patrol frequency
- [ ] Overlap detection with other routes
- [ ] Import polygon from KML/GeoJSON
- [ ] Snap-to-roads for street coverage
- [ ] Multi-polygon support (non-contiguous areas)
- [ ] Edit existing polygons (drag vertices)
- [ ] Auto-generate from address boundaries

## Use Cases

### Patrol Zones
Define areas officers patrol, not specific paths:
- Residential neighborhoods
- Commercial districts  
- School zones
- Park areas

### Coverage Planning
Visual planning prevents gaps:
- See all agency coverage at once
- Identify uncovered areas
- Balance workload across teams
- Plan new routes strategically

### Reporting
Area-based analysis:
- Incidents per coverage zone
- Officer time in each area
- Coverage effectiveness metrics
- Resource allocation optimization

## Database Schema

```sql
-- Routes table (updated)
CREATE TABLE routes (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  agency_id UUID REFERENCES agencies(id),
  coverage_area JSONB,  -- NEW: Array of {lat, lng} points
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example coverage_area value
-- [
--   {"lat": -1.2864, "lng": 36.8172},
--   {"lat": -1.2870, "lng": 36.8180},
--   {"lat": -1.2875, "lng": 36.8175}
-- ]
```

## Summary

The system now uses **polygon-based coverage areas** instead of waypoint paths:

- **Better Representation**: Polygons show patrol zones, not routes
- **Easier Planning**: Visual area definition with click-to-draw
- **Simpler Architecture**: JSONB column instead of separate table
- **Improved UX**: Interactive drawing with real-time feedback
- **Context Awareness**: See existing coverage while planning
- **Flexible**: Supports any polygon shape/complexity

This change makes the MANTIS system better suited for patrol zone management and coverage planning! 🎉

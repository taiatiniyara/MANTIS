# Route Polygon Editing Feature

## Overview
Admins can now edit route coverage area polygons after creation using an interactive map interface.

## Components

### 1. EditRoutePolygonDialog
**Location:** `web/components/admin/edit-route-polygon-dialog.tsx`

**Purpose:** Dialog component that wraps the polygon editor for route coverage area editing.

**Features:**
- Displays current route coverage area on map
- Validates polygon has at least 3 points
- Saves updated polygon to database
- Shows loading states and error handling
- Toast notifications for success/failure

**Props:**
```typescript
{
  route: RouteData;        // Route to edit
  open: boolean;           // Dialog open state
  onOpenChange: (open: boolean) => void;  // Handler for dialog state
}
```

### 2. PolygonEditor
**Location:** `web/components/maps/polygon-editor.tsx`

**Purpose:** Interactive map component using Leaflet and Leaflet Draw for polygon editing.

**Features:**
- Displays current polygon on OpenStreetMap tiles
- Draw new polygons by clicking on map
- Edit existing polygon vertices by dragging
- Delete polygon with remove tool
- Auto-fits map bounds to polygon
- Real-time polygon updates via onChange callback

**Props:**
```typescript
{
  initialPolygon: Coordinate[];  // Initial polygon coordinates
  onChange: (polygon: Coordinate[]) => void;  // Callback when polygon changes
  height?: number;  // Map height in pixels (default: 400)
}
```

**Map Controls:**
- **Polygon Tool**: Draw new polygon (replaces existing)
- **Edit Tool**: Modify polygon vertices
- **Delete Tool**: Remove polygon

### 3. RoutesTable Updates
**Location:** `web/components/admin/routes-table.tsx`

**Changes:**
- Added Map icon import from lucide-react
- Added EditRoutePolygonDialog import
- Added `editingPolygon` state for polygon editor dialog
- Added "Edit Polygon" button (Map icon) next to Edit/Delete buttons
- Wired up polygon editor dialog with state management

**New Button:**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => setEditingPolygon(route)}
>
  <Map className="h-4 w-4" />
</Button>
```

## Database Schema

**Table:** `routes`

**Field:** `coverage_area` (JSONB)

**Format:**
```json
[
  {"lat": -33.8688, "lng": 151.2093},
  {"lat": -33.8700, "lng": 151.2100},
  {"lat": -33.8710, "lng": 151.2090}
]
```

## Dependencies

### New Packages
```bash
npm install leaflet leaflet-draw @types/leaflet @types/leaflet-draw
```

**Leaflet:** ^1.9.4 - Interactive maps library
**Leaflet Draw:** ^1.0.4 - Drawing and editing tools for Leaflet
**@types/leaflet:** TypeScript definitions for Leaflet
**@types/leaflet-draw:** TypeScript definitions for Leaflet Draw

### CDN Resources
Leaflet marker icons loaded from unpkg.com CDN:
- `marker-icon.png`
- `marker-icon-2x.png`
- `marker-shadow.png`

## User Flow

1. Admin navigates to Routes page (`/admin/routes`)
2. Clicks Map icon button on route row
3. EditRoutePolygonDialog opens showing current coverage area
4. Admin can:
   - Draw new polygon (replaces current)
   - Edit vertices by dragging
   - Delete polygon entirely
5. Click "Save Coverage Area" to update database
6. Toast notification confirms success/failure
7. Table refreshes to show updated polygon

## Technical Details

### Dynamic Import
PolygonEditor is dynamically imported with `next/dynamic` to avoid SSR issues:
```tsx
const PolygonEditor = dynamic(
  () => import("@/components/maps/polygon-editor"),
  { ssr: false, loading: () => <Loader2 /> }
);
```

### Leaflet Icon Fix
Leaflet default marker icons don't work properly in webpack builds. Fixed by:
```tsx
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
```

### Map Cleanup
PolygonEditor properly cleans up Leaflet map instance on unmount:
```tsx
return () => {
  if (mapRef.current) {
    mapRef.current.remove();
    mapRef.current = null;
  }
};
```

## API Integration

**Endpoint:** Supabase REST API via `@supabase/ssr`

**Update Request:**
```typescript
const { error } = await supabase
  .from("routes")
  .update({ coverage_area: polygon })
  .eq("id", route.id);
```

## Validation

**Polygon Requirements:**
- Minimum 3 points to form valid polygon
- Coordinates must have `lat` and `lng` properties
- Values must be valid latitude/longitude numbers

**Error Handling:**
- Invalid polygon: Toast error, no save
- Database error: Toast error with message
- Network error: Caught and displayed in toast

## Future Enhancements

1. **Multi-polygon support**: Allow routes with multiple coverage areas
2. **Polygon drawing tools**: Rectangle, circle tools in addition to free-form
3. **Snap to roads**: Auto-align polygon edges to street networks
4. **Area calculation**: Display polygon area in km² or mi²
5. **Import/Export**: Upload GeoJSON or KML files
6. **Validation**: Check for overlapping route coverage areas
7. **Undo/Redo**: History for polygon edits
8. **Search**: Geocoding to find and center on addresses

## Files Modified

1. ✅ `web/components/admin/routes-table.tsx` - Added polygon edit button and state
2. ✅ `web/components/admin/edit-route-polygon-dialog.tsx` - Created dialog wrapper
3. ✅ `web/components/maps/polygon-editor.tsx` - Created map editor component
4. ✅ `web/package.json` - Added Leaflet dependencies
5. ✅ `web/app/globals.css` - Added Leaflet icon path fix

## Testing Checklist

- [ ] Open route polygon editor dialog
- [ ] Existing polygon displays correctly on map
- [ ] Draw new polygon (click to add points)
- [ ] Edit polygon vertices by dragging
- [ ] Delete polygon with remove tool
- [ ] Save updated polygon to database
- [ ] Verify polygon updates in routes table
- [ ] Test with route that has no coverage area
- [ ] Test validation (less than 3 points)
- [ ] Test error handling (network failure)
- [ ] Verify map cleanup on dialog close
- [ ] Check mobile responsiveness

## Screenshot Locations

Map interface shows:
- OpenStreetMap base layer
- Blue polygon outline (#3b82f6)
- Draw polygon tool button
- Edit polygon tool button
- Delete polygon tool button
- Vertex drag handles when editing
- Zoom controls
- Attribution

---

**Created:** 2024
**Status:** ✅ Complete
**Version:** 1.0

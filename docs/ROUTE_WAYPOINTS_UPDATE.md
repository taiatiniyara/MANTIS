# Route Waypoints Update

## Overview
Updated the route creation system to use custom waypoints instead of linking to agency office locations. This allows agency admins to plot patrol routes with multiple GPS points directly on a map.

## Changes Made

### 1. Database Migration
**File**: `db/migrations/016_route_waypoints.sql`

Created new `route_waypoints` table:
- `id`: UUID primary key
- `route_id`: References routes table
- `latitude`: Decimal(10,8) - GPS latitude (-90 to 90)
- `longitude`: Decimal(11,8) - GPS longitude (-180 to 180)
- `waypoint_order`: Integer - Sequential order (1, 2, 3, etc.)
- `name`: Text - Optional descriptive name
- `created_at`, `updated_at`: Timestamps

**RLS Policies**:
- Super admins: Full access to all waypoints
- Agency admins: Manage waypoints for their agency's routes
- Officers/Team leaders: View waypoints for their agency's routes

**To Apply**: Run this SQL in Supabase SQL Editor:
```sql
-- Copy contents of db/migrations/016_route_waypoints.sql
```

### 2. Create Route Dialog
**File**: `web/components/admin/create-route-dialog.tsx`

**Major Changes**:
- Removed dependency on locations (no longer needs location prop)
- Added interactive map with click-to-add waypoints
- Displays existing routes' waypoints for context (gray markers)
- Shows current route waypoints being created (colored markers)
- Waypoint list with:
  - Sequential numbering (1, 2, 3, etc.)
  - Optional name field for each waypoint
  - GPS coordinates display
  - Remove button for each waypoint
- Minimum 2 waypoints required
- Validates and creates route with all waypoints in single transaction

**User Flow**:
1. Enter route name and description
2. Select agency (if super admin)
3. Click on map to add waypoints
4. Optionally name each waypoint
5. Remove waypoints if needed
6. Submit when at least 2 waypoints added

### 3. Routes Table
**File**: `web/components/admin/routes-table.tsx`

**Changes**:
- Removed `locations` prop
- Updated to display waypoint count instead of location
- Shows first waypoint name if available
- Badge shows total waypoint count

### 4. Edit Route Dialog
**File**: `web/components/admin/edit-route-dialog.tsx`

**Changes**:
- Removed `locations` prop
- Simplified to edit only basic info (name, description, agency)
- Note added: "waypoints cannot be edited"
- Waypoint editing can be added later if needed

### 5. Protected Routes Page
**File**: `web/app/protected/routes/page.tsx`

**Changes**:
- Removed locations query
- Updated routes query to include waypoints:
  ```typescript
  waypoints:route_waypoints (
    id,
    latitude,
    longitude,
    waypoint_order,
    name
  )
  ```
- Removed `locations` prop from CreateRouteDialog
- Removed `locations` prop from RoutesTable

## Key Features

### Interactive Route Planning
- **Click-to-Add**: Click anywhere on map to add waypoint
- **Visual Feedback**: Numbered markers show waypoint order
- **Context Awareness**: Gray markers show existing routes
- **GPS Precision**: Coordinates shown to 6 decimal places

### Waypoint Management
- **Ordering**: Automatic sequential ordering
- **Naming**: Optional descriptive names
- **Removal**: Individual waypoint removal with auto-reordering
- **Validation**: Minimum 2 waypoints enforced

### Map Integration
- Uses existing MapComponent with `onMapClick` handler
- Supports existing routes visualization
- Centers on first waypoint or defaults to Nairobi
- 500px height for good visibility

## Database Schema

```sql
routes
├── id (unchanged)
├── name (unchanged)
├── description (unchanged)
├── agency_id (unchanged)
└── waypoints (NEW relationship)
    └── route_waypoints[]
        ├── id
        ├── latitude
        ├── longitude
        ├── waypoint_order
        ├── name
        └── timestamps

locations (separate - for agency offices)
├── id
├── name
├── type (division, station, post, etc.)
├── agency_id
├── latitude
├── longitude
└── address
```

## Migration Steps

1. **Apply Database Migration**:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `db/migrations/016_route_waypoints.sql`
   - Execute the SQL

2. **Verify RLS Policies**:
   ```sql
   SELECT * FROM route_waypoints; -- Should work for authenticated users
   ```

3. **Test Route Creation**:
   - Go to `/protected/routes`
   - Click "Create Route"
   - Click map to add 2+ waypoints
   - Submit and verify in database

4. **Verify Data**:
   ```sql
   SELECT 
     r.name as route_name,
     rw.waypoint_order,
     rw.latitude,
     rw.longitude,
     rw.name as waypoint_name
   FROM routes r
   LEFT JOIN route_waypoints rw ON rw.route_id = r.id
   ORDER BY r.created_at DESC, rw.waypoint_order ASC;
   ```

## Benefits

### For Agency Admins
✅ No dependency on pre-defined locations
✅ Custom routes tailored to actual patrol areas
✅ Visual planning prevents route overlap
✅ See existing coverage while planning
✅ Multiple waypoints for detailed routes

### For System Design
✅ Clear separation: locations = offices, routes = patrol paths
✅ Flexible: Any number of waypoints per route
✅ Scalable: Efficient queries with proper indexing
✅ Secure: RLS policies enforce agency boundaries

## Future Enhancements

Potential additions:
- [ ] Waypoint drag-and-drop reordering
- [ ] Route line drawing between waypoints
- [ ] Distance calculation between waypoints
- [ ] ETA/time estimates based on route length
- [ ] Import/export routes as GPX or KML
- [ ] Waypoint editing in EditRouteDialog
- [ ] Route templates for common patterns
- [ ] Heat map of patrol coverage

## Technical Notes

- **TypeScript**: Full type safety with Waypoint interface
- **Performance**: Indexed queries on route_id and waypoint_order
- **UX**: Real-time feedback with toast notifications
- **Validation**: GPS coordinate bounds checking (-90/90, -180/180)
- **Transaction**: Route and waypoints created atomically

## Locations vs Routes

### Locations Table
**Purpose**: Agency office addresses and branches
**Usage**: Creating teams, assigning officers, administrative purposes
**GPS**: Optional (for map visualization of offices)
**Examples**:
- Police Station Headquarters
- Traffic Division Office
- Regional Command Center

### Routes (with Waypoints)
**Purpose**: Patrol paths and monitoring routes
**Usage**: Officer assignments, route planning, coverage tracking
**GPS**: Required (defines the actual patrol path)
**Examples**:
- Downtown Patrol Route (with 5 waypoints along main streets)
- Highway Monitoring Route (with checkpoints every 10km)
- School Zone Patrol (with stops at each school)

## Summary

This update transforms route creation from a simple location-based system to a full visual route planning tool. Agency admins can now:
- Plot custom routes with multiple waypoints
- See existing coverage while planning
- Create detailed patrol paths matching real-world needs
- Manage routes independently of office locations

The system maintains clear data separation: **locations** for agency infrastructure, **routes with waypoints** for operational patrol paths.

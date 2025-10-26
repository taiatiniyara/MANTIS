# Enhanced Route Creation with Visual Map Planning

## Overview
The Create Route dialog now features an integrated map view that allows agency admins to visually plan routes, see existing routes, and select locations with GPS coordinates interactively.

---

## 🎯 New Features

### 1. Tabbed Interface
The Create Route dialog now has two tabs:
- **Route Details** - Form fields for route information
- **Map View** - Interactive visual route planning

### 2. Visual Route Planning
- ✅ See existing routes plotted on the map
- ✅ View all available locations with GPS coordinates
- ✅ Visual feedback for selected start/end locations
- ✅ Map legend showing different marker types
- ✅ Real-time route visualization

### 3. Enhanced Location Selection
- ✅ Start and End location fields (replacing single location)
- ✅ GPS indicator shows which locations have coordinates
- ✅ Coordinate display for selected locations
- ✅ Warning when no GPS data is available

---

## 🗺️ How to Use

### Step 1: Open Create Route Dialog
1. Navigate to Routes Management (`/protected/routes` or `/admin/routes`)
2. Click **"Create Route"** button
3. Dialog opens with Route Details tab active

### Step 2: Fill in Route Details
**Route Details Tab:**
```
Route Name: Downtown Evening Patrol
Description: Evening patrol covering main streets
Start Location: Suva Police Station 📍 GPS
End Location: City Market 📍 GPS
```

### Step 3: View on Map
1. Click **"Map View"** tab
2. See:
   - Blue markers = Existing routes
   - Green markers = Available locations
   - Your selected start/end highlighted

### Step 4: Verify and Create
1. Check route visualization on map
2. Adjust locations if needed
3. Click **"Create Route"**
4. Route is saved and appears on map view

---

## 🎨 User Interface

### Dialog Layout
```
┌──────────────────────────────────────────────────────┐
│  📍 Create Route                                      │
│  Create a new patrol route with visual map planning  │
├──────────────────────────────────────────────────────┤
│                                                        │
│  [Route Details] [🗺️ Map View]                       │
│  ─────────────── ──────────                          │
│                                                        │
│  Route Details Tab:                                   │
│                                                        │
│  Route Name:                                          │
│  [Downtown Evening Patrol________________]            │
│                                                        │
│  Description:                                         │
│  [Evening patrol covering...____________]             │
│  [_______________________________________]            │
│                                                        │
│  Start Location:                                      │
│  [▼ Suva Police Station (station) 📍 GPS]            │
│  📍 -18.1416, 178.4419                               │
│                                                        │
│  End Location:                                        │
│  [▼ City Market (post) 📍 GPS________]               │
│  📍 -18.1421, 178.4250                               │
│                                                        │
│                        [Cancel] [Create Route]        │
└──────────────────────────────────────────────────────┘
```

### Map View Tab
```
┌──────────────────────────────────────────────────────┐
│  📍 Create Route                                      │
├──────────────────────────────────────────────────────┤
│                                                        │
│  [Route Details] [🗺️ Map View]                       │
│                  ──────────                           │
│                                                        │
│  Map Legend                                           │
│  🔵 Existing routes    🟢 Available locations         │
│  ─────────────────────────────────────────────       │
│  Start: Suva Police Station                           │
│  End: City Market                                     │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │         [INTERACTIVE GOOGLE MAP]               │  │
│  │                                                │  │
│  │  🔵 🔵  Existing routes shown                  │  │
│  │  🟢 🟢 🟢  Available locations                 │  │
│  │  ⭐ ⭐  Selected start/end                     │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Showing 5 existing routes in your agency             │
│                                                        │
│                        [Cancel] [Create Route]        │
└──────────────────────────────────────────────────────┘
```

---

## 📋 Features Breakdown

### Route Details Tab

**Fields:**
1. **Route Name** (Required)
   - Text input
   - Example: "Downtown Patrol", "Highway A1"

2. **Description** (Optional)
   - Multi-line text
   - Route instructions or notes

3. **Agency** (Super Admin Only)
   - Dropdown selection
   - Auto-assigned for agency admins

4. **Start Location**
   - Dropdown with all agency locations
   - Shows GPS indicator (📍) if coordinates exist
   - Displays coordinates when selected

5. **End Location** (Optional)
   - Same as start location
   - Can be left empty for circular routes

**GPS Indicators:**
```
Location Dropdown:
┌──────────────────────────────────────┐
│ ▼ Suva Police Station (station) 📍 GPS │
│   City Market (post) 📍 GPS          │
│   Main Street Post (post)            │ ← No GPS
└──────────────────────────────────────┘
```

**Validation:**
- Route name is required
- Start location recommended (not enforced)
- Shows warning if no GPS locations available

---

### Map View Tab

**Map Legend:**
Shows what different markers represent:
- 🔵 Blue = Existing routes (both start and end points)
- 🟢 Green = Available locations for selection
- Selected locations highlighted in UI

**Selected Route Info:**
Displays current selections:
```
Start: Suva Police Station
End: City Market
```

**Map Features:**
- Pan and zoom
- Hover over markers for info
- All existing agency routes shown
- All GPS-enabled locations shown
- Interactive Google Maps

**No Data State:**
When no GPS data exists:
```
┌────────────────────────────────┐
│   📍                           │
│   No Map Data Available        │
│                                │
│   Add GPS coordinates to       │
│   your locations to visualize  │
│   routes on the map.           │
└────────────────────────────────┘
```

---

## 🔄 Workflow Example

### Creating a New Patrol Route

**Scenario:** Set up evening downtown patrol

**Step 1: Open Dialog**
- Click "Create Route" on Routes Management page

**Step 2: Enter Details**
```
Name: Downtown Evening Patrol
Description: 6pm-2am coverage of main commercial district
```

**Step 3: Select Locations**
```
Start: Suva Police Station
  📍 -18.1416, 178.4419

End: Ratu Sukuna Park
  📍 -18.1433, 178.4456
```

**Step 4: View on Map**
- Switch to Map View tab
- Verify route makes sense
- Check existing routes don't overlap
- Confirm start/end points

**Step 5: Create**
- Click "Create Route"
- Route saved with both start and end locations
- Appears in routes table and map view

---

## 💡 Best Practices

### Route Planning

**1. Use GPS-Enabled Locations**
- Always add GPS coordinates to locations first
- More accurate route visualization
- Better planning and analysis

**2. Check Existing Routes**
- Use Map View to see what routes exist
- Avoid overlap or gaps in coverage
- Plan complementary patrol patterns

**3. Logical Route Flow**
- Start location = where patrol begins
- End location = patrol destination
- Leave end empty for circular routes

**4. Descriptive Names**
- Include area: "Downtown", "Highway A1"
- Include time: "Morning", "Night"
- Include type: "Patrol", "Checkpoint"

### Location Management

**Before Creating Routes:**
1. Create all necessary locations
2. Add GPS coordinates to each
3. Verify coordinates on map
4. Then create routes

**GPS Data Sources:**
- Google Maps (right-click → coordinates)
- Mobile GPS device
- Survey data
- Existing records

---

## 🎯 Map Markers Explained

### Existing Routes (Blue)
```
🔵 "Highway Patrol - Start"
   Existing route start point
   Shows on map for context

🔵 "Highway Patrol - End"
   Existing route end point
   Helps avoid conflicts
```

### Available Locations (Green)
```
🟢 "Central Station (station) - Available"
   Location with GPS that can be selected
   Click to see details
```

### Selected Locations (Highlighted)
When you select start/end locations:
- Shown in legend box
- Coordinates displayed
- Easy to verify selection

---

## 🔧 Technical Details

### Database Changes
Routes now use:
- `start_location_id` - Starting point
- `end_location_id` - Ending point (optional)
- `location_id` - Kept for backward compatibility

### Query Changes
```typescript
// Fetch existing routes with GPS data
const { data } = await supabase
  .from("routes")
  .select(`
    id,
    name,
    start_location:locations!routes_start_location_id_fkey(
      latitude, 
      longitude
    ),
    end_location:locations!routes_end_location_id_fkey(
      latitude, 
      longitude
    )
  `)
  .eq("agency_id", agencyId);
```

### Map Markers Creation
```typescript
// Combine existing routes and available locations
const mapMarkers = [
  // Existing routes
  ...existingRoutes.flatMap(route => {
    const markers = [];
    if (route.start_location?.latitude) {
      markers.push({
        id: `existing-start-${route.id}`,
        position: { 
          lat: route.start_location.latitude,
          lng: route.start_location.longitude 
        },
        title: `${route.name} - Start (existing)`,
      });
    }
    // Similar for end location
    return markers;
  }),
  
  // Available locations
  ...locationsWithGPS.map(loc => ({
    id: `location-${loc.id}`,
    position: { lat: loc.latitude, lng: loc.longitude },
    title: `${loc.name} (${loc.type}) - Available`,
  })),
];
```

---

## ⚠️ Important Notes

### GPS Requirements
- Locations need GPS coordinates to appear on map
- Routes without GPS still work but won't show on map
- Add GPS to locations BEFORE creating routes

### Dialog Size
- Dialog is wider (900px) to accommodate map
- Max height 90vh with scroll
- Responsive on smaller screens

### Performance
- Map loads only when Map View tab is selected
- Existing routes fetched when dialog opens
- Efficient marker rendering

### Backward Compatibility
- `location_id` field still populated
- Existing routes continue to work
- Older data migrates smoothly

---

## 🐛 Troubleshooting

### Problem: Map Not Showing
**Solution:**
- Check if locations have GPS coordinates
- Verify Google Maps API key is configured
- Check browser console for errors

### Problem: No Locations in Dropdown
**Solution:**
- Create locations first
- Ensure locations belong to correct agency
- Check location data in database

### Problem: Existing Routes Not Showing
**Solution:**
- Verify routes have GPS-enabled locations
- Check routes belong to correct agency
- Refresh dialog to reload data

### Problem: Can't Select Location
**Solution:**
- Ensure location has agency assigned
- Check agency matches current user
- Verify location is not deleted

---

## 📊 Benefits

### For Agency Admins
- ✅ Visual route planning
- ✅ See coverage at a glance
- ✅ Avoid overlapping routes
- ✅ Identify coverage gaps
- ✅ Better resource allocation

### For Officers
- ✅ Clear route understanding
- ✅ Visual reference available
- ✅ Know start/end points clearly
- ✅ Better navigation

### For System
- ✅ Better data quality
- ✅ Geographic intelligence
- ✅ Analytics capability
- ✅ Future optimization potential

---

## 🚀 Future Enhancements

Planned improvements:
- [ ] Click map to create waypoints
- [ ] Draw routes with polylines
- [ ] Distance calculation
- [ ] Route optimization suggestions
- [ ] Drag markers to adjust locations
- [ ] Import routes from GPS files
- [ ] Export routes to GPS devices
- [ ] 3D terrain view
- [ ] Traffic data overlay
- [ ] Historical route data

---

## 📖 Related Features

- [Route Mapping Guide](./ROUTE_MAPPING_GUIDE.md)
- [GPS Coordinates Reference](./GPS_COORDINATES_REFERENCE.md)
- [Agency Admin Management](./AGENCY_ADMIN_MANAGEMENT.md)
- [Location Management](./AGENCY_ADMIN_UI_GUIDE.md)

---

*Last Updated: October 22, 2025*
*MANTIS - Enhanced Route Creation Feature*

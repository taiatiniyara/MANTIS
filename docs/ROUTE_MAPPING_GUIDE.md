# Route Mapping Feature for Agency Admins

## Overview
Agency admins can now plot and visualize their patrol routes on an interactive map. This feature integrates GPS coordinates from locations to display route start and end points on Google Maps.

---

## 🗺️ Features Added

### 1. Routes Map View Page
**URL:** `/protected/routes/map`

#### Capabilities
- ✅ View all routes from your agency on an interactive map
- ✅ See route start and end locations with markers
- ✅ Detailed route information with GPS coordinates
- ✅ Visual indicators for routes missing GPS data
- ✅ Interactive Google Maps integration

#### Access
- Navigate to Routes Management (`/protected/routes`)
- Click the **"Map View"** button in the header
- Or directly access `/protected/routes/map`

---

### 2. GPS Coordinate Management

#### Location Creation/Editing
Both create and edit location dialogs now include GPS fields:

**Fields Added:**
- **Address** - Physical address of the location
- **Latitude** - GPS latitude (-90 to 90)
- **Longitude** - GPS longitude (-180 to 180)

**Validation:**
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- All GPS fields are optional
- Coordinates are validated on submission

---

## 📍 How to Use

### Step 1: Add GPS Coordinates to Locations

1. Go to **Locations Management** (`/protected/locations`)
2. Either:
   - **Create new location** with GPS coordinates
   - **Edit existing location** to add GPS data

3. Fill in GPS fields:
   ```
   Address: 123 Victoria Parade, Suva
   Latitude: -18.1416
   Longitude: 178.4419
   ```

4. Save the location

### Step 2: Create Routes with GPS-Enabled Locations

1. Go to **Routes Management** (`/protected/routes`)
2. Click **"Create Route"**
3. Select locations that have GPS coordinates
4. Save the route

### Step 3: View Routes on Map

1. On the Routes Management page, click **"Map View"**
2. See all routes plotted on the map
3. Markers show route start and end locations
4. Hover over markers to see route names

---

## 🎯 Map View Features

### Interactive Map
- **Pan and Zoom** - Navigate the map freely
- **Markers** - Each route's start/end locations appear as pins
- **Tooltips** - Hover over markers to see route details
- **Centered on Fiji** - Defaults to Suva coordinates (-18.1416, 178.4419)

### Route Information Display

Each route card shows:
- ✅ Route name and description
- ✅ Start location name and coordinates
- ✅ End location name and coordinates
- ⚠️ Warning if GPS data is missing
- 📍 GPS coordinate precision (4 decimal places)

### Visual Indicators

**Routes WITH GPS:**
- Normal opacity
- Displayed on map
- Green checkmark indicators

**Routes WITHOUT GPS:**
- Reduced opacity (50%)
- Not displayed on map
- Warning message with yellow alert icon

---

## 📋 Example Workflow

### Setting Up a Mapped Route

**1. Create Location with GPS:**
```
Name: Central Police Station
Type: Station
Address: Ratu Sukuna Road, Suva
Latitude: -18.1416
Longitude: 178.4419
```

**2. Create Second Location:**
```
Name: Suva City Market
Type: Post
Address: Usher Street, Suva
Latitude: -18.1421
Longitude: 178.4250
```

**3. Create Route:**
```
Name: Downtown Patrol
Description: Daily patrol route through city center
Start Location: Central Police Station
End Location: Suva City Market
```

**4. View on Map:**
- Click "Map View" button
- See both markers on map
- Click markers to see route details

---

## 🎨 UI Elements

### Routes Management Page Header
```
┌────────────────────────────────────────────────────┐
│  Routes Management                                  │
│  Manage patrol routes within your agency            │
│                                                      │
│                    [Map View] [Create Route]        │
└────────────────────────────────────────────────────┘
```

### Map View Page
```
┌────────────────────────────────────────────────────┐
│  [← Back to Routes]                                 │
│  Routes Map View                                    │
│  Visualize your agency's patrol routes...          │
├────────────────────────────────────────────────────┤
│                                                      │
│  Route Locations                                    │
│  Showing X routes with GPS coordinates              │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │         [INTERACTIVE GOOGLE MAP]             │  │
│  │                                              │  │
│  │  📍 Route markers appear here                │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
├────────────────────────────────────────────────────┤
│  Route Details                                      │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Downtown Patrol                             │   │
│  │ Daily patrol route                          │   │
│  │                                             │   │
│  │ Start: Central Station                      │   │
│  │ 📍 -18.1416, 178.4419                       │   │
│  │                                             │   │
│  │ End: City Market                            │   │
│  │ 📍 -18.1421, 178.4250                       │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### Location Dialog with GPS Fields
```
┌──────────────────────────────────────┐
│  📍 Create Location                  │
├──────────────────────────────────────┤
│  Location Name:                      │
│  [Central Police Station       ]     │
│                                      │
│  Type: [▼ Station            ]       │
│                                      │
│  Parent Location: [▼ None     ]      │
│                                      │
│  ─────────────────────────────       │
│  📍 GPS Coordinates (Optional)       │
│  Add coordinates to display this     │
│  location on route maps              │
│                                      │
│  Address:                            │
│  [123 Victoria Parade, Suva  ]       │
│                                      │
│  Latitude:      Longitude:           │
│  [-18.1416]     [178.4419  ]         │
│  -90 to 90      -180 to 180          │
│                                      │
│         [Cancel] [Create Location]   │
└──────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Files Created/Modified

**New Files:**
1. `web/app/protected/routes/map/page.tsx` - Map view page for agency admins

**Modified Files:**
1. `web/app/protected/routes/page.tsx` - Added "Map View" button
2. `web/components/admin/create-location-dialog.tsx` - Added GPS fields
3. `web/components/admin/edit-location-dialog.tsx` - Added GPS fields

### Database Fields Used
```sql
-- locations table
latitude DECIMAL(10, 8)    -- -90.00000000 to 90.00000000
longitude DECIMAL(11, 8)   -- -180.00000000 to 180.00000000
address TEXT               -- Physical address
```

### Route Query
```typescript
const { data: routes } = await supabase
  .from("routes")
  .select(`
    *,
    agency:agencies(id, name),
    start_location:locations!routes_start_location_id_fkey(
      id, name, latitude, longitude, address
    ),
    end_location:locations!routes_end_location_id_fkey(
      id, name, latitude, longitude, address
    )
  `)
  .eq("agency_id", currentUser.agency_id)
  .order("name");
```

### Map Markers Creation
```typescript
// Create markers for each route's start/end locations
const markers = [];

routes.forEach((route) => {
  if (route.start_location?.latitude && route.start_location?.longitude) {
    markers.push({
      id: `start-${route.id}`,
      position: {
        lat: route.start_location.latitude,
        lng: route.start_location.longitude,
      },
      title: `${route.name} - Start: ${route.start_location.name}`,
    });
  }
  
  // Similar for end_location...
});
```

---

## 🌍 GPS Coordinate Examples

### Major Fiji Locations
```
Suva (Capital):
Latitude: -18.1416
Longitude: 178.4419

Nadi International Airport:
Latitude: -17.7556
Longitude: 177.4434

Lautoka City:
Latitude: -17.6161
Longitude: 177.4500

Labasa Town:
Latitude: -16.4167
Longitude: 179.3833
```

### How to Get GPS Coordinates

**Method 1: Google Maps**
1. Right-click on location in Google Maps
2. Click the coordinates at the top
3. Copy the numbers

**Method 2: Mobile Device**
1. Open Google Maps app
2. Long-press on location
3. Coordinates appear at top
4. Tap to copy

**Method 3: GPS Device**
1. Use handheld GPS unit
2. Note down coordinates in decimal format
3. Convert if necessary (DMS → Decimal)

---

## ⚠️ Important Notes

### GPS Data Requirements
- Routes only appear on map if they have GPS coordinates
- At least one location (start OR end) needs coordinates
- Both start and end coordinates recommended for full route visualization

### Coordinate Precision
- 4 decimal places shown in UI = ~11 meters accuracy
- Database stores 8 decimal places for precision
- Sufficient for street-level accuracy

### Map Performance
- Map loads asynchronously
- Loading indicator shown during map initialization
- Handles multiple markers efficiently
- Auto-centers on Fiji region

---

## 🐛 Troubleshooting

### Routes Not Showing on Map

**Problem:** No routes appear on map
**Solution:**
1. Check if locations have GPS coordinates
2. Verify latitude/longitude values are valid
3. Ensure routes are linked to correct locations
4. Check browser console for errors

### Invalid Coordinates Error

**Problem:** "Invalid latitude/longitude" message
**Solution:**
1. Latitude must be -90 to 90
2. Longitude must be -180 to 180
3. Use decimal format (not DMS)
4. Check for typos in numbers

### Map Not Loading

**Problem:** Map shows loading spinner indefinitely
**Solution:**
1. Check Google Maps API key is configured
2. Verify internet connection
3. Check browser console for API errors
4. Try refreshing the page

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Draw lines between route start/end points
- [ ] Show actual patrol path (polylines)
- [ ] Route distance calculation
- [ ] Estimated patrol time
- [ ] Multiple route visualization layers
- [ ] Real-time officer location tracking
- [ ] Route optimization suggestions
- [ ] Traffic data integration
- [ ] Custom map markers for different location types
- [ ] Print/export map view

---

## 📊 User Benefits

### For Agency Admins
- ✅ Visual overview of patrol coverage
- ✅ Easy route planning and optimization
- ✅ Identify coverage gaps
- ✅ Better resource allocation
- ✅ Quick route briefings for officers

### For Officers
- ✅ Clear understanding of patrol areas
- ✅ Visual route reference
- ✅ Better navigation assistance
- ✅ Improved situational awareness

### For System
- ✅ Data-driven patrol management
- ✅ Geographic analytics capability
- ✅ Integration with GIS systems
- ✅ Enhanced reporting features

---

## 🔐 Security & Permissions

### Access Control
- ✅ Only agency admins can access map view
- ✅ Users only see their agency's routes
- ✅ RLS policies enforce data isolation
- ✅ GPS data protected at database level

### Data Privacy
- GPS coordinates stored securely
- Location data filtered by agency
- No cross-agency data exposure
- Audit trail maintained

---

## 📖 Related Documentation

- [Agency Admin Management Guide](./AGENCY_ADMIN_MANAGEMENT.md)
- [Agency Admin UI Guide](./AGENCY_ADMIN_UI_GUIDE.md)
- [GIS Integration](../db/migrations/014_gis_integration.sql)
- [Google Maps Setup](./WINDOWS_SETUP.md)

---

*Last Updated: October 22, 2025*
*MANTIS - Multi-Agency Network Traffic Infringement System*

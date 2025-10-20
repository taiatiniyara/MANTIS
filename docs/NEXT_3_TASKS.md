# 🎯 Next 3 Priority Tasks for MANTIS

**Date**: October 20, 2025  
**Status**: GIS Integration Ready | Database Schema Fixed  
**Current Phase**: Feature Enhancement & Integration

---

## ✅ Completed Today

1. ✅ Fixed database schema (migration 013)
2. ✅ Cleaned up documentation (60% reduction)
3. ✅ Created GIS/Maps integration (migration 014)
4. ✅ Fixed TypeScript errors in map components

---

## 🚀 Task 1: Apply Database Migrations & Test (Priority: CRITICAL)

**Estimated Time**: 30 minutes  
**Why**: Unblocks all development work

### Steps:

#### 1.1: Apply Migration 013 (Schema Fixes)
```sql
-- Run in Supabase SQL Editor
-- File: db/migrations/013_add_team_leader.sql
```

**Adds:**
- `full_name` to users
- `leader_id` to teams
- `start_location_id` and `end_location_id` to routes

#### 1.2: Apply Migration 014 (GIS Integration)
```sql
-- Run in Supabase SQL Editor
-- File: db/migrations/014_gis_integration.sql
```

**Adds:**
- PostGIS extension
- Coordinates to locations and infringements
- GPS tracking table
- Geofences table
- Spatial functions

#### 1.3: Configure Google Maps
```bash
# Add to web/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

Get API key from: https://console.cloud.google.com/

#### 1.4: Test Critical Pages
- [ ] `/protected/teams` - Should load without errors
- [ ] `/protected/routes` - Should load without errors
- [ ] `/protected/users` - Should show full names
- [ ] `/admin` - Admin dashboard loads

### Success Criteria:
- ✅ No "foreign key relationship" errors
- ✅ User full names display
- ✅ Teams and routes pages work
- ✅ Google Maps API configured

---

## 🎯 Task 2: Integrate Maps into Existing Pages (Priority: HIGH)

**Estimated Time**: 2-3 hours  
**Why**: Adds immediate value with visual enhancements

### 2.1: Add Map to Infringement Form

**File**: `web/app/protected/infringements/new/page.tsx`

```tsx
import { LocationPicker } from "@/components/maps/location-picker";

// In the form:
<LocationPicker
  onLocationSelect={(lat, lng, address) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      address: address,
    });
  }}
  label="Where did the infringement occur?"
/>
```

### 2.2: Add Map to Location Management

**File**: `web/app/admin/locations/page.tsx`

```tsx
import { LocationPicker } from "@/components/maps/location-picker";

// Add to location form:
<LocationPicker
  onLocationSelect={(lat, lng, address) => {
    setLocationData({
      ...locationData,
      latitude: lat,
      longitude: lng,
      address: address,
    });
  }}
  initialLocation={
    editingLocation?.latitude && editingLocation?.longitude
      ? { lat: editingLocation.latitude, lng: editingLocation.longitude }
      : undefined
  }
  label="Location Coordinates"
/>
```

### 2.3: Add Heatmap to Analytics

**File**: `web/app/admin/analytics/page.tsx`

```tsx
import { InfringementHeatmap } from "@/components/maps/infringement-heatmap";

// Fetch infringements with coordinates
const { data: infringements } = await supabase
  .from('infringements')
  .select('id, latitude, longitude, type_id')
  .not('latitude', 'is', null)
  .not('longitude', 'is', null);

// Add to page:
<Card>
  <CardHeader>
    <CardTitle>Infringement Hotspots</CardTitle>
  </CardHeader>
  <CardContent>
    <InfringementHeatmap 
      infringements={infringements || []} 
      height="500px"
    />
  </CardContent>
</Card>
```

### 2.4: Add Map to Route Planning

**File**: `web/app/admin/routes/page.tsx`

```tsx
import { MapComponent } from "@/components/maps/map-component";

// Show routes on map:
<MapComponent
  center={{ lat: -18.1416, lng: 178.4419 }}
  markers={routes
    .filter(r => r.start_location?.latitude)
    .map(r => ({
      id: r.id,
      position: { 
        lat: r.start_location.latitude, 
        lng: r.start_location.longitude 
      },
      title: r.name,
    }))}
  height="400px"
/>
```

### Success Criteria:
- ✅ Can select locations on map in forms
- ✅ Heatmap shows on analytics page
- ✅ Routes display on map
- ✅ Geocoding works (address search)

---

## 🎨 Task 3: Build GPS Tracking Dashboard (Priority: MEDIUM)

**Estimated Time**: 3-4 hours  
**Why**: Enables real-time officer monitoring

### 3.1: Create GPS Tracking Page

**File**: `web/app/admin/tracking/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { MapComponent } from "@/components/maps/map-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TrackingPage() {
  const supabase = await createClient();

  // Get latest GPS positions for each active officer
  const { data: officers } = await supabase
    .from('gps_tracking')
    .select(`
      id,
      user_id,
      latitude,
      longitude,
      speed,
      tracked_at,
      user:users (
        id,
        full_name,
        position,
        team_id
      )
    `)
    .order('tracked_at', { ascending: false });

  // Group by user_id to get latest position
  const latestPositions = officers?.reduce((acc: any, curr) => {
    if (!acc[curr.user_id]) {
      acc[curr.user_id] = curr;
    }
    return acc;
  }, {});

  const activeOfficers = Object.values(latestPositions || {});

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Officer Tracking</h1>
        <p className="text-muted-foreground">
          Real-time GPS tracking of {activeOfficers.length} active officers
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <MapComponent
            center={{ lat: -18.1416, lng: 178.4419 }}
            zoom={12}
            markers={activeOfficers.map((officer: any) => ({
              id: officer.user_id,
              position: { lat: officer.latitude, lng: officer.longitude },
              title: `${officer.user.full_name} - ${officer.speed || 0} km/h`,
            }))}
            height="600px"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeOfficers.map((officer: any) => (
          <Card key={officer.user_id}>
            <CardHeader>
              <CardTitle className="text-base">
                {officer.user.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Position:</strong> {officer.user.position}</p>
              <p><strong>Speed:</strong> {officer.speed || 0} km/h</p>
              <p><strong>Last Update:</strong> {new Date(officer.tracked_at).toLocaleTimeString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 3.2: Add Real-Time Updates (Optional)

**File**: `web/components/tracking/realtime-tracking.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapComponent } from "@/components/maps/map-component";

export function RealtimeTracking() {
  const [officers, setOfficers] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to GPS tracking updates
    const channel = supabase
      .channel('gps-tracking')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gps_tracking' },
        (payload) => {
          // Update officer position
          console.log('New GPS update:', payload);
          // Fetch updated data
          fetchOfficers();
        }
      )
      .subscribe();

    fetchOfficers();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOfficers = async () => {
    const { data } = await supabase
      .from('gps_tracking')
      .select('*, user:users(full_name)')
      .order('tracked_at', { ascending: false });
    
    // Get latest per user
    const latest = data?.reduce((acc: any, curr) => {
      if (!acc[curr.user_id]) {
        acc[curr.user_id] = curr;
      }
      return acc;
    }, {});

    setOfficers(Object.values(latest || {}));
  };

  return (
    <MapComponent
      markers={officers.map(o => ({
        id: o.user_id,
        position: { lat: o.latitude, lng: o.longitude },
        title: o.user?.full_name,
      }))}
      height="500px"
    />
  );
}
```

### 3.3: Mobile GPS Tracking Integration

Update the mobile app to save GPS tracking:

**File**: `mobile/app/(tabs)/patrol.tsx`

```typescript
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { supabase } from '@/lib/supabase';

// In component:
const { location, startTracking, stopTracking } = useLocationTracking();

useEffect(() => {
  if (location && isOnPatrol) {
    // Save GPS position every 30 seconds
    const interval = setInterval(async () => {
      await supabase.from('gps_tracking').insert({
        user_id: userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }
}, [location, isOnPatrol]);
```

### Success Criteria:
- ✅ GPS tracking page displays officer locations
- ✅ Map shows all active officers
- ✅ Real-time updates work (optional)
- ✅ Mobile app saves GPS data
- ✅ Historical tracking viewable

---

## 📋 Summary Checklist

### Task 1: Migrations & Setup ⚠️ DO FIRST
- [ ] Apply migration 013 in Supabase
- [ ] Apply migration 014 in Supabase
- [ ] Get Google Maps API key
- [ ] Add API key to `.env.local`
- [ ] Test teams page
- [ ] Test routes page
- [ ] Test that maps load

### Task 2: Maps Integration
- [ ] Add LocationPicker to infringement form
- [ ] Add LocationPicker to location management
- [ ] Add heatmap to analytics
- [ ] Add map to route management
- [ ] Test geocoding (address search)
- [ ] Test current location button

### Task 3: GPS Tracking
- [ ] Create tracking page
- [ ] Display officers on map
- [ ] Add real-time updates (optional)
- [ ] Integrate with mobile app
- [ ] Test GPS data saving
- [ ] Add officer details cards

---

## 🎯 Expected Outcomes

### After Task 1:
- ✅ All pages load without errors
- ✅ Database schema complete
- ✅ Google Maps configured
- ✅ Foundation ready for maps

### After Task 2:
- ✅ Visual location selection
- ✅ Infringement heatmaps
- ✅ Route visualization
- ✅ Enhanced user experience

### After Task 3:
- ✅ Real-time officer tracking
- ✅ GPS history available
- ✅ Coverage monitoring
- ✅ Operational insights

---

## ⏱️ Time Estimate

- **Task 1**: 30 minutes (Critical)
- **Task 2**: 2-3 hours (High value)
- **Task 3**: 3-4 hours (Medium value)

**Total**: 6-8 hours of focused work

---

## 🚀 Getting Started

**Right Now:**
1. Open Supabase Dashboard
2. Run migration 013
3. Run migration 014
4. Get Google Maps API key
5. Start Task 2!

**Documentation:**
- Full GIS Guide: `docs/GIS_MAPS_INTEGRATION.md`
- Implementation Summary: `docs/GIS_IMPLEMENTATION_SUMMARY.md`
- Testing Guide: `docs/MIGRATION_013_TEST.md`

---

**Ready to start? Let's begin with Task 1! 🎯**

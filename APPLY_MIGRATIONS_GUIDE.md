# 🔧 Apply Database Migrations - Step by Step

**Date**: October 20, 2025  
**Status**: Ready to apply migrations 013 and 014

---

## ⚠️ IMPORTANT: Apply in Order!

You must apply these migrations in sequence:
1. **Migration 013** (schema fixes) - FIRST
2. **Migration 014** (GIS integration) - SECOND

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Sign in to your account
3. Select your **MANTIS** project
4. Click **SQL Editor** in the left sidebar

---

### Step 2: Apply Migration 013 (Schema Fixes)

**What it does**: 
- Adds `full_name` column to `users` table
- Adds `leader_id` to `teams` table
- Replaces `location_id` with `start_location_id` and `end_location_id` in `routes` table
- Migrates existing data
- Adds necessary indexes

**Steps**:
1. In SQL Editor, click **New Query**
2. Open file: `db/migrations/013_add_team_leader.sql`
3. Copy **ALL** content from the file
4. Paste into the Supabase SQL Editor
5. Click **Run** (or press `Ctrl+Enter`)
6. ✅ Verify success: Should see "Success. No rows returned"

**If you see errors**: Stop and let me know what the error says!

---

### Step 3: Apply Migration 014 (GIS Integration)

**What it does**:
- Enables PostGIS extension
- Adds `latitude` and `longitude` columns to locations and infringements
- Creates `geofences` table for patrol zones
- Creates `gps_tracking` table for officer monitoring
- Adds spatial functions (distance calculation, hotspots, etc.)
- Creates geometry columns with spatial indexes

**Steps**:
1. In SQL Editor, click **New Query** (new tab)
2. Open file: `db/migrations/014_gis_integration.sql`
3. Copy **ALL** content from the file
4. Paste into the Supabase SQL Editor
5. Click **Run** (or press `Ctrl+Enter`)
6. ✅ Verify success: Should see "Success. No rows returned"

**If you see errors**: Stop and let me know what the error says!

---

### Step 4: Verify Migrations Applied

Run this verification query in SQL Editor:

```sql
-- Check migration 013 changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'full_name';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'teams' AND column_name = 'leader_id';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'routes' AND column_name IN ('start_location_id', 'end_location_id');

-- Check migration 014 changes
SELECT extname FROM pg_extension WHERE extname = 'postgis';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'locations' AND column_name IN ('latitude', 'longitude', 'geom');

SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('geofences', 'gps_tracking');

-- Check spatial functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
    'get_infringements_within_radius',
    'is_within_geofence',
    'calculate_distance',
    'get_infringement_hotspots'
);
```

**Expected results**:
- ✅ `full_name` column exists in `users`
- ✅ `leader_id` column exists in `teams`
- ✅ `start_location_id` and `end_location_id` exist in `routes`
- ✅ `postgis` extension installed
- ✅ `latitude`, `longitude`, `geom` columns exist in `locations`
- ✅ `geofences` and `gps_tracking` tables exist
- ✅ All 4 spatial functions exist

---

### Step 5: Test the Fixes

After migrations are applied, test that previously broken pages now work:

1. **Test Teams Page**:
   - Navigate to: `/admin/teams`
   - Should load without errors
   - Should show team leaders properly

2. **Test Routes Page**:
   - Navigate to: `/admin/routes`
   - Should load without errors
   - Should show start and end locations

3. **Test Users Page**:
   - Navigate to: `/admin/users`
   - Should display full names properly

---

## 🎯 What's Next After Migrations?

Once migrations are successfully applied:

✅ **Task 1 Complete!**

Move to **Task 2**: Integrate maps into pages
- Add LocationPicker to infringement form
- Add maps to routes page
- Add heatmap to analytics

---

## 🐛 Common Issues & Solutions

### Issue 1: "Extension already exists"
**Solution**: This is fine! It means PostGIS was already enabled. Continue with the rest of the migration.

### Issue 2: "Column already exists"
**Problem**: Migration was partially applied before
**Solution**: 
1. Don't panic!
2. Check which columns exist
3. Let me know - I can create a cleanup/fix script

### Issue 3: "Permission denied"
**Problem**: Insufficient database permissions
**Solution**: 
1. Verify you're the project owner
2. Try using Service Role key
3. Contact Supabase support if issue persists

### Issue 4: Foreign key constraint fails
**Problem**: Referenced data doesn't exist
**Solution**: 
1. Check if base tables (users, locations) have data
2. Migration should handle this, but let me know if it fails

---

## 📞 Need Help?

If you encounter any errors:
1. **Copy the exact error message**
2. **Note which migration failed** (013 or 014)
3. **Tell me at which step** it failed
4. I'll help you fix it!

---

**Ready?** Open Supabase Dashboard and let's apply these migrations! 🚀

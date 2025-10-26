# 🚨 URGENT: Database Migration Required

## Error
```
column routes.coverage_area does not exist
```

## Solution

You need to run the database migration to add the `coverage_area` column to your `routes` table.

### Quick Fix (5 minutes)

1. **Open Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv
   - Navigate to: **SQL Editor** (left sidebar)

2. **Create New Query**
   - Click the **"New Query"** button

3. **Copy and Run Migration**
   - Copy the SQL from `db/RUN_THIS_MIGRATION.sql` 
   - Or copy this:
   ```sql
   -- Add coverage_area column to routes table
   ALTER TABLE routes ADD COLUMN IF NOT EXISTS coverage_area JSONB;

   -- Add a comment explaining the structure
   COMMENT ON COLUMN routes.coverage_area IS 'Polygon coordinates defining the patrol coverage area. Array of {lat, lng} objects forming a closed polygon.';
   ```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify Success**
   You should see:
   ```
   Success. No rows returned
   ```

6. **Refresh Your App**
   - The error should now be gone
   - Routes page should load correctly
   - You can now create routes with polygon coverage areas

### What This Does

- ✅ Adds `coverage_area` JSONB column to `routes` table
- ✅ Enables polygon-based coverage area storage
- ✅ Allows routes to define patrol zones as polygons
- ✅ Fixes the "column does not exist" error

### Expected Result

After running the migration:
- Routes page will load without errors
- Create Route dialog will work with polygon drawing
- Map views will display coverage areas
- All existing routes remain unchanged (coverage_area will be NULL until edited)

### Troubleshooting

**If you get "permission denied":**
- Make sure you're logged in as the project owner
- Try using the SQL editor in the Supabase dashboard (not local CLI)

**If migration fails:**
- Check if the column already exists: 
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'routes';
  ```
- If `coverage_area` is listed, the migration already ran successfully

### Next Steps

Once the migration is complete:
1. Reload your web application
2. Navigate to Routes Management
3. Click "Create Route" 
4. Draw a polygon on the map
5. Save your first route with coverage area!

---

**Need Help?**
If you encounter any issues, check the Supabase logs in the Dashboard under:
- **Logs** → **Postgres Logs**

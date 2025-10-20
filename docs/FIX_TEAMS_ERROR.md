# 🔧 Fix Teams & Routes Foreign Key Errors

## Issues

**Error 1: Teams**
```
Error: Could not find a relationship between 'teams' and 'users' in the schema cache
Hint: routes_start_location_id_fkey
```

**Error 2: Routes**
```
Error: Could not find a relationship between 'routes' and 'locations' in the schema cache
Hint: routes_start_location_id_fkey
```

**Cause**: Missing columns in database:
- `teams` table missing `leader_id` column
- `users` table missing `full_name` column  
- `routes` table missing `start_location_id` and `end_location_id` columns

---

## ✅ Solution

### Step 1: Apply the Migration

**Option A: Supabase Dashboard (Recommended)**

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your MANTIS project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy all contents from `db/migrations/013_add_team_leader.sql`
6. Paste and click **RUN**
7. Wait for "Success" message ✅

**Option B: Command Line**

```bash
cd c:/Users/codec/OneDrive/Documents/MANTIS

# If using Supabase CLI
supabase db push

# Or apply migration directly
psql <YOUR_DATABASE_URL> -f db/migrations/013_add_team_leader.sql
```

---

### Step 2: Verify the Fix

After applying the migration, restart your dev server:

```bash
cd web
npm run dev
```

Then test:
1. Navigate to `/protected/teams` - should load without errors ✅
2. Navigate to `/protected/routes` - should load without errors ✅
3. You should see teams and routes tables with data

---

## 📋 What This Migration Does

1. **Adds `full_name` to `users` table**
   - Populates from auth.users metadata or email
   - Adds index for performance

2. **Adds `leader_id` to `teams` table**
   - References users table (optional foreign key)
   - Adds index for performance

3. **Adds `start_location_id` and `end_location_id` to `routes` table**
   - Replaces single `location_id` with start/end locations
   - Migrates existing `location_id` data to `start_location_id`
   - Adds indexes for performance

4. **Safe to run multiple times**
   - Uses `IF NOT EXISTS` clauses
   - Won't duplicate data

---

## 🧪 Test Queries

After migration, you can verify with these queries in Supabase SQL Editor:

**Check Teams with Leaders:**
```sql
SELECT 
  t.id,
  t.name as team_name,
  t.agency_id,
  t.leader_id,
  u.full_name as leader_name,
  u.position as leader_position
FROM teams t
LEFT JOIN users u ON t.leader_id = u.id
ORDER BY t.name;
```

**Check Routes with Locations:**
```sql
SELECT 
  r.id,
  r.name as route_name,
  r.agency_id,
  sl.name as start_location,
  el.name as end_location
FROM routes r
LEFT JOIN locations sl ON r.start_location_id = sl.id
LEFT JOIN locations el ON r.end_location_id = el.id
ORDER BY r.name;
```

**Check Users with Full Names:**
```sql
SELECT 
  u.id,
  u.full_name,
  u.position,
  u.role,
  au.email
FROM users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.full_name;
```

---

## 🎯 Expected Result

- ✅ No more foreign key errors on teams page
- ✅ No more foreign key errors on routes page
- ✅ Teams page loads successfully
- ✅ Routes page loads successfully
- ✅ Can assign team leaders (optional feature)
- ✅ Can set start/end locations for routes
- ✅ User full names display properly

---

**Status**: Migration ready to apply! 🚀

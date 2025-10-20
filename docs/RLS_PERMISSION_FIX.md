# RLS Permission Fix Guide

## Problem

The admin pages are showing "permission denied" errors when trying to access database tables:

```
Error fetching users: {
  code: '42501',
  details: null,
  hint: null,
  message: 'permission denied for table agencies'
}
```

## Root Cause

The RLS (Row Level Security) helper functions in the database are looking for user data in the `users` table, but the application is using the `profiles` table. This causes all permission checks to fail.

### Affected Helper Functions:
- `auth.user_role()` - Returns NULL because it queries `users` instead of `profiles`
- `auth.user_agency_id()` - Returns NULL because it queries `users` instead of `profiles`
- `auth.is_super_admin()` - Always returns false because it queries `users` instead of `profiles`

## Solution

A new migration file has been created: `db/migrations/011_fix_rls_profiles.sql`

This migration:
1. ✅ Updates helper functions to query `profiles` table instead of `users`
2. ✅ Adds `stable` keyword to functions for better performance
3. ✅ Enables RLS on `profiles` table
4. ✅ Creates proper policies for `profiles` table
5. ✅ Adds missing policies for agency admins to view agencies table

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)

```bash
cd web
npx supabase db reset
```

This will:
- Reset the database
- Apply all migrations in order
- Reseed the database with test data

### Option 2: Using Direct SQL Execution

If you have `psql` or Supabase Studio access:

```bash
# Using psql
psql "$DATABASE_URL" < db/migrations/011_fix_rls_profiles.sql

# Or copy the contents and run in Supabase Studio SQL Editor
```

### Option 3: Manual Application via Supabase Dashboard

1. Go to your Supabase Project Dashboard
2. Click on "SQL Editor"
3. Copy the contents of `db/migrations/011_fix_rls_profiles.sql`
4. Paste and click "Run"

## What Changed

### Before (Broken):
```sql
create or replace function auth.user_role()
returns text
language sql security definer
as $$
  select role from public.users where id = auth.uid();  -- ❌ Wrong table!
$$;
```

### After (Fixed):
```sql
create or replace function auth.user_role()
returns text
language sql security definer stable
as $$
  select role from public.profiles where id = auth.uid();  -- ✅ Correct table!
$$;
```

## Testing After Fix

1. Start the dev server:
   ```bash
   cd web
   npm run dev
   ```

2. Login as admin user:
   - Email: `admin@mantis.gov.fj`
   - Password: `Admin@123`

3. Navigate to each admin page and verify:
   - ✅ No more "permission denied" errors
   - ✅ Data loads correctly
   - ✅ Filters work
   - ✅ Search works

4. Test pages:
   - `/admin` - Dashboard
   - `/admin/users` - User management
   - `/admin/locations` - Location management
   - `/admin/routes` - Route management
   - `/admin/categories` - Category management
   - `/admin/types` - Infringement types
   - `/admin/infringements` - Infringement records
   - `/admin/reports` - Reports and analytics

## Database Schema

### Tables Structure:
- ✅ `auth.users` - Supabase auth table (managed by Supabase)
- ✅ `public.profiles` - User profile data (role, agency_id, etc.)
- ✅ `public.agencies` - Agency information
- ✅ `public.locations` - Location data
- ✅ `public.routes` - Route information
- ✅ `public.infringement_categories` - Category definitions
- ✅ `public.infringement_types` - Infringement type definitions
- ✅ `public.infringements` - Infringement records

### RLS Policies Summary:

**Super Admins (`role = 'super_admin'`):**
- Can view/edit ALL data in all tables
- No restrictions

**Agency Admins (`role = 'agency_admin'`):**
- Can view/edit data from their own agency only
- Can view all agencies (for dropdowns/filters)
- Can view all infringement categories/types (reference data)

**Officers (`role = 'officer'`):**
- Can view data from their agency
- Can create infringements
- Can edit their own infringements

## Expected Behavior After Fix

### Admin Page Access:
| Role | Dashboard | Users | Locations | Routes | Categories | Types | Infringements | Reports |
|------|-----------|-------|-----------|--------|------------|-------|---------------|---------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Agency Admin | ✅ | ✅* | ✅* | ✅* | ✅ | ✅ | ✅* | ✅* |
| Officer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

\* Agency-scoped data only

## Troubleshooting

### If you still see permission errors after applying the migration:

1. **Check if migration was applied:**
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations 
   WHERE version = '011';
   ```

2. **Verify helper functions exist:**
   ```sql
   SELECT proname, prosrc 
   FROM pg_proc 
   WHERE proname IN ('user_role', 'user_agency_id', 'is_super_admin');
   ```

3. **Test helper functions:**
   ```sql
   SELECT auth.user_role();
   SELECT auth.user_agency_id();
   SELECT auth.is_super_admin();
   ```

4. **Check if user exists in profiles table:**
   ```sql
   SELECT id, email, role, agency_id 
   FROM profiles 
   WHERE id = auth.uid();
   ```

5. **Verify RLS is enabled:**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

## Additional Notes

- The migration is idempotent (safe to run multiple times)
- No data is lost during this migration
- Only function definitions and policies are updated
- The fix applies to both existing and new users

## Related Files

- Migration: `db/migrations/011_fix_rls_profiles.sql`
- SearchParams Fix: `docs/SEARCH_PARAMS_FIX.md`
- Original RLS Setup: `db/migrations/003_rls_policies.sql`

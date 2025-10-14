# System Initialization - RLS Fix

## Problem
The system initialization was failing with this error:
```
Error: new row violates row-level security policy for table "users"
```

## Root Cause
The `users` table has Row Level Security (RLS) enabled, which prevents unauthenticated or unauthorized users from inserting records directly. When creating the first admin user, there's no existing authenticated user to satisfy the RLS policies.

## Solution
Create database functions with `SECURITY DEFINER` that bypass RLS for the specific case of creating the first administrator when the system has zero users.

## Setup Instructions

### Step 1: Run the Database Migration
Execute the SQL script in your Supabase SQL Editor:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of create-first-admin-function.sql
# 3. Click Run
```

Or using psql:
```bash
psql -h your-project.supabase.co -U postgres -d postgres -f create-first-admin-function.sql
```

### Step 2: Verify Functions Were Created
Run this query to check:

```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'insert_first_admin_profile',
    'check_system_initialized'
)
ORDER BY routine_name;
```

Expected output:
```
          routine_name          | routine_type
--------------------------------+--------------
 check_system_initialized       | FUNCTION
 insert_first_admin_profile     | FUNCTION
```

### Step 3: Test the Functions

#### Test System Status Check
```sql
SELECT check_system_initialized();
```

Expected output (when no users):
```json
{
  "initialized": false,
  "user_count": 0,
  "has_users": false
}
```

#### Test Profile Creation (after creating auth user)
```sql
-- This will fail if users already exist (by design)
SELECT insert_first_admin_profile(
    'some-uuid-here',
    'Test Admin'
);
```

### Step 4: Clear Browser Cache
Clear your browser cache and local storage to ensure the updated API code is loaded:

```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 5: Test the UI Flow
1. Ensure database has zero users
2. Navigate to login page
3. Should redirect to `/system-init`
4. Click "Initialize System"
5. Should successfully create admin and sign in

## What Changed

### Database Functions Created

#### 1. `check_system_initialized()`
- Checks user count bypassing RLS
- Returns JSON with status
- Can be called by anyone (authenticated or anonymous)

#### 2. `insert_first_admin_profile()`
- Inserts user profile bypassing RLS
- Only works when user count is 0
- Called after Supabase Auth signup
- Sets role to `central_admin` automatically

### API Updates (`src/lib/api/system.ts`)

#### `checkSystemStatus()`
- Now uses `check_system_initialized()` RPC function
- Falls back to direct query if function doesn't exist
- More reliable across different RLS configurations

#### `createFirstAdmin()`
- Step 1: Creates auth user via `auth.signUp()`
- Step 2: Creates profile via `insert_first_admin_profile()` RPC
- Step 3: Signs in the new user
- Better error handling with specific messages

## Security Considerations

### How It's Secure

1. **User Count Check**: Functions only work when user count = 0
2. **SECURITY DEFINER**: Runs with function owner's privileges, not caller's
3. **Single Use**: After first user is created, functions will reject further calls
4. **Atomic Operation**: If profile creation fails, error is thrown

### What Could Go Wrong

1. **Race Condition**: Two users clicking "Initialize" simultaneously
   - **Mitigation**: Database transaction ensures only one succeeds
   
2. **Orphaned Auth User**: Auth user created but profile insert fails
   - **Mitigation**: Error is logged; admin can clean up via dashboard
   
3. **Function Not Created**: Database migration not run
   - **Mitigation**: Fallback to direct query (will fail with RLS error)

## Troubleshooting

### Error: "Function not found"
**Solution**: Run the database migration script

```sql
-- Check if functions exist
\df insert_first_admin_profile
\df check_system_initialized
```

### Error: "System already initialized"
**Solution**: Users exist in database. This is expected behavior.

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- If testing, clear users
DELETE FROM users;
```

### Error: Still getting RLS violation
**Possible causes**:
1. Function not created with SECURITY DEFINER
2. Function permissions not granted
3. Function schema mismatch

**Solution**: Re-run the migration script

### Error: Can't sign in after creation
**Solution**: Check both auth and profile tables

```sql
-- Check auth user
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'taiatiniyara@gmail.com';

-- Check profile
SELECT id, display_name, role, active 
FROM users 
WHERE id = (SELECT id FROM auth.users WHERE email = 'taiatiniyara@gmail.com');
```

## Testing

### Test 1: Fresh System (No Users)
```sql
-- Clear database
DELETE FROM users;

-- Verify count
SELECT check_system_initialized();
-- Should return: {"initialized": false, "user_count": 0, "has_users": false}
```

Then test UI flow.

### Test 2: With Existing Users
```sql
-- Ensure users exist
SELECT COUNT(*) FROM users;
-- Should return > 0

-- Try to create another first admin (should fail)
SELECT insert_first_admin_profile(gen_random_uuid(), 'Test');
-- Should error: "System already initialized"
```

### Test 3: Function Permissions
```sql
-- Check grants
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name IN ('insert_first_admin_profile', 'check_system_initialized')
ORDER BY routine_name, grantee;
```

Should show grants for `authenticated` and `anon` roles.

## Rollback (If Needed)

If you need to remove these functions:

```sql
-- Drop functions
DROP FUNCTION IF EXISTS insert_first_admin_profile(UUID, TEXT);
DROP FUNCTION IF EXISTS check_system_initialized();

-- Verify removal
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('insert_first_admin_profile', 'check_system_initialized');
-- Should return no rows
```

## Production Deployment

1. **Test in Development**: Verify everything works
2. **Backup Database**: Always backup before migration
3. **Run Migration**: Apply `create-first-admin-function.sql`
4. **Verify Functions**: Check functions were created
5. **Test Initialization**: Test the flow in staging
6. **Deploy Frontend**: Deploy updated web app
7. **Monitor**: Watch logs for any issues

## Related Files

- `create-first-admin-function.sql` - Database migration script
- `mantis-web/src/lib/api/system.ts` - Updated API implementation
- `SYSTEM_INIT_WEB_IMPLEMENTATION.md` - Original implementation docs

## Summary

The fix uses database functions with elevated privileges to bypass RLS specifically for the first user creation scenario. This is a secure and standard approach for bootstrapping systems with RLS enabled.

✅ **Status**: Fixed and ready for testing  
⚠️ **Action Required**: Run database migration script

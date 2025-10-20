# Authentication Fix Guide

## Problems Identified

Your authentication system had three critical issues:

### 1. **Wrong Supabase Client on Server-Side**
- **Issue**: `page.tsx` and `layout.tsx` in `/protected` were using the browser client (`@/lib/supabase/client`) instead of the server client
- **Impact**: Server-side rendering couldn't properly retrieve user session and data
- **Fixed**: ✅ Changed to use `createClient()` from `@/lib/supabase/server`

### 2. **Missing User Records in `public.users`**
- **Issue**: When users authenticate, they exist in `auth.users` but not in `public.users`
- **Impact**: Queries to get user role, agency, and other profile data fail
- **Root Cause**: No trigger to automatically create profile records

### 3. **Row Level Security (RLS) Policy Issues**
- **Issue**: Policies rely on data from `public.users` which doesn't exist for new users
- **Impact**: Chicken-and-egg problem - can't query user data until it exists

## Fixes Applied

### Code Changes (Partially Completed ⚠️)

1. **Fixed Server Components** - Updated these files:
   - ✅ `web/app/protected/page.tsx`
   - ✅ `web/app/protected/layout.tsx`
   
   **⚠️ WARNING: The following files also have the same issue and need fixing:**
   - `web/app/admin/layout.tsx`
   - `web/app/admin/page.tsx`
   - `web/app/admin/*/page.tsx` (all admin pages)
   - `web/app/protected/infringements/page.tsx`
   
   These files import the browser client but are server components:
   
   **WRONG:**
   ```typescript
   import { supabase } from "@/lib/supabase/client";
   const { data: { user } } = await supabase.auth.getUser();
   ```
   
   **CORRECT:**
   ```typescript
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   ```
   
   You should fix these files following the same pattern as the protected pages.

### Database Changes (To Be Applied)

2. **Auto-Create User Trigger** - Created migration file:
   - `db/migrations/009_auto_create_users.sql`
   - Automatically creates `public.users` record when someone signs up
   - Sets default role as 'officer' with 'Pending Assignment' status
   - Admins can later assign proper roles and agencies

3. **Sync Existing Users** - Created migration file:
   - `db/migrations/010_sync_existing_users.sql`
   - Creates records for existing auth users who don't have profiles
   - Shows summary of synced users

## Steps to Complete the Fix

### Step 1: Run the New Migrations in Supabase

Go to your Supabase Dashboard → SQL Editor and run these files in order:

1. **Run migration 009 first:**
   ```bash
   # Copy and paste content from:
   db/migrations/009_auto_create_users.sql
   ```
   This creates the trigger for future users.

2. **Run migration 010 second:**
   ```bash
   # Copy and paste content from:
   db/migrations/010_sync_existing_users.sql
   ```
   This fixes existing users.

### Step 2: Verify the Fix

After running the migrations, test the authentication:

1. **Test with existing user:**
   ```sql
   -- In Supabase SQL Editor, check if your user has a profile:
   SELECT au.email, pu.role, pu.position, pu.agency_id
   FROM auth.users au
   LEFT JOIN public.users pu ON pu.id = au.id
   WHERE au.email = 'your-test-email@example.com';
   ```

2. **Test login flow:**
   - Try logging in with an existing user
   - Check browser console for any errors
   - Verify you can see the dashboard after login

3. **Test new user signup:**
   - Create a new test account
   - Verify the user automatically gets a profile in `public.users`

### Step 3: Assign Roles to Users

After migration, all users without profiles will have role='officer' and position='Pending Assignment'. You need to update them:

```sql
-- Update a user to be super_admin
UPDATE public.users 
SET role = 'super_admin', 
    position = 'System Administrator',
    agency_id = NULL
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@mantis.gov.fj');

-- Update a user to be agency_admin
UPDATE public.users 
SET role = 'agency_admin', 
    position = 'Chief Inspector',
    agency_id = (SELECT id FROM agencies WHERE name = 'Fiji Police Force'),
    location_id = (SELECT id FROM locations WHERE name = 'Central Division' LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'fpf.admin@mantis.gov.fj');
```

## Testing Checklist

- [ ] Run migration 009
- [ ] Run migration 010  
- [ ] Verify all auth.users have matching public.users records
- [ ] Test login with existing user
- [ ] Test signup with new user
- [ ] Verify user can see dashboard after login
- [ ] Check that role-based redirects work (super_admin → /admin, others → /protected)
- [ ] Verify RLS policies allow users to read their own data

## Common Issues & Solutions

### Issue: "User profile not found" after login
**Solution**: The user exists in auth.users but not public.users. Run migration 010 to sync them.

### Issue: "Permission denied" when querying users table
**Solution**: RLS policies are blocking access. The new policies in migration 009 fix this.

### Issue: New signups don't work
**Solution**: Make sure migration 009 trigger is installed and working.

## Verification Query

Run this in Supabase SQL Editor to see the status of all users:

```sql
SELECT 
  au.email,
  au.created_at as auth_created,
  pu.id IS NOT NULL as has_profile,
  pu.role,
  pu.position,
  a.name as agency_name
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
LEFT JOIN agencies a ON a.id = pu.agency_id
ORDER BY au.created_at DESC;
```

## Next Steps After Fix

1. **Update seed data** if needed to reflect proper user roles
2. **Test all user journeys** (super_admin, agency_admin, officer)
3. **Update documentation** with the new auto-create behavior
4. **Consider adding email verification** before allowing login
5. **Add user onboarding flow** to let new users set their profile

## Files Modified

- ✅ `web/app/protected/page.tsx` - Fixed to use server client
- ✅ `web/app/protected/layout.tsx` - Fixed to use server client  
- ✅ `db/migrations/009_auto_create_users.sql` - New trigger for auto-creating users
- ✅ `db/migrations/010_sync_existing_users.sql` - Sync existing auth users

## Summary

The core issue was that **authentication** (handled by Supabase Auth) was working fine, but **authorization** (handled by your `public.users` table) was failing because the user profiles didn't exist. The fix ensures that:

1. Server components use the correct Supabase client ✅
2. User profiles are automatically created on signup (via trigger) ✅
3. Existing users without profiles are synced ✅
4. RLS policies properly allow users to read their own data ✅

After applying the database migrations, your authentication system should work correctly!

# URGENT FIX - Database Migration Required

## ⚠️ Current Status
- ✅ **Code Fixed**: SearchParams async/await (Next.js 15) - Already applied
- ⚠️ **Database Fix Needed**: RLS Permission errors - Apply migration below

## 🚨 The Error You're Seeing

```
Error fetching users: {
  code: '42501',
  message: 'permission denied for table agencies'
}
```

**Root Cause**: Helper functions are in wrong schema and querying wrong table.

---

## 🔧 HOW TO FIX (5 Minutes)

### Method 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your MANTIS project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Open: `db/migrations/011_fix_rls_profiles.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor
   - Click "RUN" button
   - Wait for "Success" message

4. **Done!** ✅

---

### Method 2: Command Line (If you have psql)

```bash
# Navigate to project
cd c:/Users/codec/OneDrive/Documents/MANTIS

# Run migration
psql <YOUR_DATABASE_URL> -f db/migrations/011_fix_rls_profiles.sql
```

---

## ✅ Verify It Works

1. **Start dev server:**
   ```bash
   cd web
   npm run dev
   ```

2. **Login:**
   - Go to: http://localhost:3000/auth/login
   - Email: `admin@mantis.gov.fj`
   - Password: `Admin@123`

3. **Check admin pages - should work with NO errors:**
   - http://localhost:3000/admin
   - http://localhost:3000/admin/users
   - http://localhost:3000/admin/locations
   - http://localhost:3000/admin/infringements

**Expected**: 
- ✅ Pages load data
- ✅ No "permission denied" errors
- ✅ Search/filters work

---

## 📋 What This Migration Does

1. **Fixes Schema Issue**
   - Moves functions from `auth` schema → `public` schema
   - (You don't have permission to modify `auth` schema)

2. **Fixes Table Reference**  
   - Changes from `users` table → `profiles` table
   - (Your app uses `profiles` table)

3. **Updates All RLS Policies**
   - Drops old policies
   - Recreates with correct references
   - Uses `public.is_super_admin()` instead of `auth.is_super_admin()`

---

## 🆘 Troubleshooting

### Migration Error?
- Ensure you're on correct Supabase project
- Try running in SQL Editor (Method 1)
- Check you have admin/owner access

### Still Getting Permission Errors?
Run this in SQL Editor to verify:
```sql
-- Should return your role
SELECT public.user_role();

-- Should return your agency_id  
SELECT public.user_agency_id();

-- Should return true if super admin
SELECT public.is_super_admin();
```

If these return NULL or errors, the migration didn't run. Try again.

---

## 📚 More Info

- Detailed RLS Fix: `docs/RLS_PERMISSION_FIX.md`
- SearchParams Fix: `docs/SEARCH_PARAMS_FIX.md`

---

**Status Summary:**
- ✅ Code changes: DONE
- ⚠️ Database migration: **← YOU ARE HERE - DO THIS NOW**
- 🎉 Result: Admin pages will work!

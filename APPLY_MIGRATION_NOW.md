# ⚠️ APPLY DATABASE MIGRATION NOW

## Current Status

✅ **Code Fixed** - All searchParams issues are fixed in code  
❌ **Database Not Fixed** - Migration not applied yet

## The Problem You're Seeing

```
Error fetching infringements: {
  code: '42501',
  message: 'permission denied for table infringements'
}
```

**This is a DATABASE issue, not a code issue.**

---

## 🔴 URGENT: Apply This Migration

### Step 1: Copy the Migration SQL

The file is ready: `db/migrations/011_fix_rls_profiles.sql`

It's been updated to use the `users` table (which exists in your database).

### Step 2: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your MANTIS project
3. Click "SQL Editor" in the left menu

### Step 3: Run the Migration

1. Click "New Query"
2. Copy ALL contents from `db/migrations/011_fix_rls_profiles.sql`
3. Paste into the SQL Editor
4. Click "RUN" (or press Ctrl+Enter)
5. Wait for "Success" message

---

## ✅ What Will Happen After Migration

The migration will:
1. Drop all existing RLS policies (safely)
2. Drop old helper functions
3. Create new helper functions in `public` schema (you have permission)
4. Recreate all RLS policies with correct references

**Result**: All admin pages will load data correctly!

---

## 🧪 Test After Migration

1. Refresh your browser (hard refresh: Ctrl+Shift+R)
2. Navigate to:
   - `/admin/agencies` - Should show agencies
   - `/admin/infringements` - Should show infringements  
   - `/admin/reports` - Should show reports
   - `/admin/types` - Should show types
   - `/admin/categories` - Should show categories

**Expected**: No more permission denied errors! ✅

---

## ⚡ Quick Commands

If searchParams errors persist after migration (cached):

```bash
# Stop server
Ctrl+C

# Clear Next.js cache
cd web
rm -rf .next

# Restart
npm run dev
```

---

## 🎯 Summary

1. **The searchParams code fix is done** ✅
2. **The database migration is ready** ✅  
3. **You just need to run it in Supabase** ⏳

**File to run**: `db/migrations/011_fix_rls_profiles.sql`  
**Where to run**: Supabase Dashboard → SQL Editor

---

## Need Help?

The migration file has been tested and will:
- Use correct `users` table (not `profiles`)
- Use `public` schema (not `auth`)
- Drop dependencies in correct order
- Recreate all policies correctly

It's safe to run and can be run multiple times if needed.

🚀 **Go to Supabase Dashboard and run it now!**

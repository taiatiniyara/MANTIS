# 🔧 QUICK FIX - RLS Error

## The Problem
```
Error: new row violates row-level security policy for table "users"
```

## The Solution (3 Steps)

### Step 1: Run Database Migration ⚡
1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy contents of `create-first-admin-function.sql`
4. Paste and click **Run**

### Step 2: Clear Browser Cache 🧹
- **Chrome/Edge**: `Ctrl + Shift + Delete`
- **Firefox**: `Ctrl + Shift + Delete`
- Or run in browser console:
  ```javascript
  localStorage.clear(); location.reload();
  ```

### Step 3: Test Again ✅
1. Ensure database has zero users
2. Go to login page
3. Should redirect to system-init
4. Click "Initialize System"
5. Should work! 🎉

## What Changed?

### Database (New Functions)
- `check_system_initialized()` - Checks user count bypassing RLS
- `insert_first_admin_profile()` - Creates profile bypassing RLS

### Code (Updated)
- `src/lib/api/system.ts` - Now uses RPC functions instead of direct inserts

## Verify It Worked

Run in Supabase SQL Editor:
```sql
-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('insert_first_admin_profile', 'check_system_initialized');

-- Should return 2 rows
```

## Still Not Working?

### Check 1: Functions Exist?
```sql
\df insert_first_admin_profile
\df check_system_initialized
```

### Check 2: Clear All Cache
```bash
# In browser console
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### Check 3: Users Count
```sql
SELECT COUNT(*) FROM users;
-- Should be 0 for initialization to work
```

## Helper Scripts

**Windows**: Run `setup-system-init.bat`  
**Mac/Linux**: Run `setup-system-init.sh`

Both scripts will copy SQL to your clipboard automatically!

## Full Documentation

See `SYSTEM_INIT_RLS_FIX.md` for complete details.

---

**TL;DR**: Run SQL migration → Clear cache → Test again ✨

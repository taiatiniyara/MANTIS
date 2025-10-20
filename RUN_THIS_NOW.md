# 🔴 RUN THIS NOW - Complete Fix

## Copy & Paste All 3 Queries into Supabase SQL Editor

---

## Query 1: Sync Your User
```sql
-- Sync your current user to the users table
INSERT INTO public.users (
  id,
  role,
  position,
  created_at
)
SELECT 
  id,
  'super_admin' as role,
  'System Administrator' as position,
  created_at
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) 
DO UPDATE SET
  role = 'super_admin',
  position = 'System Administrator';

-- Verify it worked
SELECT 
  u.id,
  au.email,
  u.role,
  u.position,
  u.agency_id
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.id = auth.uid();
```

**✅ Expected**: Should show your user with role='super_admin'

---

## Query 2: Grant Table Permissions
```sql
-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

**✅ Expected**: Query completes with no errors

---

## Query 3: Verify Everything Works
```sql
-- Test helper functions
SELECT 
  public.user_role() as my_role,
  public.is_super_admin() as is_super_admin;

-- Test querying infringements (should work now!)
SELECT count(*) as infringement_count FROM infringements;

-- Test querying categories
SELECT count(*) as category_count FROM infringement_categories;

-- Test querying types
SELECT count(*) as type_count FROM infringement_types;
```

**✅ Expected**: 
- my_role = 'super_admin'
- is_super_admin = true
- All counts should return (even if 0)

---

## 🎯 After Running All 3 Queries

1. **Refresh your browser** (Ctrl+Shift+R)
2. **Go to** `/admin/categories`
3. **Should work with NO errors!** ✅

---

## 🚨 What These Fix

**Query 1**: Syncs your auth user to the public.users table  
**Query 2**: Grants base table permissions (RLS policies need this)  
**Query 3**: Verifies everything is working  

**Root Cause**: Migration 011 recreated RLS policies but didn't grant base table permissions. RLS policies filter rows, but you still need table-level SELECT/INSERT/UPDATE/DELETE grants.

---

## 📝 Files Created

- `db/GRANT_PERMISSIONS.sql` - Just Query 2
- `db/EMERGENCY_USER_SYNC.sql` - Just Query 1
- `db/VERIFY_FIX.sql` - Extended diagnostics

**Use this file - it has everything in one place!** 🚀

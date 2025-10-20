# ✅ Migration 013 - Verification Checklist

**Migration Applied**: ✅ Done  
**Server Status**: 🟢 Running on http://localhost:3000  
**Date**: October 20, 2025

---

## 🧪 Quick Test Plan

### Step 1: Login Test
1. Open: http://localhost:3000/auth/login
2. Login with test credentials:
   - Email: `admin@mantis.gov.fj`
   - Password: `Password123!`
3. ✅ Should redirect to dashboard

---

### Step 2: Critical Pages (Previously Broken)

#### Teams Page ⚠️ Was Broken
- URL: http://localhost:3000/protected/teams
- **Expected**: Page loads without "foreign key relationship" error
- **Should Show**: List of teams with leader names
- **Status**: [ ] Working / [ ] Error

#### Routes Page ⚠️ Was Broken  
- URL: http://localhost:3000/protected/routes
- **Expected**: Page loads without "foreign key relationship" error
- **Should Show**: Routes with start/end locations
- **Status**: [ ] Working / [ ] Error

---

### Step 3: User Names Test

#### Protected Dashboard
- URL: http://localhost:3000/protected
- **Expected**: User full names display (not email prefixes)
- **Status**: [ ] Working / [ ] Error

#### Users Page
- URL: http://localhost:3000/protected/users
- **Expected**: All users show full names
- **Status**: [ ] Working / [ ] Error

---

### Step 4: Admin Pages (If Super Admin)

#### Admin Dashboard
- URL: http://localhost:3000/admin
- **Status**: [ ] Working / [ ] Error

#### Admin Teams
- URL: http://localhost:3000/admin/teams
- **Expected**: Teams management with leader selection
- **Status**: [ ] Working / [ ] Error

#### Admin Routes
- URL: http://localhost:3000/admin/routes
- **Expected**: Routes management with start/end locations
- **Status**: [ ] Working / [ ] Error

---

## 🔍 What to Look For

### ✅ Success Indicators
- No "foreign key relationship" errors
- No "permission denied" errors
- User full names display properly
- Teams show leader information
- Routes show start/end locations
- All pages load data without console errors

### ❌ Problem Indicators
- Red error messages on pages
- Console errors (F12 → Console tab)
- "PGRST200" errors
- "Could not find a relationship" errors
- Empty tables when there should be data

---

## 🐛 If You See Errors

### Database Connection Error
```
Error: Database connection failed
```
**Fix**: Check `.env.local` has correct Supabase credentials

### Still Getting Foreign Key Errors
```
Error: Could not find a relationship...
```
**Fix**: 
1. Verify migration ran successfully in Supabase
2. Check SQL Editor for any error messages
3. Try running verification queries (see below)

### No Data Showing
```
Tables are empty but should have data
```
**Fix**:
1. Check if seed data was loaded
2. Run: `002_users_seed.sql` in Supabase
3. Check RLS policies are not blocking access

---

## 📊 Verification Queries

Run these in **Supabase Dashboard → SQL Editor** to verify the migration:

### Check Users Table
```sql
SELECT 
  u.id,
  u.full_name,
  u.position,
  u.role,
  au.email
FROM users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.full_name
LIMIT 10;
```
**Expected**: All users have `full_name` populated

---

### Check Teams Table
```sql
SELECT 
  t.id,
  t.name as team_name,
  t.leader_id,
  u.full_name as leader_name,
  u.position as leader_position
FROM teams t
LEFT JOIN users u ON t.leader_id = u.id
ORDER BY t.name
LIMIT 10;
```
**Expected**: `leader_id` column exists (can be NULL)

---

### Check Routes Table
```sql
SELECT 
  r.id,
  r.name as route_name,
  sl.name as start_location,
  el.name as end_location
FROM routes r
LEFT JOIN locations sl ON r.start_location_id = sl.id
LEFT JOIN locations el ON r.end_location_id = el.id
ORDER BY r.name
LIMIT 10;
```
**Expected**: `start_location_id` and `end_location_id` columns exist

---

## ✅ Success Criteria

Mark as complete when:
- [ ] Can login successfully
- [ ] `/protected/teams` loads without errors
- [ ] `/protected/routes` loads without errors
- [ ] User full names display throughout app
- [ ] No console errors in browser
- [ ] All verification queries return data

---

## 📝 Notes

Write any observations or issues here:

```
[Your notes here]
```

---

## 🎉 If Everything Works

Congratulations! The migration was successful. You can now:

1. **Continue testing other features**
2. **Start working on new features** (see `NEXT_STEPS.md`)
3. **Deploy to production** (when ready)

---

## 📞 If You Need Help

1. Check console errors (F12 in browser)
2. Check Supabase logs in dashboard
3. Review migration file: `db/migrations/013_add_team_leader.sql`
4. Check documentation: `docs/FIX_TEAMS_ERROR.md`

---

**Testing Started**: _____________  
**Testing Completed**: _____________  
**Overall Status**: [ ] Pass / [ ] Fail / [ ] Partial


# 🚀 MANTIS Authentication Setup Checklist

Use this checklist to set up authentication for the MANTIS system step by step.

## ✅ Pre-Setup (Already Complete)

- [x] Supabase project created
- [x] Database schema deployed
- [x] Environment variables configured (`.env.local`)
- [x] Authentication code implemented
- [x] Protected routes configured

## 📋 Setup Steps

### Step 1: Run Database Seed
**Time: 2 minutes**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `seed.sql`
3. Paste and click **Run**
4. Verify output shows agencies and offences created

**Expected Result:**
```
Agencies created: 3
Offences created: 8
Vehicles created: 5
```

---

### Step 2: Create Auth Users
**Time: 5 minutes**

For each user, go to Supabase Dashboard → Authentication → Users → Add user:

#### User 1: Central Admin
- **Email**: `admin@mantis.gov.fj`
- **Password**: `Admin123!`
- **Auto Confirm User**: ✅ Yes
- Click **Create user**
- **📋 Copy the User UID** → Save for Step 3

#### User 2: Police Officer
- **Email**: `officer1@police.gov.fj`
- **Password**: `Officer123!`
- **Auto Confirm User**: ✅ Yes
- Click **Create user**
- **📋 Copy the User UID** → Save for Step 3

#### User 3: LTA Officer
- **Email**: `officer2@lta.gov.fj`
- **Password**: `Officer123!`
- **Auto Confirm User**: ✅ Yes
- Click **Create user**
- **📋 Copy the User UID** → Save for Step 3

#### User 4: Police Admin
- **Email**: `admin@police.gov.fj`
- **Password**: `Admin123!`
- **Auto Confirm User**: ✅ Yes
- Click **Create user**
- **📋 Copy the User UID** → Save for Step 3

#### User 5: Citizen (Optional)
- **Email**: `citizen@example.com`
- **Password**: `Citizen123!`
- **Auto Confirm User**: ✅ Yes
- Click **Create user**
- **📋 Copy the User UID** → Save for Step 3

---

### Step 3: Create User Profiles
**Time: 3 minutes**

1. Open `create-user-profiles.sql`
2. Replace each `YOUR-XXX-UUID-HERE` with the actual User UIDs from Step 2
3. Copy the updated SQL
4. Paste in Supabase SQL Editor
5. Click **Run**

**Verify:** Should see "INSERT 0 5" or similar success message

---

### Step 4: Verify Setup
**Time: 2 minutes**

1. Copy contents of `auth-health-check.sql`
2. Paste in Supabase SQL Editor
3. Click **Run**
4. Review all checks

**All checks should show:**
- ✅ PASS or ⚠️ INFO (acceptable)
- ❌ FAIL = Something needs fixing

---

### Step 5: Test Login
**Time: 3 minutes**

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Open browser to http://localhost:5173

3. You should see the **MANTIS login page**

4. Try logging in as **Central Admin**:
   - Email: `admin@mantis.gov.fj`
   - Password: `Admin123!`
   - Click **Sign In**

5. You should see:
   - ✅ Dashboard loads
   - ✅ User name in sidebar: "System Administrator"
   - ✅ Role shown: "Central Admin"
   - ✅ Logout button visible

---

### Step 6: Test Role-Based Access
**Time: 5 minutes**

#### Test 1: Officer Access
1. Click **Sign Out** (bottom of sidebar)
2. Log in as `officer1@police.gov.fj` / `Officer123!`
3. ✅ Should see dashboard
4. ✅ Should see "Officer John Tiko" and "Fiji Police Force"

#### Test 2: Citizen Blocked
1. Log out
2. Log in as `citizen@example.com` / `Citizen123!`
3. ✅ Should see **"Access Denied"** message
4. ✅ Should show: "Required role: officer or agency_admin or central_admin"

#### Test 3: Agency Admin
1. Log out
2. Log in as `admin@police.gov.fj` / `Admin123!`
3. ✅ Should see dashboard
4. ✅ Should see "Police Admin Singh" and "Agency Admin"

---

### Step 7: Test Logout & Audit Logs
**Time: 2 minutes**

1. Log in as any user
2. Click **Sign Out**
3. ✅ Should return to login page

4. Verify audit logs:
   ```sql
   SELECT 
     action,
     entity_type,
     new_data->>'display_name' as user_name,
     created_at
   FROM audit_logs
   WHERE action IN ('LOGIN', 'LOGOUT')
   ORDER BY created_at DESC
   LIMIT 10;
   ```

5. ✅ Should see LOGIN and LOGOUT entries

---

## 🎯 Success Criteria

All of these should be working:

- [ ] Can access login page at http://localhost:5173
- [ ] Can log in with officer account
- [ ] Can log in with admin account
- [ ] Citizens are blocked from dashboard
- [ ] User info shows correctly in sidebar
- [ ] Logout works and returns to login page
- [ ] Audit logs track login/logout events
- [ ] Protected routes require authentication
- [ ] Role-based access control works

---

## 🐛 Troubleshooting

### Problem: "Unable to load user profile"
**Solution:**
```sql
-- Check if profile exists
SELECT * FROM users WHERE id = 'your-auth-user-id';

-- If missing, create it using create-user-profiles.sql
```

### Problem: "Account has been deactivated"
**Solution:**
```sql
UPDATE users SET active = true WHERE id = 'your-auth-user-id';
```

### Problem: Officer has no agency shown
**Solution:**
```sql
-- Check officer's agency assignment
SELECT u.*, a.name FROM users u 
LEFT JOIN agencies a ON u.agency_id = a.id 
WHERE u.id = 'your-user-id';

-- Fix if missing
UPDATE users 
SET agency_id = 'a1111111-1111-1111-1111-111111111111' 
WHERE id = 'your-user-id';
```

### Problem: Login redirects but shows blank page
**Solution:**
- Check browser console for errors
- Verify .env.local has correct Supabase credentials
- Clear browser cache and refresh

### Problem: Can't create users in Supabase Auth
**Solution:**
- Check you're in the correct Supabase project
- Verify you have admin access
- Try disabling email confirmation temporarily

---

## 📚 Reference

### Test Credentials
After setup, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Central Admin | admin@mantis.gov.fj | Admin123! |
| Police Officer | officer1@police.gov.fj | Officer123! |
| LTA Officer | officer2@lta.gov.fj | Officer123! |
| Police Admin | admin@police.gov.fj | Admin123! |
| Citizen | citizen@example.com | Citizen123! |

### Agency IDs
Copy these for reference:

```
Fiji Police Force:        a1111111-1111-1111-1111-111111111111
Land Transport Authority: a2222222-2222-2222-2222-222222222222
Suva City Council:        a3333333-3333-3333-3333-333333333333
```

### Role Permissions

| Feature | Citizen | Officer | Agency Admin | Central Admin |
|---------|---------|---------|--------------|---------------|
| Dashboard | ❌ | ✅ | ✅ | ✅ |
| Create Infringement | ❌ | ✅ | ✅ | ✅ |
| Void Infringement | ❌ | ❌ | ✅ | ✅ |
| Process Payment | ❌ | ✅ | ✅ | ✅ |
| Resolve Dispute | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | Agency Only | All |
| Access Audit Logs | ❌ | ❌ | ✅ | ✅ |

---

## 🎉 Next Steps After Setup

1. **Create Sample Infringements**
   - Use the commented sections in `seed.sql`
   - Update with real user IDs
   - Creates test data for dashboard

2. **Enable Row Level Security (RLS)**
   - Review RLS policies in schema
   - Test that users only see their data
   - Verify agency isolation works

3. **Customize User Roles**
   - Add more officers to different agencies
   - Create real admin accounts
   - Remove or change test passwords

4. **Implement Additional Routes**
   - `/infringements` - List and search
   - `/payments` - Payment processing
   - `/disputes` - Dispute management
   - `/reports` - Analytics and reports

5. **Production Hardening**
   - Enable email confirmation
   - Set up password reset
   - Configure MFA for admins
   - Review security policies

---

## ✨ You're All Set!

The authentication system is now fully functional. Users can:
- ✅ Log in with email/password
- ✅ See role-appropriate dashboard
- ✅ View their profile in sidebar
- ✅ Sign out securely
- ✅ Be protected by role-based access control

**Total Setup Time: ~20 minutes**

Need help? Check:
- `AUTH_SETUP.md` - Detailed setup guide
- `AUTH_IMPLEMENTATION.md` - Technical documentation
- `auth-health-check.sql` - System verification

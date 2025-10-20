# 👥 Viewing and Managing Admin Users in MANTIS

## Current Admin Users

To view admin users in the MANTIS system, you have several options:

### Option 1: Web Interface (Recommended)
1. **Open the development server**: http://localhost:3000
2. **Sign in** as a super admin
3. **Navigate to**: http://localhost:3000/admin/view-users

This page will show:
- All users in the system
- User roles (Super Admin, Agency Admin, Officer)
- User details (email, position, agency, location)
- Filtered view of admin users only

### Option 2: Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `iftscgsnqurgvscedhiv`
3. Navigate to **Table Editor** → **users** table
4. Filter by `role` column to see:
   - `super_admin` - Full system access
   - `agency_admin` - Agency-level access
   - `officer` - Basic user access

### Option 3: SQL Query
You can run this query in Supabase SQL Editor:

```sql
-- View all admin users with their details
SELECT 
  u.id,
  u.role,
  u.position,
  a.name as agency_name,
  l.name as location_name,
  u.created_at
FROM users u
LEFT JOIN agencies a ON u.agency_id = a.id
LEFT JOIN locations l ON u.location_id = l.id
WHERE u.role IN ('super_admin', 'agency_admin')
ORDER BY u.created_at DESC;
```

---

## Creating Your First Admin User

### Step 1: Sign Up
1. Open http://localhost:3000/auth/sign-up
2. Create a new account with your email

### Step 2: Promote to Admin
Since this is a new system, you'll need to manually promote your first user to admin:

#### Via Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Table Editor** → **users**
4. Find your user record (it should have been created automatically)
5. Edit the `role` column and change it to `super_admin`
6. Save the changes

#### Via SQL:
Run this in Supabase SQL Editor (replace the email):

```sql
-- Update user role to super admin
UPDATE users 
SET role = 'super_admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

### Step 3: Verify Admin Access
1. Log out and log back in
2. Navigate to http://localhost:3000/admin
3. You should now see the admin dashboard

---

## User Roles Explained

### 🔴 Super Admin
- **Full system access**
- Can manage all agencies
- Can create and manage users
- Can access all features and data
- Can view advanced analytics and reports

### 🔵 Agency Admin
- **Agency-level access**
- Can manage their own agency's data
- Can create officers within their agency
- Can access agency-specific reports
- Limited to their assigned agency

### 🟢 Officer
- **Basic user access**
- Can create and manage infringements
- Can view assigned routes and teams
- Limited data access
- Field operations focused

---

## Current User Structure

Based on your database schema:

```typescript
interface User {
  id: string;              // UUID from auth.users
  agency_id?: string;      // Linked agency (optional for super_admin)
  role: 'super_admin' | 'agency_admin' | 'officer';
  position?: string;       // Job title/position
  location_id?: string;    // Assigned location
  created_at: Date;
}
```

---

## Agencies in the System

Your seed data includes these agencies:
1. **Fiji Police Force**
2. **Land Transport Authority**
3. **Suva City Council**
4. **Lautoka City Council**
5. **Nadi Town Council**
6. **Labasa Town Council**

When creating agency admins, assign them to one of these agencies.

---

## Quick Commands

### View current user session:
Visit: http://localhost:3000/admin/view-users
(Shows your current session details at the bottom)

### Check database directly:
```sql
-- Count users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
```

### Find your user ID:
```sql
-- Find user by email
SELECT u.id, u.role, u.position, au.email
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE au.email = 'your-email@example.com';
```

---

## Next Steps

1. **Create your first super admin** using the steps above
2. **Sign in** at http://localhost:3000/auth/login
3. **Navigate to Admin Dashboard** at http://localhost:3000/admin
4. **Use the admin interface** to:
   - Create additional users
   - Assign users to agencies
   - Set up teams and routes
   - Configure the system

---

## Troubleshooting

### "No users found"
- Check if you've signed up at http://localhost:3000/auth/sign-up
- Verify the user was created in Supabase Dashboard
- Check if the user record exists in both `auth.users` and `users` tables

### "Access denied"
- Ensure your user has the correct role (`super_admin` or `agency_admin`)
- Log out and log back in after changing roles
- Clear browser cache if needed

### "Cannot view admin page"
- Only `super_admin` can access http://localhost:3000/admin/view-users
- Other roles are redirected to their respective dashboards

---

## Security Notes

⚠️ **Important**: 
- The first user should be manually promoted to `super_admin` via Supabase
- Never share service role keys publicly
- Use Row Level Security (RLS) policies to protect data
- Regularly audit admin user access

---

**Current Server**: http://localhost:3000  
**Admin Dashboard**: http://localhost:3000/admin  
**View Users Page**: http://localhost:3000/admin/view-users  
**Supabase Dashboard**: https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv

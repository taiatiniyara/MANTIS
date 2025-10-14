# MANTIS Authentication Setup Guide

This guide will walk you through setting up authentication and test users for the MANTIS system.

## Overview

MANTIS uses **Supabase Auth** for authentication with a custom role-based authorization system. The system supports four user roles:

- **`central_admin`**: Full system access, can manage all agencies and users
- **`agency_admin`**: Can manage users and data within their agency
- **`officer`**: Can create infringements and process payments for their agency
- **`citizen`**: Can view their own infringements and disputes

## Step 1: Create Test Users in Supabase Auth

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add user** and create the following test accounts:

### Central Admin
- **Email**: `admin@mantis.gov.fj`
- **Password**: `Admin123!`
- **Confirm password**: Yes
- Click **Create user**
- **Copy the User UID** (you'll need this in Step 2)

### Police Officer
- **Email**: `officer1@police.gov.fj`
- **Password**: `Officer123!`
- Click **Create user**
- **Copy the User UID**

### LTA Officer
- **Email**: `officer2@lta.gov.fj`
- **Password**: `Officer123!`
- Click **Create user**
- **Copy the User UID**

### Police Agency Admin
- **Email**: `admin@police.gov.fj`
- **Password**: `Admin123!`
- Click **Create user**
- **Copy the User UID**

### Citizen
- **Email**: `citizen@example.com`
- **Password**: `Citizen123!`
- Click **Create user**
- **Copy the User UID**

## Step 2: Create User Profiles

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Paste the following SQL, **replacing the UUIDs** with the actual User UIDs you copied:

```sql
-- Insert user profiles
INSERT INTO users (id, agency_id, role, display_name, driver_licence_number, phone, active) VALUES
  -- Central Admin (replace with actual auth.users ID)
  ('your-admin-uuid-here', NULL, 'central_admin', 'System Administrator', NULL, '+679 999 0001', true),
  
  -- Police Officer
  ('your-police-officer-uuid-here', 'a1111111-1111-1111-1111-111111111111', 'officer', 'Officer John Tiko', NULL, '+679 999 0002', true),
  
  -- LTA Officer
  ('your-lta-officer-uuid-here', 'a2222222-2222-2222-2222-222222222222', 'officer', 'Officer Maria Vuki', NULL, '+679 999 0003', true),
  
  -- Police Agency Admin
  ('your-police-admin-uuid-here', 'a1111111-1111-1111-1111-111111111111', 'agency_admin', 'Police Admin Singh', NULL, '+679 999 0004', true),
  
  -- Citizen
  ('your-citizen-uuid-here', NULL, 'citizen', 'John Citizen', 'DL123456', '+679 999 0005', true);
```

4. Click **Run** to execute the query

## Step 3: Verify Setup

Run this query to verify all users are created:

```sql
SELECT 
  u.id,
  u.display_name,
  u.role,
  a.name as agency_name,
  u.active
FROM users u
LEFT JOIN agencies a ON u.agency_id = a.id
ORDER BY u.role, u.display_name;
```

You should see 5 users listed with their roles and agencies.

## Step 4: Test Login

1. Open your MANTIS web application: http://localhost:5173
2. You should be redirected to the login page
3. Try logging in with any of the test accounts:
   - **Central Admin**: `admin@mantis.gov.fj` / `Admin123!`
   - **Officer**: `officer1@police.gov.fj` / `Officer123!`
   - **Citizen**: `citizen@example.com` / `Citizen123!`

## Step 5: Test Authorization

### As Central Admin
- Login as `admin@mantis.gov.fj`
- You should have access to the dashboard
- Can view all agencies' data

### As Officer
- Login as `officer1@police.gov.fj`
- You should have access to the dashboard
- Can view agency-specific data
- Can create infringements

### As Citizen
- Login as `citizen@example.com`
- You should be blocked from accessing the dashboard
- Would see: "Access Denied - Required role: officer or agency_admin or central_admin"
- Citizens should use the mobile app instead

## Troubleshooting

### Error: "Unable to load user profile"
- Check that the user profile exists in the `users` table
- Verify the user ID matches the auth.users ID exactly
- Check that the user is marked as `active = true`

### Error: "Account has been deactivated"
- Update the user profile:
  ```sql
  UPDATE users SET active = true WHERE id = 'your-user-id';
  ```

### Error: "Cannot find name 'openDisputesData'"
- This is a code error - the dashboard queries need the correct variable names
- Should already be fixed in the codebase

### User can't see agency data
- Verify the user has an `agency_id` assigned (except for central_admin and citizen)
- Check agency is marked as `active = true`:
  ```sql
  SELECT * FROM agencies WHERE active = true;
  ```

## Creating Additional Test Data

To create sample infringements and populate the dashboard:

1. Go to SQL Editor in Supabase
2. Run the commented-out sections in `seed.sql`
3. Update the UUIDs to match your actual user IDs
4. This will create:
   - 3 sample infringements
   - 1 sample payment
   - 1 sample dispute

## Role-Based Access Summary

| Feature | Citizen | Officer | Agency Admin | Central Admin |
|---------|---------|---------|--------------|---------------|
| View Dashboard | ❌ | ✅ | ✅ | ✅ |
| View Infringements | Own only | Agency | Agency | All |
| Create Infringement | ❌ | ✅ | ✅ | ✅ |
| Void Infringement | ❌ | ❌ | ✅ | ✅ |
| Process Payment | ❌ | ✅ | ✅ | ✅ |
| Resolve Dispute | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | Agency | All |
| Access Audit Logs | ❌ | ❌ | ✅ | ✅ |

## Next Steps

1. **Implement RLS Policies**: Ensure Row Level Security policies are active in Supabase
2. **Test Mobile App**: Citizens should use the mobile app for their portal
3. **Create Real Users**: Follow this process to create real officer and admin accounts
4. **Enable Email Confirmation**: Configure Supabase to require email confirmation for new users

## Security Notes

⚠️ **Important**:
- Change all test passwords before deploying to production
- Enable MFA (Multi-Factor Authentication) for admin accounts
- Use strong passwords (minimum 12 characters)
- Regularly audit user access and roles
- Monitor the `audit_logs` table for suspicious activity

## Support

For issues with authentication:
1. Check the browser console for errors
2. Verify Supabase environment variables in `.env.local`
3. Check Supabase Auth logs in the dashboard
4. Review the `audit_logs` table for login attempts

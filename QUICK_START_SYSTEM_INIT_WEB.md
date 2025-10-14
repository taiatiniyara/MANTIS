# System Initialization Setup - Quick Start Guide

## Overview
The MANTIS web application now includes automatic system initialization that checks if there are any users in the system. If zero users are found, it creates the first administrator account with predefined credentials.

## Implementation Components

### 1. API Layer (`src/lib/api/system.ts`)
- **`checkSystemStatus()`**: Checks if the system has any users
  - Returns: `{ hasUsers: boolean, userCount: number, initialized: boolean }`
  
- **`createFirstAdmin(userData)`**: Creates the first system administrator
  - Automatically sets role to `central_admin`
  - Creates both auth user and user profile
  - Signs in the newly created user

### 2. System Initialization Route (`src/routes/system-init.tsx`)
A dedicated page that:
- Checks system status on mount
- Shows current state (has users vs. needs initialization)
- Provides one-click initialization button
- Creates first admin with predefined credentials:
  - **Name**: Taia Tiniyara
  - **Email**: taiatiniyara@gmail.com
  - **Password**: Jesus777#
  - **Role**: Central Administrator
- Redirects to dashboard after successful initialization
- Auto-redirects to login if system already has users

### 3. Login Page Enhancement (`src/routes/login.tsx`)
- Added system status check on page load
- Automatically redirects to `/system-init` if no users exist
- Shows loading state while checking system status

### 4. Custom Hook (`src/hooks/use-system-status.ts`)
- **`useSystemStatus()`**: React Query hook for checking system status
- Caches result for 5 minutes
- Provides loading and error states

## User Flow

### First Time Setup (No Users)
1. User navigates to web app
2. Login page detects zero users
3. Auto-redirects to `/system-init`
4. User sees "No Users Found" message with admin details
5. User clicks "Initialize System" button
6. System creates first admin account
7. Auto-signs in the new admin
8. Redirects to dashboard

### Normal Login (Users Exist)
1. User navigates to web app
2. Login page detects existing users
3. Shows normal login form
4. User enters credentials and signs in

## Testing the Feature

### Test 1: Fresh System (No Users)
```bash
# Clear all users from the database
DELETE FROM users;

# Navigate to web app
# Should automatically redirect to /system-init
# Click "Initialize System"
# Should create admin and redirect to dashboard
```

### Test 2: System with Existing Users
```bash
# Ensure at least one user exists
# Navigate to web app at /login
# Should show normal login form
# Attempting to visit /system-init should redirect to login
```

## API Endpoints Used
- `GET /users` (via Supabase): Check user count
- `POST /auth/signup` (via Supabase): Create first admin
- `POST /auth/signin` (via Supabase): Sign in first admin
- `POST /users` (via Supabase): Create user profile

## Security Considerations

### Production Deployment
⚠️ **IMPORTANT**: For production, you should:

1. **Remove hardcoded credentials** from `system-init.tsx`
2. **Add a form** to let the first admin enter their own credentials
3. **Add email verification** for the first admin
4. **Consider requiring a setup token** or secret key for initialization

### Current Implementation (Development)
The current implementation uses hardcoded credentials for quick development setup:
- Email: taiatiniyara@gmail.com
- Password: Jesus777#

This is suitable for:
- Development environments
- Demo systems
- Internal testing

## File Structure
```
mantis-web/
├── src/
│   ├── lib/
│   │   └── api/
│   │       └── system.ts          # System initialization API
│   ├── hooks/
│   │   └── use-system-status.ts   # System status hook
│   └── routes/
│       ├── system-init.tsx        # System init page
│       └── login.tsx              # Enhanced login page
```

## Database Schema
The implementation relies on the existing `users` table:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    agency_id UUID REFERENCES agencies(id),
    role user_role NOT NULL DEFAULT 'citizen',
    display_name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    ...
);
```

## Next Steps for Production

1. **Add Configuration**
   - Move to environment variables or secure configuration
   - Add setup token requirement
   
2. **Enhance Security**
   - Add rate limiting for initialization endpoint
   - Require email verification
   - Add 2FA for admin accounts
   
3. **Improve UX**
   - Add form for custom admin credentials
   - Add organization/agency setup during initialization
   - Add welcome wizard for first-time setup

4. **Add Monitoring**
   - Log initialization attempts
   - Alert on initialization events
   - Track system setup completion

## Troubleshooting

### Issue: Redirect loop between login and system-init
**Solution**: Clear browser cache and ensure database has correct state

### Issue: "Failed to create user" error
**Solution**: Check Supabase Auth settings and RLS policies

### Issue: Can't sign in after initialization
**Solution**: Verify user was created in both `auth.users` and `users` tables

## Related Documentation
- `AUTH_SETUP.md` - Authentication setup guide
- `create-user-profiles.sql` - User profile database setup
- `WEB_SYSTEM_INIT_AND_AUTH_UX.md` - Original auth UX documentation

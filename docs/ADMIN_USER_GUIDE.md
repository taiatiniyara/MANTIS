# 🎯 How to View Admin Users - Quick Guide

## 🚀 Fastest Way (Web Interface)

### **Navigate to the User Management Page**

1. **Open your browser**: http://localhost:3000/admin/view-users

2. **What you'll see**:
   - ✅ All users in the system
   - ✅ User roles with colored badges
   - ✅ Email addresses
   - ✅ Positions and agencies
   - ✅ Locations assigned
   - ✅ Creation dates
   - ✅ Separate section for admin users only
   - ✅ Your current session info

---

## 📊 Current Status

Based on your database setup:

### **System Information**
- **Database**: Supabase (iftscgsnqurgvscedhiv.supabase.co)
- **Server**: http://localhost:3000 (Running ✅)
- **Environment**: Development mode

### **Seeded Data**
Your database has been seeded with:
- ✅ 6 Agencies (Fiji Police, LTA, Councils)
- ✅ Multiple locations (divisions, regions, councils)
- ✅ 5 Infringement categories
- ✅ 6 Infringement types

### **User Data**
- ❓ Admin users need to be created via sign-up
- ❓ First user must be manually promoted to super_admin

---

## 🔑 Creating Your First Admin User

### **If you don't have any users yet:**

#### Step 1: Sign Up
```
Navigate to: http://localhost:3000/auth/sign-up
Enter your email and password
Complete the sign-up process
```

#### Step 2: Promote to Super Admin
Go to Supabase Dashboard:
```
1. Visit: https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv
2. Click: Table Editor → users
3. Find your user record
4. Edit the 'role' field to: super_admin
5. Save changes
```

#### Step 3: Log In as Admin
```
Navigate to: http://localhost:3000/auth/login
Enter your credentials
Access admin dashboard: http://localhost:3000/admin
```

---

## 🎨 User Management Page Features

### **All Users Table**
Shows complete user directory with:
- 📧 Email addresses
- 🏷️ Role badges (color-coded)
- 💼 Job positions
- 🏢 Agency assignments
- 📍 Location assignments
- 📅 Account creation dates

### **Admin Users Section**
Filtered view showing only:
- 🔴 Super Admins (full access)
- 🔵 Agency Admins (agency-level access)

### **Current Session Card**
Displays your active session:
- Your email
- Your current role
- Your user ID

---

## 🎨 Role Badge Colors

The interface uses color-coded badges:

- **🔴 Super Admin** - Red badge (destructive variant)
- **🔵 Agency Admin** - Blue badge (default variant)
- **🟢 Officer** - Gray badge (secondary variant)

---

## 🔍 Alternative Methods

### **Method 1: Supabase Dashboard**
Direct database access:
```
1. https://supabase.com/dashboard
2. Select your project
3. Table Editor → users
4. Filter by role column
```

### **Method 2: SQL Query**
Run in Supabase SQL Editor:
```sql
SELECT 
  au.email,
  u.role,
  u.position,
  a.name as agency,
  u.created_at
FROM users u
JOIN auth.users au ON u.id = au.id
LEFT JOIN agencies a ON u.agency_id = a.id
WHERE u.role IN ('super_admin', 'agency_admin')
ORDER BY u.created_at DESC;
```

---

## 📱 Accessing the Page

### **Prerequisites**
- ✅ Development server running (http://localhost:3000)
- ✅ Signed in as super_admin
- ✅ Database migrations applied

### **URL**
```
http://localhost:3000/admin/view-users
```

### **Access Control**
- ✅ Super Admins: Full access
- ❌ Agency Admins: Redirected to /admin
- ❌ Officers: Redirected to /admin
- ❌ Not logged in: Redirected to /auth/login

---

## 🛠️ Files Created

I've created these resources for you:

1. **Web Page**: `web/app/admin/view-users/page.tsx`
   - Full-featured user management interface
   - Beautiful table layout with blue/slate theme
   - Role-based badges and formatting

2. **Documentation**: `docs/VIEW_ADMIN_USERS.md`
   - Complete guide to viewing and managing users
   - Step-by-step instructions
   - Troubleshooting tips

3. **Script**: `web/scripts/view-admin-users.js`
   - Command-line tool to view admin users
   - (Note: requires proper API access)

---

## 🎯 Quick Actions

### **To view users now:**
```bash
# Server is already running on http://localhost:3000
# Just open this URL in your browser:
http://localhost:3000/admin/view-users
```

### **If you need to create a user first:**
```bash
# 1. Sign up:
http://localhost:3000/auth/sign-up

# 2. Promote in Supabase Dashboard:
# Table Editor → users → Edit role to 'super_admin'

# 3. Log in:
http://localhost:3000/auth/login

# 4. View users:
http://localhost:3000/admin/view-users
```

---

## 📊 Expected Output

When you visit the page, you'll see:

```
┌─────────────────────────────────────────────────────────┐
│ User Management                                         │
│ View all users in the MANTIS system                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ All Users                                               │
│ Total users: X                                          │
├─────────────────────────────────────────────────────────┤
│ Email      | Role         | Position  | Agency  | ...   │
├─────────────────────────────────────────────────────────┤
│ user@ex... | Super Admin  | Manager   | FPF     | ...   │
│ admin@e... | Agency Admin | Director  | LTA     | ...   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Admin Users Only                                        │
│ Super Admins and Agency Admins                          │
├─────────────────────────────────────────────────────────┤
│ [Filtered view of admin users]                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👤 Your Current Session                                 │
│ Email: your-email@example.com                           │
│ Role: Super Admin                                       │
│ User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx           │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Summary

**What I've built for you:**
1. ✅ Full-featured admin user viewer page
2. ✅ Beautiful UI with your blue/slate theme
3. ✅ Role-based access control
4. ✅ Comprehensive documentation
5. ✅ Ready to use right now!

**What you need to do:**
1. Open http://localhost:3000/admin/view-users
2. If no users exist, create one via sign-up
3. Promote first user to super_admin in Supabase
4. Log in and view all users!

---

**🚀 Ready to view your admin users!**

**Server**: http://localhost:3000 ✅  
**Page**: http://localhost:3000/admin/view-users  
**Docs**: docs/VIEW_ADMIN_USERS.md

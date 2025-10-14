# 🎯 Quick Guide: System Init & Auth UX

## What Was Added

### 1. System Initialization Dialog 🗄️
**Location:** Dashboard → "Initialize System" button

**What it does:**
```
┌─────────────────────────────────────┐
│  System Initialization              │
├─────────────────────────────────────┤
│  ✅ Agencies                        │
│  ✅ Offences Catalog                │
│  ✅ Sample Vehicles                 │
│  ✅ User Profiles                   │
│  ✅ Sample Infringements            │
│  ✅ Sample Payments                 │
├─────────────────────────────────────┤
│  [Close]  [Start Initialization]   │
└─────────────────────────────────────┘
```

**Seeds:**
- 3 agencies
- 8 offences
- 5 vehicles
- 2 infringements
- 1 payment

---

### 2. Hidden Nav When Logged Out 🔐

**Before:**
```
┌─────────────┬─────────────────────┐
│  Sidebar    │  Login Page         │
│  (visible)  │  Email: ___         │
│  Dashboard  │  Password: ___      │
│  Reports    │  [Login]            │
└─────────────┴─────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│  Login Page                         │
│  Email: ___                         │
│  Password: ___                      │
│  [Login]                            │
└─────────────────────────────────────┘
```

---

## Quick Start

### Step 1: Create Auth Users
```sql
-- In Supabase Dashboard → Authentication → Users
Email: admin@mantis.gov.fj
Password: Admin123!

Email: officer@police.gov.fj  
Password: Officer123!
```

### Step 2: Create User Profiles
```sql
-- In Supabase SQL Editor
INSERT INTO users (id, role, display_name, agency_id)
VALUES 
  ('<auth-user-uuid>', 'officer', 'Officer Name', '<agency-uuid>');
```

### Step 3: Login & Initialize
1. Login to web app
2. Go to Dashboard
3. Click "Initialize System"
4. Watch progress
5. Done! 🎉

---

## Files Changed

```
mantis-web/
├── src/
│   ├── components/
│   │   ├── system-init-dialog.tsx (NEW - 550 lines)
│   │   └── layout/
│   │       └── app-shell.tsx (MODIFIED - auth-aware nav)
│   └── routes/
│       └── index.tsx (MODIFIED - added init button)
```

---

## Features

✅ **Safe Seeding** - Won't duplicate data  
✅ **Visual Progress** - See each step complete  
✅ **Error Handling** - Clear error messages  
✅ **Clean Auth UX** - No nav on login page  
✅ **One-Click Setup** - Initialize in seconds  
✅ **Mobile Friendly** - Better mobile auth experience  

---

## Try It Out

1. **Start dev server:**
   ```bash
   cd mantis-web
   npm run dev
   ```

2. **Visit login page** - Notice clean layout (no sidebar!)

3. **Login** - Navigation appears automatically

4. **Click "Initialize System"** - Watch the magic happen

5. **Check data** - All seed records created

---

## Next Steps

- Add more seed data options
- Create data reset tool
- Add import/export features
- Enhance mobile auth UX

**Status:** ✅ Complete and tested!

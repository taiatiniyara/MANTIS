# 🚀 MANTIS - Quick Reference Guide

**Last Updated:** October 19, 2025

---

## 📍 Current Status

### ✅ Completed Features
- **Agency Management** - Full CRUD with admin assignment
- **User Management** - Full CRUD with role-based access
- **Location Management** - Full CRUD with hierarchy support
- **Location Selector** - Reusable component for location assignment
- **User Creation** - Real user creation with email invitations
- **Toast Notifications** - Global notification system
- **Role Badges** - Visual role indicators
- **Search & Filters** - Advanced filtering across all pages

### 🏗️ In Progress
- Testing location management features
- Testing user creation with email invitations
- Verifying location selector across components

### 📋 Next Up
- Teams management
- Routes management
- Finance reports
- Mobile app features

---

## 🔗 Important URLs

### Development
- **Dev Server:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin
- **Agencies:** http://localhost:3000/admin/agencies
- **Users:** http://localhost:3000/admin/users
- **Locations:** http://localhost:3000/admin/locations ⭐ NEW

### Supabase
- **Project ID:** iftscgsnqurgvscedhiv
- **Dashboard:** https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv

---

## 📂 Project Structure

```
MANTIS/
├── docs/                                      Documentation
│   ├── AGENCY_ADMIN_ASSIGNMENT_COMPLETE.md
│   ├── SPRINT_1_TASKS_1_2_3_COMPLETE.md
│   └── ... (14+ docs)
├── web/                                       Next.js App
│   ├── app/
│   │   ├── admin/
│   │   │   ├── agencies/                     ✅ Agency management
│   │   │   ├── users/                        ✅ User management
│   │   │   └── locations/                    ✅ Location management (NEW)
│   │   ├── api/admin/
│   │   │   └── create-user/                  ✅ User creation API (NEW)
│   │   └── auth/                             Authentication pages
│   ├── components/
│   │   ├── admin/                            Admin components
│   │   │   ├── agencies-*.tsx               Agency management
│   │   │   ├── users-*.tsx                  User management
│   │   │   ├── locations-*.tsx              Location management (NEW)
│   │   │   ├── location-selector.tsx        Location picker (NEW)
│   │   │   └── role-badge.tsx               Role badges
│   │   └── ui/                              shadcn/ui components
│   └── lib/
│       ├── database.types.ts                Generated Supabase types
│       └── supabase/                        Supabase clients
├── mobile/                                   React Native App
├── db/                                       Database migrations
└── supabase/                                 Supabase config
```

---

## 🗄️ Database Schema (Key Tables)

### agencies
- `id` (uuid, PK)
- `name` (text)
- `created_at` (timestamptz)

### users
- `id` (uuid, PK, FK to auth.users)
- `position` (text)
- `role` (enum: super_admin, agency_admin, officer)
- `agency_id` (uuid, FK to agencies)
- `location_id` (uuid, FK to locations) ⭐ NOW USED
- `created_at` (timestamptz)

### locations ⭐ NEW
- `id` (uuid, PK)
- `name` (text)
- `type` (enum: division, station, post, region, office, council, department, zone)
- `agency_id` (uuid, FK to agencies)
- `parent_id` (uuid, FK to locations)
- `created_at` (timestamptz)

### teams (Sprint 2)
- `id` (uuid, PK)
- `name` (text)
- `agency_id` (uuid, FK to agencies)
- `created_at` (timestamptz)

### routes (Sprint 2)
- `id` (uuid, PK)
- `name` (text)
- `description` (text)
- `agency_id` (uuid, FK to agencies)
- `location_id` (uuid, FK to locations)
- `created_at` (timestamptz)

---

## 🔑 User Roles & Permissions

### Super Admin
- **Full System Access**
- Create/Edit/Delete agencies
- Assign agency admins
- Manage all users across agencies
- Create/Edit/Delete locations
- View all data
- Access all features

### Agency Admin
- **Agency-Scoped Access**
- Manage users in their agency only
- Create/Edit/Delete locations in their agency
- View agency-specific data
- Assign officers to locations/teams
- Cannot access other agencies

### Officer
- **Limited Access**
- View own profile
- Submit reports/citations
- View assigned routes
- Access mobile features
- Cannot manage users/locations

---

## 🎨 Component Library

### UI Components (shadcn/ui)
- **Buttons** - Primary, secondary, destructive, ghost
- **Dialogs** - Modals for forms and confirmations
- **Tables** - Data tables with sorting
- **Badges** - Status indicators
- **Inputs** - Text, email, number, etc.
- **Select** - Dropdowns with search
- **Toast** - Notifications
- **Alert** - Warning messages

### Admin Components
- **AgenciesTable** - Display agencies with actions
- **UsersTable** - Display users with filters
- **LocationsTable** - Display locations with hierarchy ⭐ NEW
- **RoleBadge** - Color-coded role indicators
- **LocationSelector** - Location picker ⭐ NEW
- **AssignAdminDialog** - Assign agency admins
- **Create/Edit/Delete Dialogs** - CRUD operations

---

## 🛠️ Development Commands

### Start Dev Server
```bash
cd web
npm run dev
# Opens on http://localhost:3000
```

### Database Migrations
```bash
cd supabase
supabase migration new migration_name
supabase db reset  # Apply all migrations
```

### Type Generation
```bash
cd web
npx supabase gen types typescript --project-id iftscgsnqurgvscedhiv > lib/database.types.ts
```

### Build for Production
```bash
cd web
npm run build
npm start
```

---

## 🔐 Environment Variables

### Required (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🧪 Testing Checklist

### Agency Management ✅
- [ ] Create agency
- [ ] Edit agency
- [ ] Delete agency
- [ ] Assign admin
- [ ] Remove admin
- [ ] Search agencies

### User Management ✅
- [ ] Create user with email invitation ⭐ NEW
- [ ] Edit user details
- [ ] Assign user to location ⭐ NEW
- [ ] Delete user
- [ ] Search/filter users
- [ ] Check email invitation received

### Location Management ✅ NEW
- [ ] Create location
- [ ] Create child location (hierarchy)
- [ ] Edit location
- [ ] Delete location
- [ ] Search/filter locations
- [ ] Verify delete protection

### Location Selector ✅ NEW
- [ ] Select location in user creation
- [ ] Select location in user edit
- [ ] Agency filtering works
- [ ] Dropdown shows hierarchy

---

## 📝 API Endpoints

### Admin API
```
POST /api/admin/create-user
  - Creates user with Supabase Auth Admin API
  - Sends invitation email
  - Body: { email, position, role, agency_id?, location_id? }
  - Returns: { success, user }
```

### Supabase API (via SDK)
All CRUD operations use Supabase SDK:
- `supabase.from('agencies').select()`
- `supabase.from('users').insert()`
- `supabase.from('locations').update()`
- etc.

---

## 🐛 Known Issues & Solutions

### TypeScript Module Errors
**Issue:** "Cannot find module" errors in editor  
**Cause:** TypeScript language server cache  
**Solution:** Files exist, errors are false positives. Reload VS Code if needed.

### Database Type Mismatches
**Issue:** `number` vs `string` type errors  
**Cause:** All IDs are UUIDs (strings) in database  
**Solution:** Always use `string` for ID types

### Email Not Sending
**Issue:** Invitation emails not received  
**Cause:** Supabase email settings  
**Solution:** Check Supabase dashboard > Authentication > Email Templates

---

## 📚 Key Documentation Files

### Setup & Getting Started
- `docs/START_HERE.md` - Initial setup guide
- `docs/GETTING_STARTED.md` - Quick start
- `docs/WINDOWS_SETUP.md` - Windows-specific setup

### Technical Docs
- `docs/schema.md` - Database schema
- `docs/api-spec.md` - API specifications
- `docs/system-design.md` - System architecture

### Progress Tracking
- `docs/PROGRESS.md` - Overall progress
- `docs/sprint-tracker.md` - Sprint planning
- `docs/AGENCY_ADMIN_ASSIGNMENT_COMPLETE.md` - Feature complete
- `docs/SPRINT_1_TASKS_1_2_3_COMPLETE.md` - Latest completion ⭐

---

## 🎯 Sprint Status

### Sprint 1: Core Management (95% Complete)
- [x] Agency CRUD
- [x] User CRUD with Auth ⭐ NEW
- [x] Location CRUD ⭐ NEW
- [x] Role-based access
- [x] Search & filtering
- [x] Toast notifications
- [ ] Finance reports (optional)

### Sprint 2: Teams & Routes (Upcoming)
- [ ] Teams management
- [ ] Team member assignment
- [ ] Routes management
- [ ] Route-team mapping
- [ ] Patrol tracking

### Sprint 3: Mobile Features (Future)
- [ ] Mobile authentication
- [ ] Citation creation
- [ ] Photo upload
- [ ] Offline sync
- [ ] Push notifications

---

## 🔄 Common Workflows

### Create New User
1. Navigate to `/admin/users`
2. Click "+ Create User"
3. Fill in email, position, role
4. Select agency (if Super Admin)
5. Select location ⭐ NEW
6. Click "Create User"
7. User receives invitation email
8. User sets password via magic link

### Create Location Hierarchy
1. Navigate to `/admin/locations`
2. Create parent location (e.g., Central Division)
3. Create child location (e.g., Suva Station)
4. Select parent in dropdown
5. Child shows under parent in table

### Assign User to Location
1. Navigate to `/admin/users`
2. Click edit on user
3. Select location from dropdown ⭐ NEW
4. Save changes
5. Location appears in users table

---

## 💡 Tips & Best Practices

### Development
- Always use absolute paths with `@/` prefix
- Keep components small and focused
- Use TypeScript for type safety
- Follow naming conventions (kebab-case for files)

### Database
- Never use raw SQL unless necessary
- Always use Supabase SDK
- Leverage RLS policies
- Use transactions for multi-step operations

### UI/UX
- Show loading states
- Provide clear error messages
- Use toast for feedback
- Confirm destructive actions

### Security
- Validate on both client and server
- Check permissions in API routes
- Use Row Level Security (RLS)
- Never expose sensitive data

---

## 🎉 Recent Achievements

### Today (Oct 19, 2025)
- ✅ Completed Location Management System
- ✅ Created Location Selector Component
- ✅ Implemented Real User Creation with Auth
- ✅ Added Email Invitation System
- ✅ Integrated Locations into User Management

### This Week
- ✅ Agency Admin Assignment
- ✅ User Management Enhancements
- ✅ Toast Notification System
- ✅ Role Badge Component

---

## 📞 Quick Help

### Getting Errors?
1. Check `docs/ERROR_RESOLUTION.md`
2. Verify all environment variables
3. Restart dev server
4. Check Supabase dashboard

### Need to Add a Feature?
1. Check `docs/sprint-tracker.md` for planning
2. Update database schema if needed
3. Generate new types
4. Create components
5. Add to navigation
6. Test thoroughly
7. Document in `/docs`

### Deploying?
1. Set environment variables
2. Run `npm run build`
3. Test production build
4. Deploy to Vercel/similar
5. Run database migrations
6. Test in production

---

**For detailed information, see individual documentation files in `/docs`**

**Sprint 1 Status:** 95% Complete ✅  
**Next Focus:** Final testing & Sprint 2 planning

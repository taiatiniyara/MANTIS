# 🎯 MANTIS - Project Status & Quick Start

**Last Updated:** October 16, 2025

---

## ✅ What's Ready

### 🏗️ Infrastructure
- ✅ Project structure set up
- ✅ Database schema defined (2 migrations)
  - `001_init.sql` - Core tables (agencies, users, teams, infringements)
  - `002_finance_reports.sql` - Finance aggregation view
- ✅ Seed data prepared (agencies, locations, infringement types)
- ✅ Dependencies installed (web & mobile)
- ✅ Environment templates created

### 📦 Tech Stack
- **Web**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Mobile**: React Native, Expo, Expo Router
- **Backend**: Supabase (Postgres + Auth + RLS)
- **Design**: Blue/Zinc color scheme, Light mode only

---

## ⚠️ What Needs Setup

### 🔧 Before You Can Run the Apps:

1. **Create Supabase Project**
   - Go to https://supabase.com and create a new project
   - Wait for project initialization (~2 minutes)

2. **Configure Environment Variables**
   ```bash
   # Web
   cd web
   cp .env.local.example .env.local
   # Add your Supabase URL and keys
   
   # Mobile
   cd mobile
   cp .env.example .env
   # Add your Supabase URL and keys
   ```

3. **Initialize Database**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Push migrations
   supabase db push
   
   # Seed initial data
   supabase db seed
   ```

4. **Add RLS Policies** (Coming next - Sprint 1)
   - Row Level Security policies need to be added
   - Will enforce role-based access control

---

## 🚀 Quick Commands

### Web Dashboard
```bash
cd web
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run linter
```

### Mobile App
```bash
cd mobile
npm start            # Start Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run in browser
```

### Database
```bash
supabase db push     # Apply migrations
supabase db reset    # Reset database
supabase db seed     # Run seed data
supabase migration new <name>  # Create new migration
```

---

## 📊 Sprint Roadmap

### **Sprint 0: Foundation** ✅ CURRENT
- [x] Project structure
- [x] Database schema
- [x] Environment setup
- [ ] Supabase project created
- [ ] RLS policies added

### **Sprint 1: Agencies & Users** 🎯 NEXT
- [ ] Super Admin: Create/manage agencies
- [ ] Agency Admin: Manage users
- [ ] RLS policies for role separation
- [ ] User authentication flows

### **Sprint 2: Teams & Routes**
- [ ] Agency Admin: Create/manage teams
- [ ] Define routes
- [ ] Assign officers to teams

### **Sprint 3: Infringement Recording MVP**
- [ ] Officer mobile: Record infringement
- [ ] Web dashboard: View infringements
- [ ] Search and filter

### **Sprint 4: Reporting & Finance**
- [ ] Agency reports
- [ ] Super Admin: Cross-agency reporting
- [ ] GL code aggregation

### **Sprint 5: Refinement**
- [ ] UX improvements
- [ ] Audit logging
- [ ] Performance optimization

---

## 🗂️ Database Schema Overview

### Core Tables
- `agencies` - Top-level organizations (Police, LTA, Councils)
- `users` - System users linked to auth.users
- `locations` - Hierarchical locations (divisions, stations, regions)
- `teams` - Enforcement teams
- `routes` - Geographic patrol routes
- `infringement_categories` - Broad categories (Speeding, Parking, etc.)
- `infringement_types` - Specific offenses with fines, demerits, GL codes
- `infringements` - Recorded violations

### Relationships
- Users → Agency → Locations
- Teams → Routes (many-to-many)
- Teams → Members (many-to-many)
- Infringements → Officer, Agency, Team, Route, Type, Location

### Roles
- **super_admin** - Manage all agencies
- **agency_admin** - Manage own agency
- **officer** - Record infringements

---

## 📝 Key Files

### Documentation
- `README.md` - Project overview
- `GETTING_STARTED.md` - Detailed setup guide
- `docs/system-design.md` - Architecture
- `docs/schema.md` - Database details
- `docs/api-spec.md` - API documentation
- `docs/sprint-tracker.md` - Sprint details

### Database
- `db/migrations/001_init.sql` - Core schema
- `db/migrations/002_finance_reports.sql` - Finance view
- `db/seeds/001_seed.sql` - Initial data

### Web App
- `web/app/page.tsx` - Home page
- `web/app/auth/*` - Authentication pages
- `web/app/protected/*` - Protected routes
- `web/lib/supabase/*` - Supabase clients

### Mobile App
- `mobile/app/(tabs)/*` - Tab navigation screens
- `mobile/components/*` - Reusable components
- `mobile/constants/theme.ts` - Design tokens

---

## 🎨 Design System

### Colors
- **Primary**: Blue (for actions, links)
- **Neutral**: Zinc (for text, backgrounds)
- **Mode**: Light only (no dark mode)

### Typography
- Professional hierarchy
- Consistent across web and mobile

### Components
- Using shadcn/ui for web
- Custom components for mobile matching web design

---

## 🆘 Common Issues & Solutions

### "Supabase URL not defined"
→ Create `.env.local` (web) or `.env` (mobile) with your Supabase credentials

### "Migration failed"
→ Ensure you're linked to the correct project: `supabase link`

### "Port 3000 already in use"
→ Kill the process or use a different port: `npm run dev -- -p 3001`

### "Expo app won't start"
→ Clear cache: `npx expo start --clear`

---

## 🎯 What to Work On Now?

### If you haven't set up Supabase:
1. Create your Supabase project
2. Configure environment variables
3. Push migrations and seed data
4. Test the database in Supabase dashboard

### If Supabase is ready:
1. **Add RLS policies** (security layer)
2. **Build Super Admin UI** (create agencies)
3. **Set up authentication** (login/signup flows)
4. **Create agency management pages**
5. **Build mobile login screen**

---

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Expo Docs**: https://docs.expo.dev
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 🤝 Need Help?

Check the following files for detailed information:
- `GETTING_STARTED.md` - Step-by-step setup
- `docs/onboarding.md` - Onboarding guide
- `docs/system-design.md` - System architecture
- `docs/api-spec.md` - API reference

---

**Ready to build? Start with creating your Supabase project!** 🚀

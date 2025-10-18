# ⚡ MANTIS Quick Commands Reference

Quick copy-paste commands for common tasks.

---

## 🚀 Initial Setup

### Install Supabase CLI
```bash
# Windows: Use npx (no installation needed)
npx supabase --version

# Mac/Linux: Install via Homebrew
brew install supabase/tap/supabase
```

### Link Project
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Push Migrations
```bash
npx supabase db push
```

### Seed Database
```bash
npx supabase db seed
```

---

## 💻 Development

### Start Web App
```bash
cd web
npm run dev
```
Visit: http://localhost:3000

### Start Mobile App
```bash
cd mobile
npm start
```
Then: Press `i` for iOS, `a` for Android, or scan QR code

### Build Web for Production
```bash
cd web
npm run build
npm start
```

---

## 🗄️ Database Commands

### Push All Migrations
```bash
npx supabase db push
```

### Create New Migration
```bash
npx supabase migration new migration_name
```

### Reset Database (⚠️ DESTRUCTIVE)
```bash
npx supabase db reset
```

### Generate TypeScript Types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > web/lib/database.types.ts
```

### Check Database Connection
```bash
npx supabase db ping
```

### View Migration Status
```bash
npx supabase migration list
```

---

## 🎨 Add UI Components (shadcn/ui)

### Add Component
```bash
cd web
npx shadcn@latest add [component-name]
```

### Common Components
```bash
# Add multiple components at once
npx shadcn@latest add button input label card table dialog select
```

---

## 📦 Package Management

### Install Dependencies
```bash
# Web
cd web && npm install

# Mobile
cd mobile && npm install
```

### Add New Package
```bash
# Web
cd web && npm install package-name

# Mobile
cd mobile && npm install package-name
```

### Update Dependencies
```bash
npm update
```

---

## 🔍 Debugging

### Check Environment Variables
```bash
# Web
cd web
cat .env.local

# Mobile
cd mobile
cat .env
```

### View Supabase Logs
```bash
supabase logs
```

### Check for Errors
```bash
cd web
npm run lint
```

### Clear Cache (Mobile)
```bash
cd mobile
npx expo start --clear
```

---

## 🌐 Supabase Dashboard Quick Links

When logged into your project at https://supabase.com/dashboard:

- **Table Editor**: `/project/YOUR_REF/editor`
- **SQL Editor**: `/project/YOUR_REF/sql`
- **Authentication**: `/project/YOUR_REF/auth/users`
- **API Settings**: `/project/YOUR_REF/settings/api`
- **Database Settings**: `/project/YOUR_REF/settings/database`

---

## 🔐 Create Super Admin User (SQL)

```sql
-- Run this in Supabase SQL Editor
-- Replace with your actual user UUID from auth.users

INSERT INTO public.users (id, role)
VALUES ('YOUR_AUTH_USER_UUID', 'super_admin');
```

---

## 🐛 Troubleshooting Commands

### Port Already in Use
```bash
# Find process on port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
npm run dev -- -p 3001
```

### Clear Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

### Fix Git Issues
```bash
# Discard all changes
git reset --hard HEAD

# Update from remote
git pull origin main

# Check status
git status
```

---

## 📝 Git Workflow

### Commit Changes
```bash
git add .
git commit -m "feat: description of feature"
git push origin main
```

### Create Feature Branch
```bash
git checkout -b feature/feature-name
# Make changes
git add .
git commit -m "feat: feature description"
git push origin feature/feature-name
```

### Conventional Commit Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

---

## 🧪 Testing

### Run Linter
```bash
cd web
npm run lint
```

### Type Check
```bash
cd web
npx tsc --noEmit
```

---

## 📱 Mobile Specific

### Run on Specific Device
```bash
# iOS Simulator
npm run ios

# Android Emulator  
npm run android

# Web Browser
npm run web
```

### View Logs
```bash
npx expo start --dev-client
# Press 'j' to open debugger
```

### Build for Production
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

---

## 💾 Backup Database

### Export Schema
```bash
npx supabase db dump --schema public > backup.sql
```

### Export Data
```bash
npx supabase db dump --data-only > data.sql
```

---

## 🔄 Reset Everything (Fresh Start)

```bash
# 1. Reset database
npx supabase db reset

# 2. Clear web cache
cd web
rm -rf .next node_modules
npm install

# 3. Clear mobile cache
cd ../mobile
rm -rf node_modules
npm install
npx expo start --clear

# 4. Restart dev servers
cd ../web
npm run dev

# In another terminal
cd mobile
npm start
```

---

## 📊 Useful Queries

### Check User Roles
```sql
SELECT id, role, agency_id, created_at 
FROM public.users;
```

### View All Agencies
```sql
SELECT * FROM public.agencies ORDER BY name;
```

### Count Infringements by Agency
```sql
SELECT 
  a.name as agency,
  COUNT(i.id) as total_infringements
FROM agencies a
LEFT JOIN infringements i ON i.agency_id = a.id
GROUP BY a.id, a.name
ORDER BY total_infringements DESC;
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🎯 Current Project Status

```bash
# Check what's running
ps aux | grep "next\|expo"

# Check git status
git status

# Check branches
git branch -a

# View recent commits
git log --oneline -10
```

---

## 📞 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Expo Docs**: https://docs.expo.dev
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**💡 Tip**: Bookmark this file for quick reference during development!

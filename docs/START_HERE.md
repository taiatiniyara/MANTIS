# 🚀 MANTIS - Ready to Start!

## 📌 Current Status: **Sprint 0 Complete ✅**

Your MANTIS project is set up and ready to begin active development!

---

## 🎯 Immediate Next Steps (Choose One Path)

### Path A: 🏃 Quick Start (If you have Supabase ready)
If you already have a Supabase project set up:

1. **Configure Environment**
   ```bash
   # Web app
   cd web
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

2. **Link and Initialize Database**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   supabase db seed
   ```

3. **Start Developing**
   ```bash
   # Terminal 1: Web app
   cd web && npm run dev
   
   # Terminal 2: Check Supabase dashboard
   # Visit your project at https://supabase.com/dashboard
   ```

### Path B: 🐢 Full Setup (Starting from scratch)
If you need to create everything:

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization and name it (e.g., "mantis-fiji")
   - Set a database password (save it!)
   - Choose region (closest to Fiji: Sydney or Singapore)
   - Wait ~2 minutes for setup

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy these three values:
     - `Project URL`
     - `anon` `public` key
     - `service_role` `secret` key

3. **Follow Path A steps above**

---

## 🎨 First Features to Build (Sprint 1)

Once your environment is running, here's what to work on:

### 1. **Add Row Level Security (RLS)** 🔒
**Why:** Secure your database so users only see their agency's data

**What to do:**
- Create a new migration: `supabase migration new add_rls_policies`
- Add policies for each table (see `docs/schema.md`)
- Test with different user roles

**Example policy:**
```sql
-- Allow super admins to see all agencies
create policy "Super admins can view all agencies"
  on agencies for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );
```

### 2. **Build Super Admin Dashboard** 👑
**Why:** First user interface to manage agencies

**What to do:**
- Create `/app/admin/agencies/page.tsx`
- Fetch agencies from Supabase
- Display in a table using shadcn/ui components
- Add "Create Agency" button → form modal

**Tech to use:**
- `@supabase/ssr` for server-side data fetching
- shadcn/ui `<Table>` component
- shadcn/ui `<Dialog>` for modal
- Tailwind for styling

### 3. **Set Up Authentication** 🔐
**Why:** Users need to log in!

**What to do:**
- The auth pages already exist in `web/app/auth/`
- Test the login flow
- Customize the forms to match MANTIS branding
- Add role assignment after signup

**Files to modify:**
- `web/app/auth/login/page.tsx`
- `web/components/login-form.tsx`
- Update colors to blue/zinc theme

---

## 📚 Helpful Resources

### Documentation to Read
1. `PROJECT_STATUS.md` - Overall project state
2. `GETTING_STARTED.md` - Detailed setup guide
3. `CHECKLIST.md` - Development checklist
4. `docs/system-design.md` - Architecture overview
5. `docs/schema.md` - Database schema reference

### Code to Explore
- `web/lib/supabase/` - Supabase client setup
- `web/components/ui/` - shadcn/ui components
- `web/app/auth/` - Authentication flows
- `db/migrations/` - Database schema

### External Docs
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 🧪 Testing Your Setup

### Verify Database
```bash
# Check if migrations were applied
supabase db diff

# Open Supabase Studio locally
supabase start

# View your database in browser
# Visit: http://localhost:54323
```

### Verify Web App
```bash
cd web
npm run dev

# Visit: http://localhost:3000
# You should see the landing page
```

### Verify Mobile App
```bash
cd mobile
npm start

# Scan QR code with Expo Go app
# Or press 'i' for iOS simulator
# Or press 'a' for Android emulator
```

---

## 🐛 Common First-Time Issues

### "Supabase URL is not defined"
**Solution:** Make sure you created `.env.local` in the `web/` directory

### "Migration failed: relation already exists"
**Solution:** Reset your database: `supabase db reset`

### "Cannot find module 'next'"
**Solution:** Install dependencies: `cd web && npm install`

### "Port 3000 already in use"
**Solution:** Kill the process or use different port: `npm run dev -- -p 3001`

---

## 💡 Development Tips

### Use the Supabase Dashboard
- View your tables: Table Editor
- Test queries: SQL Editor
- Check auth users: Authentication
- View API logs: API Logs

### Use the Checklist
- Open `CHECKLIST.md`
- Mark items complete as you finish them
- Track your progress through each sprint

### Commit Often
```bash
git add .
git commit -m "feat: add agency management page"
git push origin main
```

### Ask for Help
- Check `docs/` folder for detailed documentation
- Review existing code in `web/` and `mobile/`
- Test queries in Supabase SQL Editor before adding to code

---

## 🎯 Your Sprint 1 Goals

By the end of Sprint 1 (2 weeks), you should have:

- ✅ RLS policies protecting all tables
- ✅ Super Admin can create and manage agencies
- ✅ Agency Admin can view their agency's data
- ✅ Authentication flows working (login/signup)
- ✅ User management UI for agency admins
- ✅ Role assignment functionality

---

## 🏁 Ready to Code?

**Recommended first task:**

1. Create your Supabase project (if not done)
2. Set up environment variables
3. Push migrations and seeds
4. Start the web dev server
5. Open `web/app/admin/agencies/page.tsx` and start building!

---

## 📞 Quick Reference

### Start Development
```bash
# Web
cd web && npm run dev

# Mobile
cd mobile && npm start

# Database (local)
supabase start
```

### Key Directories
- `web/app/` - Next.js pages
- `web/components/` - React components
- `mobile/app/` - Expo screens
- `db/migrations/` - Database changes
- `docs/` - Documentation

### Key Commands
- `supabase db push` - Apply migrations
- `supabase db reset` - Reset database
- `supabase gen types typescript` - Generate TypeScript types
- `npm run dev` - Start development server

---

**You're all set! Happy coding! 🚀**

Questions? Check `docs/` or review the code in `web/` and `mobile/`.

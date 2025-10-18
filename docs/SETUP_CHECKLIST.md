# ✅ MANTIS Setup Checklist - Follow Along!

**Current Date**: October 16, 2025  
**Your System**: Windows with Git Bash

---

## 🎯 Complete These Steps in Order

### Phase 1: Supabase Project Setup

#### ☐ Step 1.1: Create Supabase Account & Project
- [ ] Go to https://supabase.com/dashboard
- [ ] Sign in or create an account
- [ ] Click "New Project"
- [ ] Project Name: `mantis-fiji`
- [ ] Database Password: _________________ (Write it down!)
- [ ] Region: `Sydney` or `Singapore`
- [ ] Click "Create new project"
- [ ] Wait ~2 minutes for setup ☕

#### ☐ Step 1.2: Collect Your Credentials
- [ ] Go to Settings → API
- [ ] Copy Project URL: _________________
- [ ] Copy anon public key: _________________
- [ ] Copy service_role key: _________________
- [ ] Go to Settings → General
- [ ] Copy Reference ID: _________________

**💡 Tip**: Keep this tab open or paste values in a notepad!

---

### Phase 2: Environment Configuration

#### ☐ Step 2.1: Configure Web App Environment
Run these commands:
```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS/web"
cp .env.local.example .env.local
code .env.local
```

- [ ] File opened in VS Code
- [ ] Paste Project URL in `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Paste anon key in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Paste service_role key in `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Save file (Ctrl+S)
- [ ] Close file

#### ☐ Step 2.2: Configure Mobile App Environment
Run these commands:
```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS/mobile"
cp .env.example .env
code .env
```

- [ ] File opened in VS Code
- [ ] Paste Project URL in `EXPO_PUBLIC_SUPABASE_URL`
- [ ] Paste anon key in `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Save file (Ctrl+S)
- [ ] Close file

---

### Phase 3: Database Setup

#### ☐ Step 3.1: Link Your Project
Run from MANTIS root:
```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS"
npx supabase link --project-ref YOUR_REFERENCE_ID
```

- [ ] Replace YOUR_REFERENCE_ID with your actual ID
- [ ] Enter database password when prompted
- [ ] See success message: "Linked to project..."

**Troubleshooting**:
- If it fails, make sure you're using the correct Reference ID
- Password must match what you set in Supabase dashboard

#### ☐ Step 3.2: Push Database Migrations
Run:
```bash
npx supabase db push
```

Expected output:
```
✓ Connecting to Supabase
✓ Applying migration 001_init.sql
✓ Applying migration 002_finance_reports.sql
✓ Applying migration 003_rls_policies.sql
```

- [ ] Migration 001 applied successfully
- [ ] Migration 002 applied successfully  
- [ ] Migration 003 applied successfully (RLS policies)
- [ ] No errors shown

**Troubleshooting**:
- If "relation already exists": Tables were already created, you can skip this
- If connection error: Check your .env.local file has correct credentials

#### ☐ Step 3.3: Seed Sample Data (Optional)
Run:
```bash
npx supabase db seed
```

- [ ] Seed data loaded successfully
- [ ] See confirmation message

---

### Phase 4: Verify Database Setup

#### ☐ Step 4.1: Check Tables in Supabase
Go to Supabase Dashboard → Table Editor:

- [ ] `agencies` table exists
- [ ] `locations` table exists
- [ ] `users` table exists
- [ ] `teams` table exists
- [ ] `routes` table exists
- [ ] `infringement_categories` table exists
- [ ] `infringement_types` table exists
- [ ] `infringements` table exists

#### ☐ Step 4.2: Check Seed Data (if you ran seed)
Click on `agencies` table:
- [ ] See 6 agencies (Police, LTA, Councils)

Click on `infringement_categories` table:
- [ ] See multiple categories (Speeding, Parking, etc.)

---

### Phase 5: Create Super Admin User

#### ☐ Step 5.1: Create Auth User
In Supabase Dashboard:
- [ ] Go to Authentication → Users
- [ ] Click "Add user"
- [ ] Email: _________________ (your email)
- [ ] Password: _________________ (save this!)
- [ ] ✓ Check "Auto Confirm User"
- [ ] Click "Create user"
- [ ] Copy the UUID: _________________

#### ☐ Step 5.2: Add User to Users Table
In Supabase Dashboard:
- [ ] Go to Table Editor → users
- [ ] Click "Insert row"
- [ ] `id`: Paste the UUID from above
- [ ] `role`: Select `super_admin`
- [ ] Leave other fields NULL
- [ ] Click "Save"
- [ ] Verify row appears in table

---

### Phase 6: Test the Application

#### ☐ Step 6.1: Start Web Development Server
Run:
```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS/web"
npm run dev
```

Expected output:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
✓ Ready in Xms
```

- [ ] Server started successfully
- [ ] No errors in console
- [ ] Port 3000 is ready

#### ☐ Step 6.2: Test Landing Page
- [ ] Open browser: http://localhost:3000
- [ ] Page loads without errors
- [ ] See MANTIS branding/content

#### ☐ Step 6.3: Test Login
- [ ] Go to: http://localhost:3000/auth/login
- [ ] Enter your super admin email
- [ ] Enter your password
- [ ] Click "Sign in"
- [ ] Successfully logged in (redirected)

#### ☐ Step 6.4: Access Admin Dashboard
- [ ] Go to: http://localhost:3000/admin
- [ ] See "Dashboard" page with statistics
- [ ] See navigation: Agencies, Users, Reports
- [ ] See your email in top right
- [ ] See 4 stat cards (Agencies, Users, Infringements, Active Rate)

#### ☐ Step 6.5: Test Agency Management
- [ ] Click "Agencies" in navigation
- [ ] See list of agencies (if seed data loaded)
- [ ] Click "Create Agency" button
- [ ] Dialog opens
- [ ] Enter name: "Test Agency"
- [ ] Click "Create Agency"
- [ ] Dialog closes
- [ ] New agency appears in table

---

## 🎉 Success! You're Ready to Develop!

If all checkboxes above are checked, your MANTIS system is fully set up!

---

## 🐛 Common Issues & Solutions

### Issue: Cannot log in
**Solution**:
- Check "Auto Confirm User" was checked when creating auth user
- Verify user exists in Authentication → Users
- Verify user exists in Table Editor → users with super_admin role
- Make sure IDs match exactly between auth.users and users table

### Issue: Access denied to /admin
**Solution**:
- Check your user has role = 'super_admin' in users table
- Make sure you're logged in (check top right of page)
- Try logging out and back in

### Issue: Database connection errors
**Solution**:
- Verify .env.local file exists in web/ directory
- Check no typos in environment variables
- No extra spaces or quotes around values
- Restart dev server after changing .env.local

### Issue: Tables don't appear in Supabase
**Solution**:
- Make sure migrations were pushed successfully
- Check Supabase project is active (not paused)
- Try running: npx supabase db push again

---

## 📊 Your Progress

Count your checkmarks:
- [ ] Phase 1: Supabase Setup (2 steps)
- [ ] Phase 2: Environment Config (2 steps)
- [ ] Phase 3: Database Setup (3 steps)
- [ ] Phase 4: Verify Database (2 steps)
- [ ] Phase 5: Create Super Admin (2 steps)
- [ ] Phase 6: Test Application (5 steps)

**Total**: ___ / 16 steps complete

---

## 🎯 What's Next?

Once all steps are complete:

1. **Explore the codebase**:
   - Check `web/app/admin/` for admin pages
   - Review `db/migrations/003_rls_policies.sql` for security
   - Look at `web/components/admin/` for UI components

2. **Build next features**:
   - Add edit/delete agency functionality
   - Create user management page
   - Build agency admin assignment

3. **Follow Sprint 1 checklist**:
   - Open `CHECKLIST.md`
   - Mark completed items
   - Continue with remaining tasks

---

## 📞 Need Help?

**Stuck on a step?**
- Review `WINDOWS_SETUP.md` for detailed instructions
- Check `DATABASE_SETUP.md` for database-specific help
- Read `COMMANDS.md` for quick command reference

**Still having issues?**
- Double-check all environment variables
- Verify Supabase project is in "Active" status
- Try resetting: `npx supabase db reset` and start over

---

**Good luck! You've got this! 🚀**

---

**Print this checklist or keep it open while you work through the setup!**

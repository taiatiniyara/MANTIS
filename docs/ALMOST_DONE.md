# 🎉 Database Setup Complete!

## ✅ What We've Accomplished:

1. ✅ Linked Supabase project (`iftscgsnqurgvscedhiv`)
2. ✅ Pushed all migrations successfully:
   - `001_init.sql` - Created all database tables
   - `002_finance_reports.sql` - Created finance view
   - `003_rls_policies.sql` - Applied Row Level Security policies
3. ✅ All tables created with proper security

---

## 📊 Tables Created in Your Database:

Check your Supabase dashboard → Table Editor to see:

- ✅ `agencies` - Enforcement agencies
- ✅ `locations` - Hierarchical locations
- ✅ `users` - System users
- ✅ `teams` - Enforcement teams
- ✅ `routes` - Geographic routes
- ✅ `team_routes` - Team-route assignments
- ✅ `team_members` - Team member assignments
- ✅ `infringement_categories` - Categories (Speeding, Parking, etc.)
- ✅ `infringement_types` - Specific offenses with fines
- ✅ `infringements` - Recorded violations
- ✅ `finance_reports` (view) - Finance aggregation

---

## 🔐 Next Step: Create Your Super Admin User

### Step 1: Create Authentication User

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to your project: `iftscgsnqurgvscedhiv`
3. Click **Authentication** in the left sidebar
4. Click **Users** tab
5. Click **Add user** button (top right)
6. Fill in:
   - **Email**: Your email (e.g., `admin@mantis.gov.fj`)
   - **Password**: Choose a secure password
   - **✓ Auto Confirm User**: **CHECK THIS BOX!** (Very important!)
7. Click **Create user**
8. **Copy the UUID** that appears (looks like: `123e4567-e89b-12d3-a456-426614174000`)

### Step 2: Add User to Users Table

1. Still in Supabase dashboard
2. Click **Table Editor** in the left sidebar
3. Click on the **users** table
4. Click **Insert row** button (top right, green plus icon)
5. Fill in these fields:
   - **id**: Paste the UUID you copied from Step 1
   - **role**: Select `super_admin` from the dropdown
   - **agency_id**: Leave as NULL
   - **position**: Type `Super Administrator` (optional)
   - **location_id**: Leave as NULL
   - **created_at**: Will auto-fill
6. Click **Save** (or press Enter)

### Step 3: Verify

1. Go back to **Table Editor** → **users**
2. You should see your user with role `super_admin`

---

## 🚀 Step 4: Start the Development Server

Now let's test your application!

```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS/web"
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
✓ Ready in Xms
```

---

## 🧪 Step 5: Test Your Application

### 5.1: Test Landing Page
1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the MANTIS landing page (no errors!)

### 5.2: Test Login
1. Go to: **http://localhost:3000/auth/login**
2. Enter your super admin email
3. Enter your password
4. Click **Sign in**
5. You should be logged in and redirected

### 5.3: Access Admin Dashboard
1. Go to: **http://localhost:3000/admin**
2. You should see:
   - Dashboard with statistics
   - Navigation: Agencies, Users, Reports
   - Your email in the top right
   - 4 stat cards showing counts

### 5.4: Test Agency Management
1. Click **Agencies** in the navigation
2. You should see an empty table (no agencies yet)
3. Click **Create Agency** button
4. Enter name: `Test Agency`
5. Click **Create Agency**
6. The dialog closes and your new agency appears in the table!

### 5.5: Check Supabase
1. Go back to Supabase Table Editor → **agencies**
2. You should see your "Test Agency" in the database!

---

## 🎉 Success Criteria

You've succeeded if:
- ✅ http://localhost:3000 loads without errors
- ✅ You can log in with your super admin account
- ✅ http://localhost:3000/admin shows the dashboard
- ✅ You can click "Agencies" and see the agency management page
- ✅ You can create a new agency
- ✅ The new agency appears in both the UI and Supabase Table Editor

---

## 🐛 Troubleshooting

### "Cannot log in" or "Invalid credentials"
- Did you check **"Auto Confirm User"** when creating the auth user?
- Is the email correct?
- Is the password correct?
- Try creating the user again with Auto Confirm checked

### "Access denied" or "Insufficient permissions"
- Check in Table Editor → users that your user exists
- Verify the `id` matches the auth user's UUID exactly
- Verify the `role` is set to `super_admin`
- Try refreshing the page after updating the users table

### Server won't start
- Check if port 3000 is already in use
- Try closing other applications
- Or run on a different port: `npm run dev -- -p 3001`

### "Supabase URL not defined" error
- Check web/.env.local file exists and has all three variables
- Restart the dev server after any .env.local changes

---

## 📝 Quick Commands

```bash
# Start web dev server
cd web && npm run dev

# Check if migrations applied
npx supabase migration list

# View database schema
# Go to: https://supabase.com/dashboard → Table Editor

# Generate fresh TypeScript types
npx supabase gen types typescript --project-id iftscgsnqurgvscedhiv > web/lib/database.types.ts
```

---

## 🎯 What's Next After Testing?

Once everything is working:

1. **Add More Agencies** (Optional)
   - Fiji Police Force
   - Land Transport Authority
   - Suva City Council
   - etc.

2. **Build More Features** (Sprint 1)
   - Add edit/delete agency functionality
   - Create user management page
   - Assign agency admins

3. **Continue Development**
   - Check `CHECKLIST.md` for next tasks
   - Follow Sprint 1 goals in `PROJECT_STATUS.md`

---

## 📊 Your Progress

```
Setup Complete! 🎉

✅ Supabase project created
✅ Environment configured
✅ Project linked
✅ Migrations pushed
✅ Tables created
✅ RLS policies applied
⬜ Super admin user created ← DO THIS NOW
⬜ Application tested
```

---

## 🚀 Ready to Test!

**Next actions:**
1. Create super admin user (Steps 1-2 above)
2. Start dev server: `cd web && npm run dev`
3. Test at http://localhost:3000/admin
4. Create your first agency!

---

**You're almost there! Just create the super admin user and you're ready to code!** 🎉

# 🎯 Final Steps - Complete Setup Now!

## ✅ What's Done:
- ✅ All database tables created
- ✅ All security policies applied
- ✅ Environment variables configured
- ✅ Project linked to Supabase

---

## 🚀 What You Need To Do Right Now:

### Step 1: Create Super Admin User (3 minutes)

#### A. Create Authentication User:

1. Open a new browser tab
2. Go to: **https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv/auth/users**
3. Click the green **"Add user"** button (top right)
4. Fill in the form:
   ```
   Email:    [Enter your email, e.g., admin@mantis.gov.fj]
   Password: [Choose a secure password - save it!]
   
   ✓ Auto Confirm User: [CHECK THIS BOX!]
   ```
5. Click **"Create user"**
6. **IMPORTANT**: Copy the UUID that appears
   - It looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Save it temporarily (paste in notepad or keep the tab open)

#### B. Add User to Users Table:

1. In the same Supabase dashboard, click **"Table Editor"** (left sidebar)
2. Click on the **"users"** table
3. Click **"Insert"** → **"Insert row"** (green button with + icon)
4. Fill in the row:
   ```
   id:          [Paste the UUID you copied above]
   agency_id:   [Leave as NULL]
   role:        [Click dropdown, select "super_admin"]
   position:    Super Administrator [optional]
   location_id: [Leave as NULL]
   created_at:  [Will auto-fill]
   ```
5. Click **"Save"** (bottom right)

#### C. Verify:
- You should see your row in the users table
- The role should show: `super_admin`
- The id should match your auth user's UUID

---

### Step 2: Start the Development Server (30 seconds)

Open a terminal in VS Code and run:

```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS/web"
npm run dev
```

**Expected output:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
✓ Ready in 2s
```

**Keep this terminal running!** Don't close it.

---

### Step 3: Test Your Application (2 minutes)

#### A. Test Landing Page:
1. Open browser: http://localhost:3000
2. ✅ Should load without errors

#### B. Test Login:
1. Go to: http://localhost:3000/auth/login
2. Enter your email (the one you used in Step 1A)
3. Enter your password
4. Click **"Sign in"**
5. ✅ Should log in successfully

#### C. Access Admin Dashboard:
1. Go to: http://localhost:3000/admin
2. ✅ Should see:
   - "Dashboard" heading
   - 4 stat cards (Agencies, Users, Infringements, Active Rate)
   - Navigation: Agencies | Users | Reports
   - Your email in top right corner

#### D. Create Your First Agency:
1. Click **"Agencies"** in the navigation
2. Should see empty table with message: "No agencies found"
3. Click **"Create Agency"** button (top right)
4. Enter name: `Fiji Police Force`
5. Click **"Create Agency"**
6. ✅ Dialog closes, agency appears in table!

#### E. Verify in Database:
1. Go back to Supabase: https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv/editor
2. Click **Table Editor** → **agencies** table
3. ✅ Should see "Fiji Police Force" in the table!

---

## 🎉 Success!

If all the above works, you now have:
- ✅ Working authentication system
- ✅ Functioning admin dashboard
- ✅ Agency management feature
- ✅ Secure database with RLS
- ✅ Ready to build more features!

---

## 🐛 Quick Troubleshooting

### Problem: "Cannot log in"
**Solution**: 
- Go back to Supabase → Authentication → Users
- Click on your user
- Check if "Confirmed" shows Yes
- If No, click "Confirm User"

### Problem: "Access denied to /admin"
**Solution**:
- Go to Supabase → Table Editor → users
- Check your user exists with role = `super_admin`
- Check the id matches your auth user's UUID exactly
- Try logging out and back in

### Problem: "Cannot create agency"
**Solution**:
- Check browser console for errors (F12)
- Verify you're logged in (see email in top right)
- Check RLS policies were applied (go to Supabase → Authentication → Policies)

### Problem: Server won't start
**Solution**:
- Check if port 3000 is already in use
- Try: `npm run dev -- -p 3001` (use port 3001 instead)
- Or kill existing process and try again

---

## 📋 Checklist

- [ ] Created auth user in Supabase (with Auto Confirm checked)
- [ ] Copied the UUID
- [ ] Added user to users table with super_admin role
- [ ] Started dev server (`npm run dev`)
- [ ] Visited http://localhost:3000 (loads successfully)
- [ ] Logged in at http://localhost:3000/auth/login
- [ ] Accessed http://localhost:3000/admin (see dashboard)
- [ ] Clicked "Agencies" in navigation
- [ ] Created first agency
- [ ] Verified agency in Supabase Table Editor

---

## 🎯 What's Next?

Once everything is working:

1. **Explore the Dashboard**
   - Check out the different pages
   - Try creating multiple agencies

2. **Continue Development** (Sprint 1)
   - Add edit/delete agency functionality
   - Build user management page
   - Assign agency admins

3. **Follow the Checklist**
   - Open: `CHECKLIST.md`
   - Track your Sprint 1 progress

4. **Add More Features**
   - Check: `PROJECT_STATUS.md` for roadmap
   - Review: `docs/` folder for specifications

---

## 📞 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv
- **Add Users**: https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv/auth/users
- **Table Editor**: https://supabase.com/dashboard/project/iftscgsnqurgvscedhiv/editor
- **Local App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/auth/login

---

## 💻 Commands Reference

```bash
# Start web server
cd web && npm run dev

# Start on different port
cd web && npm run dev -- -p 3001

# Check Supabase connection
npx supabase status

# Generate TypeScript types
npx supabase gen types typescript --project-id iftscgsnqurgvscedhiv > web/lib/database.types.ts

# View tables
# Go to Supabase Dashboard → Table Editor
```

---

## 🎊 You're Ready!

**Current Status**: All code complete, database ready, just need to create super admin user!

**Time to completion**: ~5 minutes

**Next action**: Follow Step 1 above to create your super admin user

---

**Let's finish this! Follow the steps above and you'll be coding in 5 minutes!** 🚀

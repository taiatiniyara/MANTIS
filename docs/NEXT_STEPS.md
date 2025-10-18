# 🎯 Next Steps - Continue Setup

## ✅ What You've Done So Far:
1. ✅ Created environment files
2. ✅ Added Project URL to both `.env` files
3. ✅ Added anon key to both `.env` files
4. ⚠️ Need to add service_role key to `web/.env.local`

---

## 📝 Action Required: Add Service Role Key

### Step 1: Get Your Service Role Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `iftscgsnqurgvscedhiv`
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Find the **service_role** key (it's marked as `secret`)
6. Click to copy it

⚠️ **Important**: This key is SECRET! Never commit it to git.

### Step 2: Update web/.env.local

I just opened `web/.env.local` in VS Code. Replace this line:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

With your actual service_role key (it starts with `eyJhbGciOiJIUzI1...`)

**Save the file!** (Ctrl+S)

---

## 🚀 Continue with Database Setup

Once you've added the service_role key, continue with these steps:

### Step 3: Link Your Supabase Project

Your project reference ID is: `iftscgsnqurgvscedhiv`

Run this command:
```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS"
npx supabase link --project-ref iftscgsnqurgvscedhiv
```

You'll be prompted for your **database password** (the one you set when creating the Supabase project).

### Step 4: Push Migrations

This creates all your database tables and security policies:
```bash
npx supabase db push
```

Expected output:
```
✓ Applying migration 001_init.sql
✓ Applying migration 002_finance_reports.sql
✓ Applying migration 003_rls_policies.sql
```

### Step 5: Seed Sample Data (Optional)

Load sample agencies and infringement types:
```bash
npx supabase db seed
```

### Step 6: Create Super Admin User

#### 6.1: Create Auth User
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"**
3. Email: Your email (e.g., `admin@mantis.gov.fj`)
4. Password: Choose a secure password
5. ✓ Check **"Auto Confirm User"** ← IMPORTANT!
6. Click **"Create user"**
7. **Copy the user's UUID** (the long string starting with letters/numbers)

#### 6.2: Add to Users Table
1. Go to **Table Editor** → **users** table
2. Click **"Insert row"**
3. Fill in:
   - **id**: Paste the UUID you copied
   - **role**: Select `super_admin` from dropdown
   - Leave other fields as NULL
4. Click **"Save"**

### Step 7: Start the Development Server

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

### Step 8: Test Your Application

1. Open browser: **http://localhost:3000**
2. Go to login: **http://localhost:3000/auth/login**
3. Enter your super admin email and password
4. After login, go to: **http://localhost:3000/admin**
5. Click **"Agencies"** in the navigation
6. Try creating a new agency!

---

## 📋 Quick Command Summary

```bash
# 1. Link project
npx supabase link --project-ref iftscgsnqurgvscedhiv

# 2. Push migrations
npx supabase db push

# 3. Seed data (optional)
npx supabase db seed

# 4. Start dev server
cd web && npm run dev
```

---

## 🐛 Troubleshooting

### "Cannot link project"
- Check your database password is correct
- Try adding password to command: `--password YOUR_PASSWORD`

### "Migration failed"
- Tables might already exist (that's okay!)
- Check in Supabase Table Editor if tables are there

### "Cannot log in"
- Did you check "Auto Confirm User" when creating the auth user?
- Did you add the user to the `users` table?
- Is the UUID exactly the same in both places?

### "Access denied"
- Check the user's role is `super_admin` in the users table
- Make sure you're logged in

---

## 📊 Your Progress

- [x] Create Supabase project
- [x] Get credentials
- [x] Configure mobile/.env
- [x] Configure web/.env.local (partial)
- [ ] Add service_role key ← **YOU ARE HERE**
- [ ] Link Supabase project
- [ ] Push migrations
- [ ] Seed data
- [ ] Create super admin user
- [ ] Test application

---

## 🎯 Current Task

**Right now**: Get your service_role key from Supabase and add it to `web/.env.local`

**File open**: I've opened `web/.env.local` in VS Code for you

**After that**: Run the commands in "Continue with Database Setup" above

---

**Need help?** Check `WINDOWS_SETUP.md` for detailed instructions!

🚀 **You're doing great! Just a few more steps to go!**

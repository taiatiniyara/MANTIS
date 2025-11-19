# 🪟 MANTIS Setup for Windows

**Using npx for Supabase CLI commands**

---

## Step 1: Create Your Supabase Project

### Go to Supabase Dashboard:
1. Visit: **https://supabase.com/dashboard**
2. Sign in or create an account
3. Click **"New Project"**

### Fill in Project Details:
- **Name**: `mantis-fiji` (or your preferred name)
- **Database Password**: Create a strong password **← SAVE THIS!**
- **Region**: Choose **`ap-southeast-2 (Sydney)`** or **`ap-southeast-1 (Singapore)`**
- **Plan**: Free tier is fine for development

### Wait for Setup:
- Click **"Create new project"**
- Wait ~2 minutes for initialization
- ☕ Grab a coffee while it sets up!

---

## Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings → API** (left sidebar)
2. Copy these three values:

### Project URL
```
https://xxxxxxxxxx.supabase.co
```

### API Keys
```
anon public:        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role:       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Also go to **Settings → General**
4. Copy your **Reference ID** (e.g., `abcdefghijkl`)

**💡 Tip**: Keep this browser tab open - you'll need these values!

---

## Step 3: Configure Environment Variables

### For Web App:

Open a new terminal in VS Code and run:

```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS/web"
cp .env.local.example .env.local
code .env.local
```

Paste your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save the file!** (Ctrl+S)

### For Mobile App:

```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS/mobile"
cp .env.example .env
code .env
```

Paste your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save the file!** (Ctrl+S)

---

## Step 4: Link Your Project

Back in your terminal (from MANTIS root):

```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS"
npx supabase link --project-ref YOUR_REFERENCE_ID
```

**Replace `YOUR_REFERENCE_ID`** with the Reference ID you copied earlier.

You'll be prompted to:
1. Enter your database password
2. Confirm the connection

---

## Step 5: Push Migrations to Database

This will create all your tables and apply RLS policies:

```bash
npx supabase db push
```

You should see:
```
✓ Connecting to Supabase
✓ Applying migration 20241119000001_init_core_tables.sql
✓ Applying migration 20241119000002_infringements.sql
✓ Applying migration 20241119000003_payments_finance.sql
✓ Applying migration 20241119000004_gps_tracking.sql
✓ Applying migration 20241119000005_notifications_storage.sql
✓ Applying migration 20241119000006_auth_sync_triggers.sql
✓ Migrations complete! (6 migrations applied)
```

---

## Step 6: Seed Initial Data (Optional)

Load sample agencies, locations, and infringement types:

```bash
npx supabase db seed
```

This adds:
- Fiji Police Force
- Land Transport Authority  
- Suva City Council
- Lautoka City Council
- And more...

---

## Step 7: Verify in Supabase Dashboard

Go back to your Supabase dashboard:

### Check Tables:
1. Click **"Table Editor"** in the left sidebar
2. You should see all tables:
   - agencies ✓
   - locations ✓
   - users ✓
   - teams ✓
   - routes ✓
   - infringement_categories ✓
   - infringement_types ✓
   - infringements ✓

### Check Seed Data:
1. Click on **"agencies"** table
2. You should see 6 agencies if you ran the seed command

---

## Step 8: Create Your Super Admin User

### Via Supabase Dashboard (Easiest):

1. Go to **Authentication → Users** (left sidebar)
2. Click **"Add user"** (top right)
3. Fill in:
   - **Email**: `admin@mantis.gov.fj` (or your email)
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✓ YES (check this box)
4. Click **"Create user"**
5. **Copy the user's UUID** (e.g., `123e4567-e89b-12d3-a456-426614174000`)

### Add to Users Table:

1. Go to **Table Editor → users**
2. Click **"Insert row"** (top right)
3. Fill in:
   - **id**: Paste the UUID you just copied
   - **role**: Select `super_admin` from dropdown
   - **agency_id**: Leave NULL
   - **position**: `Super Administrator` (optional)
   - **location_id**: Leave NULL
4. Click **"Save"**

**🎉 You now have a Super Admin account!**

---

## Step 9: Test the Web Application

### Start the development server:

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

### Test the Application:

1. Open your browser: **http://localhost:3000**
2. You should see the MANTIS landing page (no errors!)
3. Click **"Sign in"** or go to: **http://localhost:3000/auth/login**
4. Log in with your super admin email and password
5. After login, go to: **http://localhost:3000/admin**

**You should see the Admin Dashboard! 🎉**

### Test Creating an Agency:

1. Click **"Agencies"** in the navigation
2. Click **"Create Agency"** button
3. Enter a name (e.g., "Test Agency")
4. Click **"Create Agency"**
5. You should see it appear in the table!

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Environment variables configured (`.env.local` and `.env`)
- [ ] Project linked via `npx supabase link`
- [ ] Migrations pushed successfully
- [ ] Seed data loaded (optional)
- [ ] Tables visible in Supabase Table Editor
- [ ] Super admin user created (auth + users table)
- [ ] Web app runs without errors (`npm run dev`)
- [ ] Can log in with super admin account
- [ ] Can access admin dashboard at `/admin`
- [ ] Can create a new agency

---

## 🐛 Troubleshooting

### "Failed to link project"
- Make sure you're using the correct Reference ID
- Check your database password is correct
- Try: `npx supabase link --project-ref YOUR_REF --password YOUR_PASSWORD`

### "Migration failed"
- Check if tables already exist: go to Table Editor
- If tables exist, you can skip migration
- Or reset: Run SQL in SQL Editor: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` then push again

### "Cannot sign in"
- Make sure you checked "Auto Confirm User" when creating the auth user
- Check the user exists in Authentication → Users
- Make sure you added the user to the `users` table with `super_admin` role
- The `id` in `users` table must match the UUID from `auth.users`

### "Access denied" or "Insufficient permissions"
- Check RLS policies are applied: Go to Authentication → Policies
- Verify your user has `role = 'super_admin'` in the `users` table
- Make sure the `id` matches exactly

### Web app shows errors
- Check `.env.local` file exists in the `web/` directory
- Verify no extra spaces in environment variable values
- Restart the dev server after changing `.env.local`

---

## 🎯 What's Next?

Once everything is working:

1. **Explore the Admin Dashboard**
   - View system statistics
   - Create multiple agencies
   - Check the tables in Supabase

2. **Continue Building Features**
   - Add edit/delete agency functionality
   - Build user management page
   - Create agency admin assignment

3. **Follow the Checklist**
   - Open `CHECKLIST.md` for next tasks
   - Track your progress through Sprint 1

---

## 💡 Windows-Specific Tips

### Use npx for all Supabase commands:
```bash
npx supabase db push          # Instead of: supabase db push
npx supabase migration new    # Instead of: supabase migration new
npx supabase db reset         # Instead of: supabase db reset
```

### File Paths:
Always use quotes for paths with spaces:
```bash
cd "c:/Users/codec/OneDrive/Documents/MANTIS/web"
```

### Terminal:
- Use Git Bash (recommended) or PowerShell
- Avoid Command Prompt (cmd.exe)

---

## 📞 Quick Commands Reference

```bash
# Link project (one time)
npx supabase link --project-ref YOUR_REF

# Push migrations
npx supabase db push

# Seed database
npx supabase db seed

# Start web app
cd web && npm run dev

# Start mobile app
cd mobile && npm start

# Generate types
npx supabase gen types typescript --project-id YOUR_REF > web/lib/database.types.ts
```

---

**Ready to start? Open Supabase dashboard and create your project!** 🚀

👉 **https://supabase.com/dashboard**

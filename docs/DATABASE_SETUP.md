# 🗄️ Database Setup Guide

This guide will walk you through setting up your Supabase database for MANTIS.

---

## Prerequisites

- A Supabase account (https://supabase.com)
- Supabase CLI installed: `npm install -g supabase`

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `mantis-fiji` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to Fiji (Sydney or Singapore recommended)
4. Click **"Create new project"**
5. Wait ~2 minutes for initialization

---

## Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings → API**
2. Copy these three values:

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role secret: eyJhbGc...
   ```

3. Also note your **Project Ref** (from Settings → General)

---

## Step 3: Configure Environment Variables

### For Web App:

```bash
cd web
cp .env.local.example .env.local
```

Edit `web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### For Mobile App:

```bash
cd mobile
cp .env.example .env
```

Edit `mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Step 4: Link Your Project

From the root of the MANTIS directory:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual project reference.

---

## Step 5: Push Migrations

Apply all database migrations:

```bash
supabase db push
```

This will create all 17 tables across 6 migrations:

**Migration 001**: Core tables
- ✅ agencies, locations, users, teams, routes
- ✅ route_waypoints, team_members, team_routes

**Migration 002**: Infringement system
- ✅ infringement_categories, infringement_types
- ✅ infringements, evidence_photos

**Migration 003**: Finance
- ✅ payments, payment_reminders

**Migration 004**: GPS tracking
- ✅ gps_tracking (with PostGIS)

**Migration 005**: System features
- ✅ notifications, audit_logs

**Migration 006**: Auth sync
- ✅ Triggers and functions
- ✅ infringement_types
- ✅ infringements
- ✅ finance_reports (view)
- ✅ RLS policies

---

## Step 6: Seed Initial Data (Optional)

Load sample data for testing:

```bash
supabase db seed
```

This will add:
- Sample agencies (Police, LTA, Councils)
- Location hierarchies (divisions, regions, councils)
- Infringement categories and types with GL codes

---

## Step 7: Verify Setup

### Check Tables in Supabase Dashboard:

1. Go to **Table Editor** in your Supabase dashboard
2. You should see all the tables listed
3. Check a few tables to ensure they're created correctly

### Check RLS Policies:

1. Go to **Authentication → Policies**
2. Verify policies are created for each table

### Test Connection:

```bash
cd web
npm run dev
```

Visit http://localhost:3000 - you should see the MANTIS landing page without errors.

---

## Step 8: Create Your First Super Admin User

### Option A: Via Supabase Dashboard

1. Go to **Authentication → Users**
2. Click **"Add user"**
3. Enter email and password
4. Click **"Create user"**
5. Go to **Table Editor → users**
6. Click **"Insert row"**
7. Fill in:
   - `id`: Copy the auth user's UUID
   - `role`: `super_admin`
   - Leave other fields null
8. Click **"Save"**

### Option B: Via SQL Editor

1. Go to **SQL Editor**
2. Run this query (replace the email):

```sql
-- First, get the user ID from auth.users
-- Visit Authentication → Users and copy the UUID

INSERT INTO public.users (id, role)
VALUES ('PASTE_USER_UUID_HERE', 'super_admin');
```

---

## Troubleshooting

### Migration Failed

**Error**: `relation "agencies" already exists`

**Solution**: Reset the database and try again:
```bash
supabase db reset
```

### Cannot Connect to Supabase

**Check**:
- Is your `.env.local` file in the correct location?
- Are the credentials copied correctly (no extra spaces)?
- Is your Supabase project active?

### RLS Policies Blocking Access

**Check**:
- Did you create a user in the `users` table?
- Does the user have the correct `role` set?
- Is the `id` in the `users` table matching the `auth.users` UUID?

### Seed Data Failed

**Error**: Seed data not loading

**Solution**: 
1. Make sure migrations ran first: `supabase db push`
2. Try resetting: `supabase db reset`
3. This will rerun migrations and seeds automatically

---

## Next Steps

Once your database is set up:

1. ✅ **Test Login**: Go to http://localhost:3000/auth/login
2. ✅ **Access Admin**: Visit http://localhost:3000/admin
3. ✅ **Create Agency**: Test the "Create Agency" button
4. ✅ **Explore Tables**: Check Supabase Table Editor

---

## Quick Reference

### Useful Supabase CLI Commands

```bash
# Check connection
supabase db ping

# View current migrations
supabase migration list

# Create new migration
supabase migration new <name>

# Push all migrations
supabase db push

# Reset database (destructive!)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > web/lib/database.types.ts

# View logs
supabase logs
```

### Environment Variables Reference

**Web** (`.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

**Mobile** (`.env`):
- `EXPO_PUBLIC_SUPABASE_URL` - Your project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Public anon key

---

## Success Checklist

- [ ] Supabase project created
- [ ] Environment variables configured (web & mobile)
- [ ] Project linked via CLI
- [ ] Migrations pushed successfully
- [ ] Seed data loaded (optional)
- [ ] Tables visible in Supabase dashboard
- [ ] RLS policies enabled
- [ ] Super admin user created
- [ ] Web app runs without errors
- [ ] Can log in and access admin panel

---

**Need help?** Check `START_HERE.md` or review the Supabase documentation.

🎉 **Ready to build!** Your database is now set up and secured with RLS policies.

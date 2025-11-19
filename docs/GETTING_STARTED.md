# 🚀 Getting Started with MANTIS Development

## ✅ Setup Complete
- ✅ Dependencies installed (web & mobile)
- ✅ Environment templates created

## 📝 Next Steps

### 1. **Set Up Supabase Project**

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings → API**
3. Copy the following values:
   - `Project URL` 
   - `anon` `public` key
   - `service_role` `secret` key

### 2. **Configure Environment Variables**

#### For Web Dashboard:
```bash
cd web
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

#### For Mobile App:
```bash
cd mobile
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. **Initialize Database**

Install Supabase CLI if you haven't:
```bash
npm install -g supabase
```

Link your project:
```bash
supabase link --project-ref your-project-ref
```

Push migrations:
```bash
supabase db push
```

Run seed data (optional):
```bash
supabase db seed
```

### 4. **Start Development**

#### Web Dashboard:
```bash
cd web
npm run dev
```
Visit: http://localhost:3000

#### Mobile App:
```bash
cd mobile
npm start
```
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

---

## 📚 Project Structure

```
MANTIS/
├── web/              # Next.js admin dashboard
├── mobile/           # React Native officer app
├── supabase/         # Supabase configuration & migrations
├── docs/             # Documentation
└── supabase/         # Supabase config
```

---

## 🎯 Current Sprint

According to `sprint-tracker.md`, the project follows this roadmap:

- **Sprint 0**: Foundation & Setup ✅ (You are here!)
- **Sprint 1**: Agencies & Users
- **Sprint 2**: Teams, Routes & Assignments
- **Sprint 3**: Infringement Recording MVP
- **Sprint 4**: Reporting & Finance Alignment
- **Sprint 5**: Refinement & UX

---

## 🔑 Key Features to Build

1. **Super Admin**: Create/manage agencies and assign admins
2. **Agency Admin**: Manage users, teams, routes within agency
3. **Officer**: Record traffic infringements via mobile
4. **Finance Integration**: GL codes for accounting
5. **Location Hierarchy**: Police divisions, LTA regions, Council areas

---

## 📖 Useful Documentation

- `docs/system-design.md` - Architecture overview
- `docs/schema.md` - Database schema details
- `docs/api-spec.md` - API endpoints
- `docs/ui-spec.md` - Design system & UI guidelines

---

## 🆘 Troubleshooting

### Issue: Supabase connection fails
- Double-check your `.env.local` file has correct values
- Ensure no extra spaces or quotes around values
- Verify your Supabase project is active

### Issue: Database push fails
- Make sure you're linked to the correct project
- Check migration files for syntax errors
- Verify you have proper permissions

### Issue: Mobile app won't start
- Ensure Expo CLI is installed: `npm install -g expo-cli`
- Clear cache: `npx expo start --clear`
- Make sure your `.env` file exists in mobile directory

---

## 💡 What to Work On Next?

Once your environment is set up, here are good starting points:

1. **Set up Supabase RLS policies** (Row Level Security)
2. **Create authentication flows** in the web dashboard
3. **Build the Super Admin agency management UI**
4. **Test the database schema** with sample data
5. **Set up the mobile login screen**

Happy coding! 🎉

# Getting Started with MANTIS

This guide helps you run MANTIS locally for both the website and the mobile app.

## Prerequisites

- **Node.js** 18+ (includes npm)
- **Git**
- **Supabase account** (for backend services)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

### 1) Clone the Repository

```bash
git clone https://github.com/your-org/mantis.git
cd MANTIS
```

### 2) Pick the app to run

- **Website** – React + Vite PWA
- **Mobile** – Expo + React Native

---

## Website Setup

1) **Move into the web workspace**

```bash
cd website
```

2) **Install dependencies**

```bash
npm install
```

3) **Create the env file**

Create `website/.env` and add your Supabase publishable credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_or_publishable_key
```

> There is no `.env.example` for the website; create this file manually and never commit real keys.

4) **(Optional) Push database schema to Supabase**

```bash
npm run db-push
```

This uses Drizzle to push the schema defined in `src/lib/supabase/schema.ts`.

5) **Start the dev server**

```bash
npm run dev
```

Open http://localhost:5173.

---

## Mobile App Setup

1) **Move into the mobile workspace**

```bash
cd mobile
```

2) **Install dependencies**

```bash
npm install
```

3) **Configure environment**

```bash
cp .env.example .env.local
```

Update the values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-or-publishable-key
```

> Only use the Supabase **anon/publishable** key in the mobile app—never the service role key.

4) **Start Expo**

```bash
npm run start
```

Then:
- Press `i` for iOS Simulator (macOS only)
- Press `a` for Android Emulator
- Or scan the QR code with **Expo Go** on a device

See [../mobile/quickstart.md](../mobile/quickstart.md) for more mobile details.

---

## First-Time Setup

### Create Your First User

1. Visit http://localhost:5173/auth/register
2. Sign up with your email
3. Verify your email
4. Have a Super Admin assign your role

### Super Admin Bootstrap

1. Create a user through the registration flow
2. In Supabase Table Editor, open `users`
3. Set that user's `role` to `"Super Admin"`
4. Assign or create an agency for the user

---

## Verify Installation

- **Auth**: Log in and confirm a session is created
- **Database**: Confirm dashboard data loads
- **PWA**: Check Application → Manifest in DevTools
- **Offline**: Toggle offline in DevTools → Network and verify cached data

---

## Common Setup Issues

### Build errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues

- Verify Supabase URL and key values
- Confirm the Supabase project is active
- Ensure RLS policies are configured in Supabase

### Port already in use

```bash
npm run dev -- --port 3000
```

---

## Next Steps

- Architecture: [../architecture/system-architecture.md](../architecture/system-architecture.md)
- Data model: [../architecture/data-model.md](../architecture/data-model.md)
- Mobile workflows: [../mobile/app-overview.md](../mobile/app-overview.md)
- Troubleshooting: [./troubleshooting.md](./troubleshooting.md)

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run db-push` | Push schema changes to Supabase |
| `npm run deploy` | Install, build, deploy (web) |

---

Need help? See [./troubleshooting.md](./troubleshooting.md) or open an issue.

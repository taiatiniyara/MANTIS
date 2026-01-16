# Getting Started with MANTIS

This guide will help you get MANTIS up and running on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **Git**
- **Supabase account** (for backend services)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mantis.git
cd mantis
```

### 2. Choose Your App

MANTIS consists of two applications:

- **Website** - React + Vite PWA for desktop/browser-based operations
- **Mobile** - Expo + React Native for field officers on iOS/Android

## Website Setup

### 1. Navigate to Website Directory

```bash
cd website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `website` directory:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**⚠️ Important:** Never commit the `.env` file to version control. The `.env.example` file should contain placeholder values only.

### 4. Database Setup

If you're setting up a new Supabase project, run the database migrations:

```bash
npm run db-push
```

This will:
- Create all necessary tables
- Set up Row Level Security (RLS) policies
- Configure PostGIS extensions
- Initialize the location hierarchy

### 5. Start Development Server

```bash
npm run dev
```

The website will be available at `http://localhost:5173`

## Mobile App Setup

### 1. Navigate to Mobile Directory

```bash
cd mobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the `mobile` directory:

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

**⚠️ Important:** These are public keys (safe to expose). Never add service role keys to the mobile app.

### 4. Install Expo CLI

```bash
npm install -g expo-cli
```

### 5. Start Development Server

```bash
npm start
```

Then choose your target:
- Press `i` for iOS Simulator (Mac only)
- Press `a` for Android Emulator
- Scan the QR code with **Expo Go** app on your physical device

For detailed mobile setup, see [10-mobile-app.md](./10-mobile-app.md).

## First-Time Setup

### Create Your First User

1. Navigate to `http://localhost:5173/auth/register`
2. Create an account with your email
3. Check your email for verification link
4. After verification, you'll need a Super Admin to assign your role

### Super Admin Bootstrap

For the first Super Admin user:

1. Create a user account through the registration flow
2. In your Supabase dashboard, navigate to the `users` table
3. Update the newly created user's `role` field to `"Super Admin"`
4. Assign an agency (you may need to create one first in the `agencies` table)

## Verify Installation

To verify everything is working correctly:

1. **Authentication**: Try logging in with your credentials
2. **Database Connection**: Check if data loads on the dashboard
3. **PWA Features**: Open DevTools → Application → Manifest
4. **Offline Mode**: Toggle offline mode in DevTools → Network

## Common Setup Issues

### Build Errors

If you encounter build errors:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure RLS policies are properly configured

### Port Already in Use

If port 5173 is already in use:

```bash
# Use a different port
npm run dev -- --port 3000
```

## Next Steps

- Read the [Architecture Overview](./02-architecture.md)
- Explore the [Data Model](./04-data-model.md)
- Learn about [Officer Workflows](./08-officer-workflows.md)
- Set up [Development Environment](./18-development-setup.md)

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run db-push` | Push schema changes to database |
| `npm run deploy` | Full deployment (install, build, deploy) |

---

**Need Help?** Check the [Troubleshooting Guide](./27-troubleshooting.md) or open an issue on GitHub.

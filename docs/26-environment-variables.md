# Environment Variables

Complete reference for all environment variables used in MANTIS.

## Required Variables

### Supabase Configuration

```env
# Supabase project URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase anonymous key (public, safe for client-side)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get these values:**

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on "Settings" → "API"
4. Copy "Project URL" and "anon public" key

## Optional Variables

### Firebase Analytics

```env
# Firebase Analytics ID (optional)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_PROJECT_ID=your-firebase-project
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Error Tracking (Sentry)

```env
# Sentry DSN for error tracking (optional)
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
```

### Feature Flags

```env
# Enable beta features (optional)
VITE_ENABLE_BETA_FEATURES=false

# Enable debug mode (optional, dev only)
VITE_DEBUG_MODE=false
```

## Environment Files

### Development (`.env`)

```env
# Local development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
VITE_DEBUG_MODE=true
```

### Staging (`.env.staging`)

```env
# Staging environment
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_anon_key
VITE_SENTRY_ENVIRONMENT=staging
```

### Production (`.env.production`)

```env
# Production environment
VITE_SUPABASE_URL=https://production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_BETA_FEATURES=false
```

## Security Best Practices

### ✅ DO

- Use `.env.example` with placeholder values
- Add `.env*` to `.gitignore`
- Use different keys for each environment
- Rotate keys regularly
- Store secrets in CI/CD environment variables

### ❌ DON'T

- Commit `.env` files to Git
- Share production keys in Slack/email
- Use production keys in development
- Hardcode secrets in source code
- Expose service role keys to frontend

## Accessing Variables

### In React Components

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Type Safety

Add to `vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_DEBUG_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## CI/CD Configuration

### GitHub Actions

In repository settings → Secrets, add:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `FIREBASE_SERVICE_ACCOUNT`

Use in workflow:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Validation

Create a validation script:

```typescript
// scripts/validate-env.ts
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

requiredVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

console.log('✅ All required environment variables are set');
```

## Troubleshooting

### Variables Not Loading

1. Restart dev server after changing `.env`
2. Ensure variable names start with `VITE_`
3. Check for typos in variable names
4. Verify `.env` file is in correct directory

### Undefined Variables

```typescript
// Add fallback for optional variables
const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true' || false;
```

### Build Issues

```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

---

**Next:** [Troubleshooting Guide](./27-troubleshooting.md)

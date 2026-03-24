# Environment Variables

The project uses a **Supabase-only** configuration for both the website and the mobile app. Keep service role keys out of the clients—use only the publishable/anon key.

## Required Variables

### Website (Vite)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_or_publishable_key
```

These are read in `src/lib/supabase/client.ts`.

### Mobile (Expo)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_anon_or_publishable_key
```

These are read in `mobile/utils/supabase.ts`.

## Environment Files

- **website/.env** – create manually; keep out of Git
- **mobile/.env.local** – copy from `mobile/.env.example`

Example `website/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_or_publishable_key
```

Example `mobile/.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_anon_or_publishable_key
```

## Security Best Practices

- Add `.env*` to `.gitignore`
- Use different keys per environment
- Rotate keys regularly
- Do not share production keys in chat/email
- Never expose the **service role** key to web or mobile apps

## Accessing Variables

### Website (Vite)

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
```

Add to `vite-env.d.ts` if needed:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Mobile (Expo)

Expo exposes env variables on `process.env` when prefixed with `EXPO_PUBLIC_`:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;
```

## CI/CD Configuration

Add these secrets to your CI system:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_DEFAULT_KEY`

Example GitHub Actions snippet:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${{ secrets.SUPABASE_PUBLISHABLE_DEFAULT_KEY }}
```

## Validation

```typescript
// scripts/validate-env.ts
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY'
];

requiredVars.forEach((varName) => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

console.log('✅ All required environment variables are set');
```

## Troubleshooting

### Variables not loading

1. Restart the dev server after editing `.env`
2. Confirm Vite vars start with `VITE_` and Expo vars with `EXPO_PUBLIC_`
3. Ensure the env files live in the right app folder (website vs mobile)
4. Check for typos or stray quotes

### Build issues

```bash
rm -rf node_modules dist .vite
npm install
npm run build
```

---

Next: [Troubleshooting Guide](./troubleshooting.md)

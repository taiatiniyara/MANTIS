# Deployment Guide

This guide covers deploying MANTIS to production using Firebase Hosting and Supabase.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Supabase project created
- Git repository
- Domain name (optional)

## Environment Setup

### 1. Production Environment Variables

Create a `.env.production` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id
```

**⚠️ Important:**
- Never commit `.env.production` to Git
- Use environment-specific keys
- Rotate keys regularly

### 2. Firebase Configuration

Initialize Firebase in your project:

```bash
firebase login
firebase init hosting
```

Select options:
- **Public directory:** `dist`
- **Single-page app:** Yes
- **Automatic builds:** No (we'll build manually)

This creates `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Database Migration

### 1. Push Schema to Production

```bash
# Set production Supabase credentials
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_KEY=your_service_role_key

# Push schema
npm run db-push
```

### 2. Verify Schema

In Supabase Dashboard:
1. Navigate to Table Editor
2. Verify all tables exist
3. Check RLS policies are active

### 3. Create Initial Data

```sql
-- Create system agency for Super Admins
INSERT INTO agencies (name, code, type) VALUES
('System', 'SYSTEM', 'National');

-- Create Fiji as root location
INSERT INTO locations (type, name, parent_id, geom) VALUES
('country', 'Fiji', NULL, NULL);
```

## Build & Deploy

### Automated Deployment

Use the provided deploy script:

```bash
npm run deploy
```

This script:
1. Installs dependencies
2. Pushes database schema
3. Builds production bundle
4. Deploys to Firebase
5. Commits changes to Git

### Manual Deployment

```bash
# 1. Install dependencies
npm install

# 2. Push database schema (if needed)
npm run db-push

# 3. Build for production
npm run build

# 4. Preview build locally
npm run preview

# 5. Deploy to Firebase
firebase deploy --only hosting

# 6. Commit and push
git add .
git commit -m "Deploy production build"
git push
```

## Post-Deployment

### 1. Verify Deployment

Check that the app is live:

```bash
firebase hosting:channel:list
```

Visit your production URL and verify:
- ✅ App loads correctly
- ✅ Authentication works
- ✅ Database connections work
- ✅ Map displays properly
- ✅ PWA can be installed
- ✅ Offline mode works

### 2. Configure Custom Domain

In Firebase Console:
1. Go to Hosting
2. Click "Add custom domain"
3. Follow DNS verification steps
4. Add CNAME record: `mantis.gov.fj` → `your-project.web.app`

### 3. Enable HTTPS

Firebase automatically provisions SSL certificates for custom domains.

### 4. Set Up CDN

Firebase Hosting includes CDN by default. No additional configuration needed.

## Continuous Integration/Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-firebase-project-id
```

### Environment Secrets

In GitHub repository settings, add secrets:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `FIREBASE_SERVICE_ACCOUNT`

## Performance Optimization

### 1. Code Splitting

Vite automatically splits code. Verify:

```bash
npm run build
# Check dist/ for chunked files
```

### 2. Asset Optimization

Images are automatically optimized. For additional optimization:

```bash
# Install sharp for image processing
npm install -D vite-plugin-imagemin
```

### 3. Compression

Enable gzip/brotli in `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Encoding",
            "value": "gzip"
          }
        ]
      }
    ]
  }
}
```

### 4. Caching Strategy

Firebase Hosting caches assets automatically:
- Static assets: 1 year
- HTML: No cache (always fresh)
- Service Worker: 24 hours

## Monitoring

### 1. Firebase Analytics

In `src/main.tsx`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: 'your-project-id',
  // ...
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

### 2. Error Tracking

Add Sentry (optional):

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

### 3. Performance Monitoring

Monitor with Firebase Performance:

```bash
npm install firebase
```

```typescript
import { initializePerformance } from 'firebase/performance';

const perf = initializePerformance(app);
```

## Rollback

### Quick Rollback

Firebase keeps deployment history:

```bash
# List deployments
firebase hosting:releases:list

# Rollback to previous
firebase hosting:rollback
```

### Git Revert

```bash
# Revert last commit
git revert HEAD
git push

# Redeploy
npm run deploy
```

## Backup & Disaster Recovery

### 1. Database Backups

Supabase automatically backs up daily. Manual backup:

```bash
# Export schema
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  --schema-only \
  > schema.sql

# Export data
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  --data-only \
  > data.sql
```

### 2. Storage Backups

Backup evidence files:

```bash
# Download all files from Supabase Storage
# Use Supabase CLI or dashboard
```

### 3. Recovery Plan

1. Restore database from backup
2. Redeploy app from Git
3. Restore storage files
4. Verify data integrity

## Security Checklist

- [ ] HTTPS enabled
- [ ] RLS policies active
- [ ] Service role keys secured
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] Rate limiting enabled
- [ ] Audit logging active
- [ ] Regular security scans

## Scaling

### Horizontal Scaling

Firebase and Supabase scale automatically. Monitor:

- **Concurrent users**
- **Database connections**
- **Storage usage**
- **Bandwidth**

### Database Optimization

For high traffic:

```sql
-- Add indexes
CREATE INDEX idx_infringements_created 
ON infringements(created_at DESC);

-- Enable connection pooling
-- (Supabase does this automatically)
```

### CDN Configuration

Firebase Hosting CDN is pre-configured. For custom CDN:

1. Use Cloudflare or CloudFront
2. Point to Firebase Hosting
3. Configure caching rules

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Fails

```bash
# Check Firebase CLI
firebase --version

# Re-authenticate
firebase login --reauth
```

### Database Connection Issues

- Verify Supabase project is active
- Check connection string
- Verify RLS policies don't block queries

### CORS Errors

In Supabase Dashboard:
1. Go to Storage
2. Set CORS policy for your domain

## Production Checklist

Before going live:

- [ ] Environment variables set
- [ ] Database schema deployed
- [ ] RLS policies active
- [ ] Initial data seeded
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained
- [ ] Support plan ready

---

**Congratulations!** MANTIS is now deployed to production. Monitor performance and user feedback for continuous improvement.

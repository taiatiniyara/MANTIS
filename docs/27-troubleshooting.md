# Troubleshooting Guide

Common issues and their solutions when working with MANTIS.

## Installation Issues

### `npm install` Fails

**Problem:** Package installation errors

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Node Version Mismatch

**Problem:** "Unsupported Node.js version"

**Solution:**
```bash
# Check current version
node --version

# Install Node.js 18+ from nodejs.org
# Or use nvm
nvm install 18
nvm use 18
```

## Development Server Issues

### Port Already in Use

**Problem:** `Port 5173 is already in use`

**Solutions:**
```bash
# Use different port
npm run dev -- --port 3000

# Or kill process using port 5173
# On Linux/Mac:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Hot Reload Not Working

**Problem:** Changes don't reflect in browser

**Solutions:**
- Hard refresh browser (Ctrl+Shift+R)
- Restart dev server
- Clear browser cache
- Check if file is in `public/` folder (not hot-reloaded)

### Build Errors

**Problem:** TypeScript or build errors

**Solutions:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

## Authentication Issues

### "Invalid JWT token"

**Problem:** Authentication fails

**Solutions:**
- Check Supabase URL and anon key in `.env`
- Verify Supabase project is active
- Clear browser cookies/localStorage
- Sign out and sign in again

### "Email not confirmed"

**Problem:** Cannot log in after registration

**Solutions:**
- Check email for confirmation link
- Look in spam folder
- In Supabase dashboard, manually confirm user:
  1. Go to Authentication → Users
  2. Find user
  3. Click "..." → "Confirm email"

### Session Expired

**Problem:** Logged out unexpectedly

**Solutions:**
```typescript
// Implement automatic token refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});
```

## Database Issues

### "Row Level Security policy violation"

**Problem:** Database queries return empty or fail

**Solutions:**
- Verify user has correct role
- Check RLS policies in Supabase dashboard
- Ensure user is assigned to agency/team
- Test query as service role (temporarily):
  ```typescript
  // Debug only - never in production frontend
  const { data } = await supabaseAdmin.from('infringements').select('*');
  ```

### Schema Not Updated

**Problem:** Database schema doesn't match code

**Solutions:**
```bash
# Push schema changes
npm run db-push

# Or manually in Supabase SQL editor
# Copy schema from src/lib/supabase/schema.ts
```

### Migration Fails

**Problem:** Drizzle migration errors

**Solutions:**
- Check for syntax errors in schema
- Ensure Supabase connection details are correct
- Try resetting database (⚠️ destructive):
  ```sql
  -- In Supabase SQL editor
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  ```

## GIS/Location Issues

### GPS Not Available

**Problem:** `navigator.geolocation` is undefined

**Solutions:**
- Ensure HTTPS (required for geolocation)
- Check browser permissions
- Test on mobile device (better GPS)
- Use manual location picker as fallback

### Inaccurate GPS Coordinates

**Problem:** GPS coordinates are off

**Solutions:**
```typescript
// Use high accuracy mode
navigator.geolocation.getCurrentPosition(
  success,
  error,
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
);
```

### Location Not Found

**Problem:** Point-in-polygon query returns null

**Solutions:**
- Verify boundaries are properly defined
- Check coordinate order (longitude, latitude)
- Ensure PostGIS extension is enabled:
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  ```

## PWA Issues

### App Not Installing

**Problem:** "Install" prompt doesn't appear

**Solutions:**
- Verify `manifest.json` is valid
- Check service worker is registered
- Use HTTPS (required for PWA)
- Test in Chrome DevTools → Application → Manifest

### Offline Mode Not Working

**Problem:** App doesn't work offline

**Solutions:**
- Check service worker status in DevTools
- Verify caching strategy
- Ensure Service Worker is registered:
  ```typescript
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
  ```

### Cache Not Updating

**Problem:** Old content shows after update

**Solutions:**
```typescript
// Force cache refresh
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.update());
  });
}
```

## Performance Issues

### Slow Page Load

**Problem:** App takes long to load

**Solutions:**
- Check bundle size: `npm run build`
- Implement code splitting
- Optimize images (use WebP)
- Enable gzip compression
- Use CDN for assets

### Memory Leaks

**Problem:** App slows down over time

**Solutions:**
- Check for unmounted component subscriptions
- Clean up TanStack Query subscriptions
- Use React DevTools Profiler
- Implement proper cleanup in `useEffect`:
  ```typescript
  useEffect(() => {
    const subscription = supabase
      .channel('changes')
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, []);
  ```

### Slow Database Queries

**Problem:** Queries take too long

**Solutions:**
```sql
-- Add indexes
CREATE INDEX idx_infringements_agency 
ON infringements(agency_id);

-- Use EXPLAIN to analyze
EXPLAIN ANALYZE
SELECT * FROM infringements WHERE agency_id = 'xxx';
```

## Map Issues

### Map Not Rendering

**Problem:** Blank map or tiles not loading

**Solutions:**
- Check MapLibre GL CSS is imported
- Verify map style URL is valid
- Check browser console for errors
- Ensure container has height:
  ```css
  .map-container {
    height: 400px;
  }
  ```

### Markers Not Showing

**Problem:** GeoJSON markers don't appear

**Solutions:**
- Verify GeoJSON format is valid
- Check coordinate order (lng, lat)
- Ensure layer is added after source
- Use https://geojson.io to validate

## Build/Deploy Issues

### Build Fails

**Problem:** `npm run build` errors

**Solutions:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Clear cache
rm -rf node_modules/.vite dist

# Rebuild
npm run build
```

### Firebase Deploy Fails

**Problem:** `firebase deploy` errors

**Solutions:**
```bash
# Re-authenticate
firebase login --reauth

# Check project ID
firebase projects:list

# Select correct project
firebase use your-project-id
```

### Environment Variables Not Working in Production

**Problem:** App can't connect to Supabase in production

**Solutions:**
- Verify `.env.production` exists
- Check variable names start with `VITE_`
- In CI/CD, ensure secrets are set
- Rebuild after changing env vars

## Common Errors

### "Cannot read property 'id' of undefined"

**Cause:** Accessing user before it's loaded

**Solution:**
```typescript
const { user, loading } = useAuth();

if (loading) return <Loading />;
if (!user) return <Login />;

// Now safe to use user.id
```

### "Failed to fetch"

**Cause:** Network error or CORS issue

**Solutions:**
- Check internet connection
- Verify Supabase URL is correct
- Check CORS settings in Supabase
- Test with curl:
  ```bash
  curl https://your-project.supabase.co/rest/v1/
  ```

### "Quota exceeded"

**Cause:** Supabase free tier limits

**Solutions:**
- Upgrade Supabase plan
- Optimize queries
- Implement pagination
- Clear old data

## Getting Help

### Check Logs

**Browser Console:**
```javascript
// Enable verbose logging
localStorage.setItem('debug', '*');
```

**Supabase Logs:**
- Go to Supabase Dashboard → Logs
- Check API, Database, and Auth logs

### Debug Mode

Enable debug mode in `.env`:
```env
VITE_DEBUG_MODE=true
```

### Report Issues

When reporting issues, include:
- Error message
- Browser/device
- Steps to reproduce
- Screenshots
- Console logs

### Community Support

- GitHub Issues: Report bugs
- Supabase Discord: Supabase-specific issues
- Stack Overflow: General questions

## Quick Fixes

### Reset Everything

```bash
# Nuclear option - start fresh
rm -rf node_modules dist .vite package-lock.json
npm install
npm run dev
```

### Clear Browser Data

1. Open DevTools
2. Application → Storage
3. Clear site data
4. Hard refresh (Ctrl+Shift+R)

### Test in Incognito

- Rules out extension conflicts
- Clean slate (no cache/cookies)
- Useful for auth issues

---

**Still stuck?** Open an issue on GitHub with detailed information about your problem.

# SearchParams Fix for Next.js 15

## Problem
With Next.js 15, `searchParams` must be awaited before accessing its properties. This is a breaking change that requires updating all page components that use search parameters.

## Error Messages
```
Error: Route "/admin/users" used `searchParams.search`. `searchParams` should be awaited before using its properties.
```

## Solution Applied

### Changes Made to All Admin Pages

1. **Updated Type Definition**
   - Changed from: `searchParams: { search?: string; ... }`
   - Changed to: `searchParams: Promise<{ search?: string; ... }>`

2. **Added Await Statement**
   - Added after authentication checks: `const params = await searchParams;`

3. **Updated All References**
   - Changed all `searchParams.property` to `params.property`

### Files Fixed
- ✅ `web/app/admin/users/page.tsx`
- ✅ `web/app/admin/locations/page.tsx`
- ✅ `web/app/admin/routes/page.tsx`
- ✅ `web/app/admin/categories/page.tsx`
- ✅ `web/app/admin/types/page.tsx`
- ✅ `web/app/admin/infringements/page.tsx`
- ✅ `web/app/admin/reports/page.tsx`

## Example of the Fix

### Before:
```typescript
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string };
}) {
  // ... auth checks ...
  
  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`);
  }
}
```

### After:
```typescript
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  // ... auth checks ...
  
  // Await searchParams
  const params = await searchParams;
  
  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }
}
```

## Additional Issues Found

### Permission Denied Errors
The logs also show RLS (Row Level Security) policy issues:
```
Error fetching users: {
  code: '42501',
  message: 'permission denied for table agencies'
}
```

These are separate database permission issues that need to be addressed in the RLS policies.

## Testing
1. Start the dev server: `npm run dev`
2. Navigate to each admin page
3. Verify no more `searchParams` errors appear
4. Test search and filter functionality

## Next Steps
1. ✅ Fix searchParams async issues (COMPLETED)
2. ⚠️ Fix RLS policy permissions for:
   - `agencies` table
   - `locations` table
   - `routes` table
   - `infringement_categories` table
   - `infringement_types` table
   - `infringements` table

## References
- [Next.js 15 Migration Guide](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Dynamic APIs Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams)

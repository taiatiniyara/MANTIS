# Quick Fix Instructions

## 🚀 QUICK START - 3 Steps to Fix Authentication

### Step 1: Fix Database (5 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Copy & run: `db/migrations/009_auto_create_users.sql`
3. Copy & run: `db/migrations/010_sync_existing_users.sql`

### Step 2: Fix Code (10 minutes)

Fix 17 remaining files in `web/app/admin/` and `web/app/protected/`:

**Find and Remove**:
```typescript
import { supabase } from "@/lib/supabase/client";
```

**Add at top of function**:
```typescript
const supabase = await createClient();
```

Files to fix:
- All files in `web/app/admin/*/page.tsx` (except layout and main page - already fixed)
- `web/app/protected/infringements/page.tsx`

### Step 3: Test (5 minutes)

1. Try logging in
2. Verify you reach dashboard
3. Check console for errors

---

## ✅ Already Fixed

- ✅ Protected layout & page
- ✅ Admin layout & main page  
- ✅ Database migration files created

## 📄 Full Documentation

- Detailed guide: `docs/AUTH_FIX_GUIDE.md`
- Complete summary: `docs/AUTH_FIX_SUMMARY.md`

---

**Estimated Total Time**: 20 minutes

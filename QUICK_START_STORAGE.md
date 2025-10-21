# 🎯 Quick Action Guide - Storage Setup

## What You Need to Do (2 minutes)

### Step 1: Open Supabase Dashboard
Go to: https://app.supabase.com/project/YOUR_PROJECT/sql

### Step 2: Run SQL Script
1. Open: `db/QUICK_FIX_STORAGE.sql`
2. Copy entire file
3. Paste into SQL Editor
4. Click **"Run"**

### Step 3: Verify
```sql
-- Should show 6 buckets
SELECT id, name FROM storage.buckets;
```

✅ **Done!** Both mobile and web apps will now work.

---

## What Gets Fixed

### Mobile App ✅
- ❌ **Before:** `StorageApiError: Bucket not found`
- ✅ **After:** Photos upload successfully

### Web Dashboard ✅
- ✅ Document PDFs can be stored
- ✅ Payment receipts can be generated
- ✅ Reports can be exported
- ✅ Digital signatures work
- ✅ User avatars can be uploaded

---

## Buckets Created

| Bucket | Platform | Purpose | Size | Public |
|--------|----------|---------|------|--------|
| `evidence-photos` | Mobile | Infringement photos | 10MB | ✅ Yes |
| `documents` | Web | Generated PDFs | 50MB | ❌ No |
| `signatures` | Web | Digital signatures | 2MB | ❌ No |
| `receipts` | Web | Payment receipts | 10MB | ❌ No |
| `reports` | Web | Exported reports | 100MB | ❌ No |
| `profile-photos` | Both | User avatars | 5MB | ✅ Yes |

---

## Files to Reference

| File | Purpose |
|------|---------|
| `db/QUICK_FIX_STORAGE.sql` | ⭐ **Run this SQL** |
| `STORAGE_COMPLETE.md` | Full documentation |
| `FIX_STORAGE_NOW.md` | Troubleshooting guide |
| `web/lib/supabase/storage.ts` | Web storage utilities |
| `mobile/lib/supabase.ts` | Mobile storage utilities |

---

## After Running SQL

### Test Mobile App
```bash
# Already running
npx expo start --clear
```

1. Navigate to Infringement tab
2. Click "Capture Evidence Photos"
3. Take photo
4. ✅ Should upload without errors

### Test Web Dashboard
1. Go to Document Management
2. Generate a document
3. ✅ Should create PDF in storage

---

## Need Help?

### Common Issues

**SQL returns error:**
- Check you're connected to correct project
- Verify you have admin permissions

**Mobile still showing error:**
- Clear app cache: Close and reopen app
- Restart Expo: `npx expo start --clear`

**Web can't access storage:**
- Clear browser cache
- Check authentication is working
- Verify user has correct role

---

## Quick Links

- 📖 **Full Docs:** `STORAGE_COMPLETE.md`
- 🔧 **Troubleshooting:** `FIX_STORAGE_NOW.md`
- 📱 **Mobile Setup:** `mobile/STORAGE_SETUP.md`
- 🗄️ **SQL Script:** `db/QUICK_FIX_STORAGE.sql`

---

## Status Check

- [ ] SQL script run in Supabase
- [ ] Buckets visible in Storage dashboard
- [ ] Mobile app photo upload works
- [ ] Web document generation works

**Once all checked ✅ you're done!** 🎉

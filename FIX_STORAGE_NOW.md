# 🚨 Complete Storage Setup Guide - Mobile + Web

## Problem Summary

You're seeing storage errors because Supabase buckets don't exist yet:
1. ✅ **FIXED:** Metro bundler cache error (InternalBytecode.js) - Cleared with `--clear` flag
2. ⚠️ **NEEDS FIX:** Storage buckets for mobile app + web dashboard

## Current Status

- ✅ Metro bundler restarted successfully with clean cache
- ✅ App is reloading without bundler errors
- ⚠️ **6 storage buckets** need to be created in Supabase

---

## Storage Buckets Required

### Mobile App
1. **`evidence-photos`** - Infringement evidence photos with GPS watermarks (10MB, public)

### Web Dashboard
2. **`documents`** - Generated PDFs (notices, letters, reports) (50MB, private)
3. **`signatures`** - Digital signatures for documents (2MB, private)
4. **`receipts`** - Payment receipts (10MB, private)
5. **`reports`** - Exported reports (CSV, Excel, PDF) (100MB, private)
6. **`profile-photos`** - User avatars (5MB, public)

---

## Fix All Storage Errors (2 minutes)

### Quick Method (Recommended)

1. **Open Supabase Dashboard** for your project
2. **Go to:** SQL Editor
3. **Copy ALL contents** from: `db/QUICK_FIX_STORAGE.sql`
4. **Paste and click "Run"**
5. **Done!** ✅ All 6 buckets created with proper security

### Alternative: Manual Setup (Not Recommended)

You'd need to create 6 buckets manually with 25+ security policies. 
**Just use the SQL script!** 🚀

---

## What Gets Created

### Buckets
- ✅ **evidence-photos** (10MB, public) - Mobile infringement photos
- ✅ **documents** (50MB, private) - Web generated PDFs
- ✅ **signatures** (2MB, private) - Web digital signatures
- ✅ **receipts** (10MB, private) - Web payment receipts
- ✅ **reports** (100MB, private) - Web exported reports
- ✅ **profile-photos** (5MB, public) - User avatars

### Security Policies (25+ policies)
- ✅ Authenticated uploads for all buckets
- ✅ Role-based access control
- ✅ Owner-only management (update/delete)
- ✅ Public read for evidence photos & profile photos
- ✅ Private access for sensitive documents

---

## Test It Works

### Mobile App
1. Go to infringement recording
2. Tap "Capture Evidence Photos"
3. Take a photo
4. ✅ Photo uploads successfully

### Web Dashboard
1. Go to Document Management
2. Generate a document
3. ✅ PDF stores in documents bucket
4. Download payment receipt
5. ✅ Receipt stores in receipts bucket

---

## What's Happening Now?

Your app is trying to:
- ✅ Auto-sync pending items
- ✅ Sync 1 photo that was taken
- ❌ Upload fails because buckets don't exist

**After you create the buckets, all syncs will work automatically!**

---

## Files Created

1. **`db/migrations/015_storage_buckets.sql`** - Full migration with metadata table
2. **`db/QUICK_FIX_STORAGE.sql`** - ⭐ **Quick setup for ALL buckets (use this!)**
3. **`mobile/STORAGE_SETUP.md`** - Detailed mobile documentation
4. **`FIX_STORAGE_NOW.md`** - This guide

---

## Storage Structure

```
Supabase Storage
├── evidence-photos/          # Mobile infringement photos
│   ├── {userId}/
│   │   └── {infringementId}_{timestamp}_{index}.jpg
│
├── documents/                # Web generated PDFs
│   ├── {userId}/
│   │   ├── notices/
│   │   ├── letters/
│   │   └── reports/
│
├── signatures/               # Web digital signatures
│   └── {userId}/
│       └── {documentId}_signature.png
│
├── receipts/                 # Web payment receipts
│   └── {userId}/
│       └── receipt_{paymentId}.pdf
│
├── reports/                  # Web exported reports
│   └── {userId}/
│       ├── infringements_export.csv
│       └── monthly_report.pdf
│
└── profile-photos/           # User avatars
    └── {userId}/
        └── avatar.jpg
```

---

## Need Help?

The errors will keep appearing until you create the storage buckets in Supabase.

**Just run the SQL in `db/QUICK_FIX_STORAGE.sql` and you're done!** 🚀

### Troubleshooting

**Error persists after running SQL?**
- Clear browser cache
- Restart Expo dev server: `npx expo start --clear`
- Check Supabase Dashboard → Storage → Verify buckets exist

**Policy errors?**
- Ensure you're logged in as authenticated user
- Check user role in database
- Verify RLS is enabled on storage.objects

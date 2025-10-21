# Storage Bucket Setup & Error Resolution

## Issues Fixed

### 1. Metro Bundler Cache Error
**Error:** `ENOENT: no such file or directory, open 'InternalBytecode.js'`

**Solution:** Metro bundler cache corruption. Cleared with:
```bash
cd mobile
npx expo start --clear
```

### 2. Supabase Storage Bucket Missing
**Error:** `StorageApiError: Bucket not found`

**Cause:** The `evidence-photos` bucket doesn't exist in Supabase Storage.

**Solution:** Created migration `015_storage_buckets.sql` to set up the bucket.

---

## Apply the Storage Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to:** SQL Editor
3. **Copy the contents of:** `db/migrations/015_storage_buckets.sql`
4. **Paste and Run** the SQL

### Option 2: Supabase CLI

```bash
# From the MANTIS root directory
supabase db push

# Or apply specific migration
psql $DATABASE_URL -f db/migrations/015_storage_buckets.sql
```

### Option 3: Manual Setup (Quick Fix)

If you just need the bucket working quickly:

1. **Go to Supabase Dashboard → Storage**
2. **Click "New Bucket"**
3. **Settings:**
   - Name: `evidence-photos`
   - Public bucket: ✅ Yes
   - File size limit: `10 MB`
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`

4. **Create the bucket**

5. **Set Policies (click on bucket → Policies tab):**
   - ✅ Allow authenticated users to INSERT
   - ✅ Allow authenticated users to SELECT
   - ✅ Allow public to SELECT (for viewing infringements)
   - ✅ Allow users to UPDATE/DELETE their own files

---

## What the Migration Creates

### 1. Storage Bucket: `evidence-photos`
- Public access for viewing
- 10MB file size limit
- Supports: JPEG, PNG, WebP images

### 2. Security Policies
- ✅ Officers can upload photos (authenticated)
- ✅ Officers can view all photos (authenticated)
- ✅ Officers can manage their own photos (update/delete)
- ✅ Public can view photos (for transparency)

### 3. Database Table: `infringement_photos`
Tracks photo metadata:
```sql
- id: uuid (primary key)
- infringement_id: links to infringement
- storage_path: file path in storage
- file_name: original file name
- file_size: size in bytes
- mime_type: image type
- watermark_data: JSON (officer, GPS, timestamp)
- uploaded_by: officer who uploaded
- uploaded_at: upload timestamp
```

### 4. Row-Level Security (RLS)
- Officers can view all infringement photos
- Officers can only upload/modify their own photos
- Public can view photos for active infringements

---

## Verify Setup

### 1. Check Bucket Exists
```bash
# In Supabase Dashboard
Storage → Buckets → evidence-photos should be visible
```

### 2. Test Photo Upload
```typescript
// In your app, try taking a photo
// Should now upload successfully without "Bucket not found" error
```

### 3. Check Database Table
```sql
-- In SQL Editor
SELECT * FROM infringement_photos LIMIT 5;
```

---

## Photo Upload Flow

### Current Implementation

1. **Officer captures photo** in camera screen
2. **Photo is watermarked** with:
   - Officer name
   - GPS coordinates
   - Timestamp
3. **Photo saved locally** on device
4. **If online:** Upload to `evidence-photos` bucket
5. **If offline:** Queue for later sync
6. **Metadata saved** to `infringement_photos` table

### File Naming Convention
```
{infringementId}_{timestamp}_{index}.jpg

Example: abc123_1729425600000_0.jpg
```

### Storage Path Structure
```
evidence-photos/
  ├── abc123_1729425600000_0.jpg
  ├── abc123_1729425600000_1.jpg
  └── def456_1729425700000_0.jpg
```

---

## Troubleshooting

### Error: "Bucket not found" persists
1. Verify bucket exists in Supabase Dashboard
2. Check bucket name is exactly `evidence-photos`
3. Clear app cache and restart Expo

### Error: "Permission denied"
1. Check storage policies are applied
2. Verify user is authenticated
3. Check RLS is enabled on bucket

### Photos not appearing
1. Check `infringement_photos` table has records
2. Verify storage path matches actual file location
3. Test public URL manually in browser

### Offline photos not syncing
1. Check `offline_photos` in AsyncStorage
2. Verify network connectivity
3. Check console for sync errors

---

## Next Steps

After applying the migration:

1. ✅ **Restart Expo dev server** (already done with --clear)
2. ✅ **Test photo capture** in infringement screen
3. ✅ **Verify photo appears** in Supabase Storage
4. ✅ **Check metadata** in `infringement_photos` table
5. ✅ **Test offline mode** (airplane mode, then reconnect)

---

## Future Enhancements

Consider adding:
- [ ] Image compression before upload
- [ ] Multiple photo sizes (thumbnail, full)
- [ ] Photo galleries for infringements
- [ ] Batch upload optimization
- [ ] CDN for faster loading
- [ ] Automatic cleanup of old photos

---

## Support

If you encounter issues:
1. Check Metro bundler logs
2. Check Supabase dashboard logs (Database → Logs)
3. Check storage policies are correct
4. Verify authentication is working
5. Test with a simple upload in SQL Editor

**Metro cache issues?** Always try: `npx expo start --clear`

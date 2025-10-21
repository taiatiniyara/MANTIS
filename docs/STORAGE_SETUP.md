# 📦 Complete Storage Solution - Mobile + Web

## Overview

Created comprehensive Supabase Storage setup for the entire MANTIS system covering:
- ✅ Mobile app (React Native/Expo)
- ✅ Web dashboard (Next.js)
- ✅ Document management
- ✅ Payment system
- ✅ User profiles

---

## 📂 Storage Buckets Created

### 1. **evidence-photos** (Mobile App)
- **Purpose:** Infringement evidence photos with GPS watermarks
- **Size Limit:** 10MB per file
- **Access:** Public (for transparency)
- **Formats:** JPEG, PNG, WebP
- **Features:**
  - GPS location watermarked
  - Officer name embedded
  - Timestamp overlay
  - Up to 5 photos per infringement

### 2. **documents** (Web Dashboard)
- **Purpose:** Generated PDFs (notices, letters, reports)
- **Size Limit:** 50MB per file
- **Access:** Private (authenticated only)
- **Formats:** PDF, DOC, DOCX
- **Features:**
  - Template-based generation
  - Digital signature support
  - Version tracking
  - Automatic archiving

### 3. **signatures** (Web Dashboard)
- **Purpose:** Digital signatures for documents
- **Size Limit:** 2MB per file
- **Access:** Private (owner only)
- **Formats:** PNG, SVG
- **Features:**
  - Canvas-based signatures
  - Metadata tracking
  - IP address logging
  - Certificate support

### 4. **receipts** (Web Dashboard)
- **Purpose:** Payment receipts
- **Size Limit:** 10MB per file
- **Access:** Private (authenticated)
- **Formats:** PDF, JPEG, PNG
- **Features:**
  - Auto-generated on payment
  - Downloadable by payers
  - Email-ready format
  - Audit trail

### 5. **reports** (Web Dashboard)
- **Purpose:** Exported reports and analytics
- **Size Limit:** 100MB per file
- **Access:** Private (authenticated)
- **Formats:** PDF, CSV, XLSX
- **Features:**
  - Custom date ranges
  - Multiple export formats
  - Scheduled cleanup
  - Share with stakeholders

### 6. **profile-photos** (Both Platforms)
- **Purpose:** User avatars
- **Size Limit:** 5MB per file
- **Access:** Public
- **Formats:** JPEG, PNG, WebP
- **Features:**
  - Auto-resize
  - Circular crop
  - Default avatars
  - Quick update

---

## 🔐 Security Policies

### Row-Level Security (RLS)
All buckets use Supabase RLS with 25+ policies:

#### Evidence Photos
- ✅ Officers can upload
- ✅ Officers can view all
- ✅ Officers can update/delete own
- ✅ Public can view (transparency)

#### Documents
- ✅ Authenticated users can upload
- ✅ Authenticated users can view
- ✅ Users can manage own documents
- ❌ Public cannot access

#### Signatures
- ✅ Authenticated users can upload
- ✅ Only owner can view
- ✅ Only owner can delete
- ❌ No public access

#### Receipts
- ✅ Authenticated users can upload
- ✅ All authenticated can view
- ✅ Only owner can delete
- ❌ No public access

#### Reports
- ✅ Authenticated users can upload
- ✅ All authenticated can view
- ✅ Only owner can delete
- ❌ No public access

#### Profile Photos
- ✅ Owner can upload/update/delete
- ✅ Anyone can view (public)
- ✅ Default avatar if not set

---

## 📁 File Structure

```
Supabase Storage/
│
├── evidence-photos/ (PUBLIC)
│   ├── {userId}/
│   │   ├── {infringementId}_1729425600000_0.jpg
│   │   ├── {infringementId}_1729425600000_1.jpg
│   │   └── {infringementId}_1729425600000_2.jpg
│
├── documents/ (PRIVATE)
│   └── {userId}/
│       ├── notices/
│       │   ├── {documentId}.pdf
│       │   └── parking_notice_001.pdf
│       ├── letters/
│       │   └── warning_letter_002.pdf
│       └── reports/
│           └── monthly_summary_003.pdf
│
├── signatures/ (PRIVATE)
│   └── {userId}/
│       ├── {documentId}_signature.png
│       └── {documentId}_signature.svg
│
├── receipts/ (PRIVATE)
│   └── {userId}/
│       ├── receipt_PAY001.pdf
│       ├── receipt_PAY002.pdf
│       └── receipt_PAY003.jpg
│
├── reports/ (PRIVATE)
│   └── {userId}/
│       ├── infringements_export_1729425600000.csv
│       ├── monthly_report_1729425600000.pdf
│       ├── payment_reconciliation_1729425600000.xlsx
│       └── analytics_dashboard_1729425600000.pdf
│
└── profile-photos/ (PUBLIC)
    ├── {userId}/
    │   └── avatar.jpg
    └── {userId2}/
        └── avatar.jpg
```

---

## 🚀 Setup Instructions

### Quick Setup (2 minutes)

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Run:** `db/QUICK_FIX_STORAGE.sql`
4. **Done!** ✅

### Verify Setup

```sql
-- Check all buckets created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit / 1048576 AS size_limit_mb
FROM storage.buckets;

-- Should show 6 buckets
```

---

## 💻 Usage Examples

### Mobile App (Evidence Photos)

```typescript
// Already implemented in:
// mobile/lib/supabase.ts
// mobile/app/(tabs)/infringement/camera.tsx

import { storage } from '@/lib/supabase';

// Upload photo
const { data, error } = await storage.uploadPhoto(
  fileName,
  base64Data,
  'evidence-photos'
);

// Get URL
const url = storage.getPhotoUrl(fileName, 'evidence-photos');
```

### Web Dashboard (Documents)

```typescript
// New utilities file created:
// web/lib/supabase/storage.ts

import { documentsStorage } from '@/lib/supabase/storage';

// Upload PDF
const { data, error } = await documentsStorage.uploadDocument(
  userId,
  documentId,
  pdfBlob,
  'notices'
);

// Get URL
const url = documentsStorage.getDocumentUrl(userId, documentId, 'notices');

// Download
const { data, error } = await documentsStorage.downloadDocument(
  userId,
  documentId,
  'notices'
);
```

### Web Dashboard (Receipts)

```typescript
import { receiptsStorage } from '@/lib/supabase/storage';

// Upload receipt
await receiptsStorage.uploadReceipt(userId, paymentId, pdfBlob);

// Get signed URL (expires in 1 hour)
const { data } = await receiptsStorage.getReceiptUrl(userId, paymentId);

// Download
const { data } = await receiptsStorage.downloadReceipt(userId, paymentId);
```

### Web Dashboard (Reports)

```typescript
import { reportsStorage } from '@/lib/supabase/storage';

// Upload report
await reportsStorage.uploadReport(
  userId,
  'monthly_infringements',
  csvBlob,
  'csv'
);

// List all reports
const { data: reports } = await reportsStorage.listReports(userId);

// Cleanup old reports (30+ days)
await reportsStorage.cleanupOldReports(userId, 30);
```

### Profile Photos

```typescript
import { profilePhotosStorage } from '@/lib/supabase/storage';

// Upload avatar
await profilePhotosStorage.uploadProfilePhoto(userId, photoBlob);

// Get URL (public)
const url = profilePhotosStorage.getProfilePhotoUrl(userId);
```

---

## 🔧 Integration Points

### Mobile App
- **Camera Component:** `mobile/app/(tabs)/infringement/camera.tsx`
- **Storage Utils:** `mobile/lib/supabase.ts`
- **Photo Metadata:** `mobile/lib/gps-service.ts`

### Web Dashboard
- **Storage Utils:** `web/lib/supabase/storage.ts` ⭐ NEW
- **Document Management:** `web/components/documents/document-management-dashboard.tsx`
- **Payment Receipts:** `web/components/payments/payment-management-dashboard.tsx`
- **Report Export:** `web/app/api/reports/export/route.ts`
- **PDF Generation:** `web/app/api/documents/[id]/pdf/route.ts`

---

## 📊 Storage Limits & Quotas

### File Size Limits
- Evidence photos: 10MB each
- Documents: 50MB each
- Signatures: 2MB each
- Receipts: 10MB each
- Reports: 100MB each
- Profile photos: 5MB each

### Bucket Quotas
- **Supabase Free Tier:** 1GB total
- **Pro Plan:** 100GB + $0.021/GB over
- **Recommended:** Monitor usage with `getStorageUsage()` utility

### Cleanup Strategies
1. **Evidence Photos:** Keep indefinitely (legal requirement)
2. **Documents:** Archive after 7 years
3. **Signatures:** Keep permanently
4. **Receipts:** Archive after 7 years
5. **Reports:** Auto-delete after 30 days
6. **Profile Photos:** Keep current only

---

## 🧪 Testing Checklist

### Mobile App
- [ ] Take infringement photo
- [ ] Verify GPS watermark applied
- [ ] Check photo uploads to evidence-photos
- [ ] Confirm offline queue works
- [ ] Test photo sync on reconnect

### Web Dashboard
- [ ] Generate document from template
- [ ] Download document as PDF
- [ ] Add digital signature
- [ ] Generate payment receipt
- [ ] Export CSV report
- [ ] Upload profile photo

### Security
- [ ] Authenticated users can access private buckets
- [ ] Public cannot access private buckets
- [ ] Users can only modify own files
- [ ] Public can view evidence photos
- [ ] Public can view profile photos

---

## 📝 Database Tables

### infringement_photos
```sql
CREATE TABLE infringement_photos (
  id uuid PRIMARY KEY,
  infringement_id uuid REFERENCES infringements(id),
  storage_path text NOT NULL,
  file_name text NOT NULL,
  watermark_data jsonb,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
```

Already defined in `db/migrations/015_storage_buckets.sql`

---

## 🎯 Next Steps

1. ✅ **Run SQL Script:** `db/QUICK_FIX_STORAGE.sql`
2. ✅ **Verify Buckets Created:** Check Supabase Dashboard
3. ✅ **Test Mobile App:** Take photo and verify upload
4. ✅ **Test Web Dashboard:** Generate document
5. ✅ **Update API Routes:** Use new storage utilities
6. ✅ **Add Error Handling:** Graceful fallbacks
7. ✅ **Monitor Usage:** Set up alerts for quota

---

## 🆘 Troubleshooting

### Error: "Bucket not found"
- Run `db/QUICK_FIX_STORAGE.sql`
- Verify in Supabase Dashboard → Storage

### Error: "Permission denied"
- Check user is authenticated
- Verify RLS policies exist
- Check file ownership

### Error: "File size limit exceeded"
- Compress images before upload
- Split large reports into chunks
- Check bucket size limits

### Photos not syncing
- Check internet connection
- Verify auth token valid
- Check AsyncStorage queue

---

## 📚 Documentation

- **Mobile Setup:** `mobile/STORAGE_SETUP.md`
- **Quick Fix Guide:** `FIX_STORAGE_NOW.md`
- **SQL Migration:** `db/migrations/015_storage_buckets.sql`
- **Quick SQL Setup:** `db/QUICK_FIX_STORAGE.sql`
- **Web Storage Utils:** `web/lib/supabase/storage.ts`

---

## ✅ Summary

**Created:**
- ✅ 6 storage buckets (mobile + web)
- ✅ 25+ security policies (RLS)
- ✅ Web storage utilities
- ✅ Complete documentation
- ✅ SQL setup scripts
- ✅ Integration examples

**Ready for:**
- ✅ Mobile photo uploads
- ✅ Web document generation
- ✅ Payment receipt storage
- ✅ Report exports
- ✅ User avatars
- ✅ Digital signatures

**Just run the SQL and start uploading!** 🚀

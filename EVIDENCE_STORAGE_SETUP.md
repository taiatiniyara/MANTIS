# Evidence Storage Setup Guide

This guide will help you set up the Supabase Storage bucket for storing infringement evidence (photos/documents).

## Prerequisites

- Supabase project created
- Access to Supabase Dashboard
- SQL Editor access

## Step 1: Create Storage Bucket

1. Open your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create bucket**
4. Configure the bucket:
   - **Name**: `evidence`
   - **Public**: ✅ Yes (checked)
   - Click **Create bucket**

## Step 2: Set Up Storage Policies

1. Go to **SQL Editor** in the Supabase Dashboard
2. Copy the contents of `create-evidence-storage.sql`
3. Paste into the SQL Editor
4. Click **Run**

### What the policies do:

- **Upload Policy**: Allows authenticated users to upload evidence
- **View Policy**: Allows authenticated users to view all evidence
- **Delete Policy**: Allows officers to delete evidence for their agency's infringements

## Step 3: Verify Setup

1. Go back to **Storage** > **evidence** bucket
2. You should see the bucket is public
3. Test by uploading a file manually (optional)

## File Upload Specifications

### Accepted Files
- **Type**: Images only (jpg, jpeg, png, gif, webp)
- **Size**: Maximum 5MB per file
- **Quantity**: Maximum 5 images per infringement

### File Naming Convention
Files are automatically named using the pattern:
```
{infringement_id}/{timestamp}.{extension}
```

Example: `550e8400-e29b-41d4-a716-446655440000/1697192400000.jpg`

## Usage in Application

### Upload Evidence
1. Open an infringement detail view
2. Click the **Upload** button in the Evidence section
3. Select one or more images (max 5 total)
4. Files are automatically uploaded to Supabase Storage
5. URLs are stored in the `infringements.evidence_urls` JSONB array

### View Evidence
- Evidence is displayed in a grid layout in the detail view
- Click on images to view full size (browser native)

### Delete Evidence
1. Hover over an image in the detail view
2. Click the red **X** button in the top-right corner
3. Confirm deletion
4. File is removed from storage and database

## Security Considerations

### Row Level Security (RLS)
- Only authenticated users can access evidence
- Officers can only delete evidence for their own agency's infringements
- Central admins can view all evidence

### Access Control
- Evidence URLs are public but unpredictable (UUIDs in path)
- Policies ensure proper authorization through RLS
- All operations are logged in audit trail

## Troubleshooting

### "Failed to upload" error
- **Check file size**: Must be under 5MB
- **Check file type**: Must be an image
- **Check bucket**: Ensure `evidence` bucket exists and is public
- **Check policies**: Run the SQL script again

### "Failed to delete" error
- **Check permissions**: User must be officer of the issuing agency
- **Check status**: Can only modify "issued" infringements
- **Check RLS**: Ensure storage policies are set up correctly

### Images not displaying
- **Check public access**: Bucket must be public
- **Check URLs**: URLs should be stored in `evidence_urls` array
- **Check browser**: Some browsers block mixed content (HTTP/HTTPS)

## Storage Limits

### Supabase Free Tier
- **Storage**: 1GB included
- **Bandwidth**: 2GB per month

### Estimation
- Average photo size: ~2MB
- Photos per infringement: 5 max
- Storage for 100 infringements: ~1GB

**Recommendation**: Monitor storage usage in Supabase Dashboard and consider upgrading plan if needed.

## Maintenance

### Regular Tasks
1. Monitor storage usage monthly
2. Review and archive old evidence if needed
3. Check for orphaned files (files not linked to infringements)
4. Backup critical evidence to external storage

### Cleanup Script (Future Enhancement)
Consider creating a scheduled job to:
- Remove evidence for voided infringements older than X months
- Archive evidence for paid infringements older than Y years
- Generate storage usage reports

## Next Steps

After setting up evidence storage:
1. Test file upload in development environment
2. Verify RLS policies work correctly
3. Test image deletion
4. Document any custom policies or modifications
5. Train users on evidence upload best practices

---

**Setup Complete!** 🎉

Evidence storage is now ready for use in the MANTIS application.

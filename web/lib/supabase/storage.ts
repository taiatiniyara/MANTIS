/**
 * Supabase Storage Utilities for Web Dashboard
 * Handles uploads/downloads for documents, signatures, receipts, and reports
 */

import { supabase } from './client';

// ============================================
// DOCUMENTS (Generated PDFs)
// ============================================

export const documentsStorage = {
  /**
   * Upload a generated document PDF
   */
  uploadDocument: async (
    userId: string,
    documentId: string,
    pdfBlob: Blob,
    category: 'notices' | 'letters' | 'reports' = 'notices'
  ) => {
    const fileName = `${userId}/${category}/${documentId}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });
    
    return { data, error };
  },

  /**
   * Get document URL
   */
  getDocumentUrl: (userId: string, documentId: string, category: string = 'notices') => {
    const fileName = `${userId}/${category}/${documentId}.pdf`;
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  },

  /**
   * Download document
   */
  downloadDocument: async (userId: string, documentId: string, category: string = 'notices') => {
    const fileName = `${userId}/${category}/${documentId}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .download(fileName);
    
    return { data, error };
  },

  /**
   * Delete document
   */
  deleteDocument: async (userId: string, documentId: string, category: string = 'notices') => {
    const fileName = `${userId}/${category}/${documentId}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .remove([fileName]);
    
    return { data, error };
  },
};

// ============================================
// SIGNATURES (Digital Signatures)
// ============================================

export const signaturesStorage = {
  /**
   * Upload digital signature
   */
  uploadSignature: async (
    userId: string,
    documentId: string,
    signatureBlob: Blob
  ) => {
    const fileName = `${userId}/${documentId}_signature.png`;
    
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(fileName, signatureBlob, {
        contentType: 'image/png',
        upsert: true,
      });
    
    return { data, error };
  },

  /**
   * Get signature URL (private - requires auth)
   */
  getSignatureUrl: async (userId: string, documentId: string, expiresIn = 3600) => {
    const fileName = `${userId}/${documentId}_signature.png`;
    
    const { data, error } = await supabase.storage
      .from('signatures')
      .createSignedUrl(fileName, expiresIn);
    
    return { data, error };
  },

  /**
   * Delete signature
   */
  deleteSignature: async (userId: string, documentId: string) => {
    const fileName = `${userId}/${documentId}_signature.png`;
    
    const { data, error } = await supabase.storage
      .from('signatures')
      .remove([fileName]);
    
    return { data, error };
  },
};

// ============================================
// RECEIPTS (Payment Receipts)
// ============================================

export const receiptsStorage = {
  /**
   * Upload payment receipt
   */
  uploadReceipt: async (
    userId: string,
    paymentId: string,
    receiptBlob: Blob,
    format: 'pdf' | 'jpg' = 'pdf'
  ) => {
    const fileName = `${userId}/receipt_${paymentId}.${format}`;
    const contentType = format === 'pdf' ? 'application/pdf' : 'image/jpeg';
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, receiptBlob, {
        contentType,
        upsert: true,
      });
    
    return { data, error };
  },

  /**
   * Get receipt URL (private - requires auth)
   */
  getReceiptUrl: async (userId: string, paymentId: string, format: 'pdf' | 'jpg' = 'pdf', expiresIn = 3600) => {
    const fileName = `${userId}/receipt_${paymentId}.${format}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(fileName, expiresIn);
    
    return { data, error };
  },

  /**
   * Download receipt
   */
  downloadReceipt: async (userId: string, paymentId: string, format: 'pdf' | 'jpg' = 'pdf') => {
    const fileName = `${userId}/receipt_${paymentId}.${format}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .download(fileName);
    
    return { data, error };
  },

  /**
   * Delete receipt
   */
  deleteReceipt: async (userId: string, paymentId: string, format: 'pdf' | 'jpg' = 'pdf') => {
    const fileName = `${userId}/receipt_${paymentId}.${format}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .remove([fileName]);
    
    return { data, error };
  },
};

// ============================================
// REPORTS (Exported Reports)
// ============================================

export const reportsStorage = {
  /**
   * Upload exported report
   */
  uploadReport: async (
    userId: string,
    reportName: string,
    reportBlob: Blob,
    format: 'pdf' | 'csv' | 'xlsx' = 'pdf'
  ) => {
    const contentTypes = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    
    const timestamp = new Date().getTime();
    const fileName = `${userId}/${reportName}_${timestamp}.${format}`;
    
    const { data, error } = await supabase.storage
      .from('reports')
      .upload(fileName, reportBlob, {
        contentType: contentTypes[format],
        upsert: false, // Don't overwrite - keep report history
      });
    
    return { data, error };
  },

  /**
   * Get report URL (private - requires auth)
   */
  getReportUrl: async (userId: string, fileName: string, expiresIn = 3600) => {
    const fullPath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('reports')
      .createSignedUrl(fullPath, expiresIn);
    
    return { data, error };
  },

  /**
   * List all reports for user
   */
  listReports: async (userId: string) => {
    const { data, error } = await supabase.storage
      .from('reports')
      .list(userId, {
        sortBy: { column: 'created_at', order: 'desc' },
      });
    
    return { data, error };
  },

  /**
   * Download report
   */
  downloadReport: async (userId: string, fileName: string) => {
    const fullPath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('reports')
      .download(fullPath);
    
    return { data, error };
  },

  /**
   * Delete report
   */
  deleteReport: async (userId: string, fileName: string) => {
    const fullPath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('reports')
      .remove([fullPath]);
    
    return { data, error };
  },

  /**
   * Clean up old reports (older than X days)
   */
  cleanupOldReports: async (userId: string, daysOld: number = 30) => {
    const { data: files, error: listError } = await supabase.storage
      .from('reports')
      .list(userId);
    
    if (listError || !files) return { data: null, error: listError };
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldFiles = files.filter(file => 
      new Date(file.created_at) < cutoffDate
    );
    
    if (oldFiles.length === 0) {
      return { data: { deleted: 0 }, error: null };
    }
    
    const filePaths = oldFiles.map(file => `${userId}/${file.name}`);
    
    const { data, error } = await supabase.storage
      .from('reports')
      .remove(filePaths);
    
    return { data: { deleted: oldFiles.length }, error };
  },
};

// ============================================
// PROFILE PHOTOS (User Avatars)
// ============================================

export const profilePhotosStorage = {
  /**
   * Upload profile photo
   */
  uploadProfilePhoto: async (
    userId: string,
    photoBlob: Blob
  ) => {
    const fileName = `${userId}/avatar.jpg`;
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, photoBlob, {
        contentType: 'image/jpeg',
        upsert: true, // Replace existing avatar
      });
    
    return { data, error };
  },

  /**
   * Get profile photo URL (public)
   */
  getProfilePhotoUrl: (userId: string) => {
    const fileName = `${userId}/avatar.jpg`;
    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  },

  /**
   * Delete profile photo
   */
  deleteProfilePhoto: async (userId: string) => {
    const fileName = `${userId}/avatar.jpg`;
    
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .remove([fileName]);
    
    return { data, error };
  },
};

// ============================================
// EVIDENCE PHOTOS (Mobile App - Web Access)
// ============================================

export const evidencePhotosStorage = {
  /**
   * Get evidence photo URL (public)
   */
  getEvidencePhotoUrl: (fileName: string) => {
    const { data } = supabase.storage
      .from('evidence-photos')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  },

  /**
   * List evidence photos for infringement
   */
  listInfringementPhotos: async (infringementId: string) => {
    const { data, error } = await supabase.storage
      .from('evidence-photos')
      .list('', {
        search: infringementId,
      });
    
    return { data, error };
  },

  /**
   * Delete evidence photo (admin only)
   */
  deleteEvidencePhoto: async (fileName: string) => {
    const { data, error } = await supabase.storage
      .from('evidence-photos')
      .remove([fileName]);
    
    return { data, error };
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get storage usage for a user
 */
export const getStorageUsage = async (userId: string) => {
  const buckets = ['documents', 'signatures', 'receipts', 'reports', 'profile-photos'];
  const usage: Record<string, number> = {};
  
  for (const bucket of buckets) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(userId);
    
    if (data) {
      usage[bucket] = data.reduce((total, file) => total + (file.metadata?.size || 0), 0);
    }
  }
  
  return usage;
};

/**
 * Format bytes to human readable
 */
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

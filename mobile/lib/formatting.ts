/**
 * MANTIS Mobile - Formatting Utilities
 * 
 * Date, currency, and text formatting helpers
 */

// -----------------------------------------------------
// Date Formatting
// -----------------------------------------------------

export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }

  switch (format) {
    case 'short':
      // DD/MM/YYYY
      return d.toLocaleDateString('en-FJ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    
    case 'long':
      // 16 January 2026
      return d.toLocaleDateString('en-FJ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    
    case 'full':
      // Saturday, 16 January 2026
      return d.toLocaleDateString('en-FJ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    
    default:
      return d.toLocaleDateString('en-FJ');
  }
}

export function formatTime(date: Date | string, format: '12h' | '24h' = '12h'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid time';
  }

  if (format === '12h') {
    return d.toLocaleTimeString('en-FJ', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    return d.toLocaleTimeString('en-FJ', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date, 'short')} ${formatTime(date, '12h')}`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(d, 'short');
  }
}

// -----------------------------------------------------
// Currency Formatting (Fiji Dollar)
// -----------------------------------------------------

export function formatCurrency(amount: number, showSymbol: boolean = true): string {
  if (isNaN(amount)) {
    return showSymbol ? 'FJD 0.00' : '0.00';
  }

  const formatted = amount.toLocaleString('en-FJ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `FJD ${formatted}` : formatted;
}

export function formatCurrencyShort(amount: number): string {
  if (isNaN(amount)) {
    return 'FJD 0';
  }

  if (amount >= 1000000) {
    return `FJD ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `FJD ${(amount / 1000).toFixed(1)}K`;
  } else {
    return `FJD ${amount.toFixed(0)}`;
  }
}

// -----------------------------------------------------
// Text Formatting
// -----------------------------------------------------

export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Fiji phone format: +679 XXX XXXX or +679 XXXX XXXX
  if (cleaned.startsWith('679')) {
    const number = cleaned.substring(3);
    if (number.length === 7) {
      return `+679 ${number.substring(0, 3)} ${number.substring(3)}`;
    } else if (number.length === 8) {
      return `+679 ${number.substring(0, 4)} ${number.substring(4)}`;
    }
  }
  
  return phone;
}

// -----------------------------------------------------
// Status Formatting
// -----------------------------------------------------

export function formatInfringementStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    pending: 'Pending Review',
    approved: 'Approved',
    paid: 'Paid',
    appealed: 'Under Appeal',
    appeal_approved: 'Appeal Approved',
    appeal_rejected: 'Appeal Rejected',
    cancelled: 'Cancelled',
    overdue: 'Overdue',
    pending_sync: 'Pending Sync',
    synced: 'Synced',
  };

  return statusMap[status] || capitalizeWords(status);
}

export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    'Super Admin': 'Super Admin',
    'Agency Admin': 'Agency Admin',
    'Team Leader': 'Team Leader',
    'Officer': 'Officer',
    'Citizen': 'Citizen',
    'Government Official': 'Government Official',
  };

  return roleMap[role] || role;
}

// -----------------------------------------------------
// License & Plate Formatting
// -----------------------------------------------------

export function formatLicenseNumber(license: string): string {
  if (!license) return '';
  return license.toUpperCase().replace(/\s+/g, '');
}

export function formatPlateNumber(plate: string): string {
  if (!plate) return '';
  return plate.toUpperCase().replace(/\s+/g, ' ').trim();
}

// -----------------------------------------------------
// Location Formatting
// -----------------------------------------------------

export function formatCoordinates(
  latitude: number,
  longitude: number,
  format: 'decimal' | 'dms' = 'decimal'
): string {
  if (format === 'decimal') {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } else {
    // Convert to degrees, minutes, seconds
    const latDeg = Math.abs(Math.floor(latitude));
    const latMin = Math.abs(Math.floor((latitude - Math.floor(latitude)) * 60));
    const latSec = Math.abs(((latitude - Math.floor(latitude)) * 60 - latMin) * 60);
    const latDir = latitude >= 0 ? 'N' : 'S';

    const lonDeg = Math.abs(Math.floor(longitude));
    const lonMin = Math.abs(Math.floor((longitude - Math.floor(longitude)) * 60));
    const lonSec = Math.abs(((longitude - Math.floor(longitude)) * 60 - lonMin) * 60);
    const lonDir = longitude >= 0 ? 'E' : 'W';

    return `${latDeg}°${latMin}'${latSec.toFixed(1)}"${latDir}, ${lonDeg}°${lonMin}'${lonSec.toFixed(1)}"${lonDir}`;
  }
}

export function formatGPSAccuracy(accuracy: number): string {
  if (accuracy < 10) {
    return `±${accuracy.toFixed(1)}m (Excellent)`;
  } else if (accuracy < 50) {
    return `±${accuracy.toFixed(0)}m (Good)`;
  } else if (accuracy < 100) {
    return `±${accuracy.toFixed(0)}m (Fair)`;
  } else {
    return `±${accuracy.toFixed(0)}m (Poor)`;
  }
}

// -----------------------------------------------------
// File Size Formatting
// -----------------------------------------------------

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// -----------------------------------------------------
// Count Formatting
// -----------------------------------------------------

export function formatCount(count: number, singular: string, plural?: string): string {
  if (count === 1) {
    return `1 ${singular}`;
  }
  return `${count.toLocaleString('en-FJ')} ${plural || `${singular}s`}`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
}

// -----------------------------------------------------
// Duration Formatting
// -----------------------------------------------------

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
}

// -----------------------------------------------------
// Offence Code Formatting
// -----------------------------------------------------

export function formatOffenceCode(code: string): string {
  if (!code) return '';
  return code.toUpperCase();
}

// -----------------------------------------------------
// Address Formatting
// -----------------------------------------------------

export function formatAddress(address: string, maxLines: number = 2): string {
  if (!address) return '';
  
  // Split by commas or newlines
  const parts = address.split(/[,\n]/).map(part => part.trim());
  
  if (parts.length <= maxLines) {
    return parts.join(', ');
  }
  
  return parts.slice(0, maxLines).join(', ') + '...';
}

// -----------------------------------------------------
// Network Status Formatting
// -----------------------------------------------------

export function formatNetworkType(type: string | null): string {
  if (!type) return 'Unknown';
  
  const typeMap: Record<string, string> = {
    wifi: 'Wi-Fi',
    cellular: 'Cellular',
    ethernet: 'Ethernet',
    bluetooth: 'Bluetooth',
    none: 'Offline',
    unknown: 'Unknown',
  };

  return typeMap[type.toLowerCase()] || type;
}

// -----------------------------------------------------
// Identifier Helpers
// -----------------------------------------------------

export function generateTin(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  let prefix = '';
  for (let i = 0; i < 3; i++) {
    prefix += letters[Math.floor(Math.random() * letters.length)];
  }

  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += digits[Math.floor(Math.random() * digits.length)];
  }

  return `${prefix}${suffix}`;
}

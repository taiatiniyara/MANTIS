/**
 * MANTIS Mobile - Validation Utilities
 * 
 * Form validation helpers for mobile app
 */

// -----------------------------------------------------
// License Number Validation (Fiji)
// -----------------------------------------------------

export function validateLicenseNumber(license: string): {
  valid: boolean;
  error?: string;
} {
  if (!license || license.trim() === '') {
    return { valid: false, error: 'License number is required' };
  }

  // Fiji license format: typically alphanumeric
  const cleanLicense = license.trim().toUpperCase();
  
  if (cleanLicense.length < 3) {
    return { valid: false, error: 'License number is too short' };
  }

  if (cleanLicense.length > 20) {
    return { valid: false, error: 'License number is too long' };
  }

  // Only allow letters, numbers, and hyphens
  if (!/^[A-Z0-9-]+$/.test(cleanLicense)) {
    return { valid: false, error: 'License number contains invalid characters' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// Plate Number Validation (Fiji)
// -----------------------------------------------------

export function validatePlateNumber(plate: string): {
  valid: boolean;
  error?: string;
} {
  if (!plate || plate.trim() === '') {
    return { valid: false, error: 'Plate number is required' };
  }

  const cleanPlate = plate.trim().toUpperCase();
  
  if (cleanPlate.length < 2) {
    return { valid: false, error: 'Plate number is too short' };
  }

  if (cleanPlate.length > 15) {
    return { valid: false, error: 'Plate number is too long' };
  }

  // Allow letters, numbers, spaces, and hyphens
  if (!/^[A-Z0-9\s-]+$/.test(cleanPlate)) {
    return { valid: false, error: 'Plate number contains invalid characters' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// Name Validation
// -----------------------------------------------------

export function validateFullName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Full name is required' };
  }

  const cleanName = name.trim();
  
  if (cleanName.length < 2) {
    return { valid: false, error: 'Name is too short' };
  }

  if (cleanName.length > 100) {
    return { valid: false, error: 'Name is too long' };
  }

  // Allow letters, spaces, hyphens, apostrophes, and dots
  if (!/^[a-zA-Z\s.'-]+$/.test(cleanName)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// Date of Birth Validation
// -----------------------------------------------------

export function validateDateOfBirth(dob: Date): {
  valid: boolean;
  error?: string;
} {
  if (!dob) {
    return { valid: false, error: 'Date of birth is required' };
  }

  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  
  if (age < 16) {
    return { valid: false, error: 'Driver must be at least 16 years old' };
  }

  if (age > 120) {
    return { valid: false, error: 'Invalid date of birth' };
  }

  if (dob > today) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// Address Validation
// -----------------------------------------------------

export function validateAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!address || address.trim() === '') {
    return { valid: true }; // Address is optional
  }

  const cleanAddress = address.trim();
  
  if (cleanAddress.length < 5) {
    return { valid: false, error: 'Address is too short' };
  }

  if (cleanAddress.length > 200) {
    return { valid: false, error: 'Address is too long' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// GPS Coordinates Validation
// -----------------------------------------------------

export function validateCoordinates(
  latitude: number,
  longitude: number
): {
  valid: boolean;
  error?: string;
} {
  // Fiji coordinates range:
  // Latitude: approximately -15° to -21°
  // Longitude: approximately 177° to 180°
  
  if (latitude < -22 || latitude > -15) {
    return { valid: false, error: 'Latitude is outside Fiji region' };
  }

  if (longitude < 176 || longitude > 181) {
    return { valid: false, error: 'Longitude is outside Fiji region' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// GPS Accuracy Validation
// -----------------------------------------------------

export function validateGPSAccuracy(accuracy: number): {
  valid: boolean;
  error?: string;
  warning?: string;
} {
  if (accuracy < 0) {
    return { valid: false, error: 'Invalid GPS accuracy' };
  }

  if (accuracy > 100) {
    return {
      valid: true,
      warning: 'GPS accuracy is poor. Consider moving to a location with better signal.',
    };
  }

  if (accuracy > 50) {
    return {
      valid: true,
      warning: 'GPS accuracy is moderate. Location may not be precise.',
    };
  }

  return { valid: true };
}

// -----------------------------------------------------
// File Validation
// -----------------------------------------------------

export function validatePhotoFile(
  uri: string,
  fileSize?: number
): {
  valid: boolean;
  error?: string;
} {
  if (!uri || uri.trim() === '') {
    return { valid: false, error: 'Photo URI is required' };
  }

  // Check file extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.heic'];
  const hasValidExtension = validExtensions.some(ext => 
    uri.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return { valid: false, error: 'Invalid photo format. Use JPG, PNG, or HEIC.' };
  }

  // Check file size (if provided)
  if (fileSize && fileSize > 10 * 1024 * 1024) {
    return { valid: false, error: 'Photo size exceeds 10MB limit' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// Fine Amount Validation
// -----------------------------------------------------

export function validateFineAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (amount === null || amount === undefined) {
    return { valid: false, error: 'Fine amount is required' };
  }

  if (amount < 0) {
    return { valid: false, error: 'Fine amount cannot be negative' };
  }

  if (amount === 0) {
    return { valid: false, error: 'Fine amount must be greater than zero' };
  }

  if (amount > 100000) {
    return { valid: false, error: 'Fine amount seems unreasonably high' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// Description Validation
// -----------------------------------------------------

export function validateDescription(description: string): {
  valid: boolean;
  error?: string;
} {
  if (!description || description.trim() === '') {
    return { valid: true }; // Description is optional
  }

  const cleanDescription = description.trim();
  
  if (cleanDescription.length < 10) {
    return { valid: false, error: 'Description is too short (minimum 10 characters)' };
  }

  if (cleanDescription.length > 1000) {
    return { valid: false, error: 'Description is too long (maximum 1000 characters)' };
  }

  return { valid: true };
}

// -----------------------------------------------------
// Infringement Form Validation
// -----------------------------------------------------

export interface InfringementFormErrors {
  offence_code?: string;
  driver_license_number?: string;
  driver_full_name?: string;
  driver_dob?: string;
  vehicle_plate_number?: string;
  location?: string;
  fine_amount?: string;
  description?: string;
  photos?: string;
}

export function validateInfringementForm(data: {
  offence_code?: string;
  driver_license_number?: string;
  driver_full_name?: string;
  driver_dob?: Date;
  vehicle_plate_number?: string;
  location?: { latitude: number; longitude: number };
  fine_amount?: number;
  description?: string;
  photos?: any[];
}): {
  valid: boolean;
  errors: InfringementFormErrors;
} {
  const errors: InfringementFormErrors = {};

  // Offence code
  if (!data.offence_code) {
    errors.offence_code = 'Offence type is required';
  }

  // Driver license
  const licenseValidation = validateLicenseNumber(data.driver_license_number || '');
  if (!licenseValidation.valid) {
    errors.driver_license_number = licenseValidation.error;
  }

  // Driver name
  const nameValidation = validateFullName(data.driver_full_name || '');
  if (!nameValidation.valid) {
    errors.driver_full_name = nameValidation.error;
  }

  // Date of birth (optional)
  if (data.driver_dob) {
    const dobValidation = validateDateOfBirth(data.driver_dob);
    if (!dobValidation.valid) {
      errors.driver_dob = dobValidation.error;
    }
  }

  // Vehicle plate
  const plateValidation = validatePlateNumber(data.vehicle_plate_number || '');
  if (!plateValidation.valid) {
    errors.vehicle_plate_number = plateValidation.error;
  }

  // Location
  if (data.location) {
    const coordValidation = validateCoordinates(
      data.location.latitude,
      data.location.longitude
    );
    if (!coordValidation.valid) {
      errors.location = coordValidation.error;
    }
  }

  // Fine amount
  if (data.fine_amount !== undefined) {
    const amountValidation = validateFineAmount(data.fine_amount);
    if (!amountValidation.valid) {
      errors.fine_amount = amountValidation.error;
    }
  }

  // Description
  if (data.description) {
    const descValidation = validateDescription(data.description);
    if (!descValidation.valid) {
      errors.description = descValidation.error;
    }
  }

  // Photos (at least one required for some offences)
  // This validation should check the offence requirements
  if (data.photos && data.photos.length > 5) {
    errors.photos = 'Maximum 5 photos allowed per infringement';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// -----------------------------------------------------
// Sanitization Helpers
// -----------------------------------------------------

export function sanitizeLicenseNumber(license: string): string {
  return license.trim().toUpperCase().replace(/\s+/g, '');
}

export function sanitizePlateNumber(plate: string): string {
  return plate.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function sanitizeDescription(description: string): string {
  return description.trim().replace(/\s+/g, ' ');
}

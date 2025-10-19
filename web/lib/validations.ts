/**
 * Form validation utilities for the MANTIS application
 * Provides reusable validation functions for common form fields
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates that a required field is not empty
 */
export function validateRequired(value: string | null | undefined, fieldName: string): ValidationResult {
  if (!value || value.trim() === "") {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }
  return { valid: true };
}

/**
 * Validates South African vehicle registration format
 * Formats:
 * - Old: ABC 123 GP (3 letters, 3 digits, 2 letters)
 * - New: CA 123-456 (2 letters, 3 digits, 3 digits)
 * - Custom: ABC 123 (flexible format)
 */
export function validateVehicleId(vehicleId: string): ValidationResult {
  if (!vehicleId || vehicleId.trim() === "") {
    return {
      valid: false,
      error: "Vehicle ID is required",
    };
  }

  const trimmed = vehicleId.trim();
  
  // Old format: ABC 123 GP
  const oldFormat = /^[A-Z]{2,3}\s?\d{3,4}\s?[A-Z]{2}$/i;
  // New format: CA 123-456
  const newFormat = /^[A-Z]{2}\s?\d{3}-?\d{3}$/i;
  // Custom format: At least 3 characters
  const customFormat = /^[A-Z0-9]{3,}$/i;

  if (oldFormat.test(trimmed) || newFormat.test(trimmed) || customFormat.test(trimmed)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: "Invalid vehicle ID format (e.g., ABC123GP or CA123456)",
  };
}

/**
 * Validates that a date is not in the future
 */
export function validatePastDate(dateString: string, fieldName: string): ValidationResult {
  if (!dateString) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: `${fieldName} is not a valid date`,
    };
  }

  if (date > now) {
    return {
      valid: false,
      error: `${fieldName} cannot be in the future`,
    };
  }

  return { valid: true };
}

/**
 * Validates that a date is within a reasonable range (last 10 years)
 */
export function validateDateRange(dateString: string, fieldName: string): ValidationResult {
  if (!dateString) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  const date = new Date(dateString);
  const now = new Date();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(now.getFullYear() - 10);

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: `${fieldName} is not a valid date`,
    };
  }

  if (date < tenYearsAgo) {
    return {
      valid: false,
      error: `${fieldName} must be within the last 10 years`,
    };
  }

  if (date > now) {
    return {
      valid: false,
      error: `${fieldName} cannot be in the future`,
    };
  }

  return { valid: true };
}

/**
 * Validates a numeric field is positive
 */
export function validatePositiveNumber(value: string | number, fieldName: string): ValidationResult {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (num <= 0) {
    return {
      valid: false,
      error: `${fieldName} must be greater than 0`,
    };
  }

  return { valid: true };
}

/**
 * Validates a numeric field is within a range
 */
export function validateNumberRange(
  value: string | number,
  fieldName: string,
  min: number,
  max: number
): ValidationResult {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (num < min || num > max) {
    return {
      valid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return { valid: true };
}

/**
 * Validates an email address format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === "") {
    return {
      valid: false,
      error: "Email is required",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: "Invalid email format",
    };
  }

  return { valid: true };
}

/**
 * Validates a phone number (South African format)
 * Formats: 0123456789, +27123456789, 012 345 6789
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || phone.trim() === "") {
    return {
      valid: false,
      error: "Phone number is required",
    };
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "");

  // South African formats
  const localFormat = /^0\d{9}$/; // 0123456789
  const internationalFormat = /^\+27\d{9}$/; // +27123456789

  if (localFormat.test(cleaned) || internationalFormat.test(cleaned)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: "Invalid phone number format (e.g., 0123456789)",
  };
}

/**
 * Validates a minimum string length
 */
export function validateMinLength(
  value: string,
  fieldName: string,
  minLength: number
): ValidationResult {
  if (!value || value.trim().length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  return { valid: true };
}

/**
 * Validates a maximum string length
 */
export function validateMaxLength(
  value: string,
  fieldName: string,
  maxLength: number
): ValidationResult {
  if (value && value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }
  return { valid: true };
}

/**
 * Combines multiple validation results
 * Returns the first error found, or valid if all pass
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  for (const result of results) {
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * Biometric Authentication Service
 * Handles fingerprint and Face ID authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@mantis:biometric_enabled';
const SAVED_EMAIL_KEY = '@mantis:saved_email';

export interface BiometricConfig {
  isAvailable: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  isEnrolled: boolean;
}

/**
 * Check if biometric authentication is available and configured
 */
export async function checkBiometricAvailability(): Promise<BiometricConfig> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
      isAvailable: compatible && enrolled,
      supportedTypes,
      isEnrolled: enrolled,
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      isAvailable: false,
      supportedTypes: [],
      isEnrolled: false,
    };
  }
}

/**
 * Get friendly name for biometric type
 */
export function getBiometricTypeName(types: LocalAuthentication.AuthenticationType[]): string {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  return 'Biometric';
}

/**
 * Authenticate using biometrics
 */
export async function authenticateWithBiometrics(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const config = await checkBiometricAvailability();

    if (!config.isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available or not enrolled',
      };
    }

    const biometricName = getBiometricTypeName(config.supportedTypes);

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Sign in to MANTIS`,
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Authentication failed',
      };
    }
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

/**
 * Check if user has enabled biometric login
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric setting:', error);
    return false;
  }
}

/**
 * Enable or disable biometric login
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
  } catch (error) {
    console.error('Error setting biometric preference:', error);
    throw error;
  }
}

/**
 * Save email for biometric login
 */
export async function saveBiometricEmail(email: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVED_EMAIL_KEY, email);
  } catch (error) {
    console.error('Error saving email:', error);
    throw error;
  }
}

/**
 * Get saved email for biometric login
 */
export async function getSavedEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SAVED_EMAIL_KEY);
  } catch (error) {
    console.error('Error getting saved email:', error);
    return null;
  }
}

/**
 * Clear biometric data (on sign out)
 */
export async function clearBiometricData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([BIOMETRIC_ENABLED_KEY, SAVED_EMAIL_KEY]);
  } catch (error) {
    console.error('Error clearing biometric data:', error);
  }
}

/**
 * Setup biometric login for user
 */
export async function setupBiometricLogin(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if biometrics are available
    const config = await checkBiometricAvailability();
    if (!config.isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    // Prompt user to authenticate to confirm setup
    const authResult = await authenticateWithBiometrics();
    if (!authResult.success) {
      return authResult;
    }

    // Save settings
    await saveBiometricEmail(email);
    await setBiometricEnabled(true);

    return { success: true };
  } catch (error) {
    console.error('Error setting up biometric login:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Setup failed',
    };
  }
}

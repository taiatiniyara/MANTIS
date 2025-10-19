import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const USER_CREDENTIALS_KEY = 'user_credentials';

interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<LocalAuthentication.AuthenticationType[]>([]);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSettings();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      setIsAvailable(compatible && enrolled);
      setSupportedTypes(types);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  const loadBiometricSettings = async () => {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error loading biometric settings:', error);
    }
  };

  const authenticate = async (
    promptMessage: string = 'Authenticate to continue'
  ): Promise<BiometricAuthResult> => {
    if (!isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication not available',
      };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
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
      return {
        success: false,
        error: 'Authentication error',
      };
    }
  };

  const enableBiometric = async (credentials: { email: string; password: string }) => {
    try {
      // First authenticate to confirm user intent
      const authResult = await authenticate('Enable biometric authentication');
      
      if (!authResult.success) {
        return false;
      }

      // Store credentials securely
      await SecureStore.setItemAsync(
        USER_CREDENTIALS_KEY,
        JSON.stringify(credentials)
      );

      // Enable biometric flag
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      setIsEnabled(true);

      return true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  };

  const disableBiometric = async () => {
    try {
      await SecureStore.deleteItemAsync(USER_CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(false);
      return true;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    }
  };

  const getStoredCredentials = async (): Promise<{ email: string; password: string } | null> => {
    try {
      const credentialsJson = await SecureStore.getItemAsync(USER_CREDENTIALS_KEY);
      return credentialsJson ? JSON.parse(credentialsJson) : null;
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return null;
    }
  };

  const authenticateAndGetCredentials = async (
    promptMessage: string = 'Authenticate to sign in'
  ): Promise<{ success: boolean; credentials?: { email: string; password: string }; error?: string }> => {
    const authResult = await authenticate(promptMessage);

    if (!authResult.success) {
      return {
        success: false,
        error: authResult.error,
      };
    }

    const credentials = await getStoredCredentials();

    if (!credentials) {
      return {
        success: false,
        error: 'No credentials stored',
      };
    }

    return {
      success: true,
      credentials,
    };
  };

  const getBiometricType = (): string => {
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    } else {
      return 'Biometric';
    }
  };

  return {
    isAvailable,
    isEnabled,
    supportedTypes,
    biometricType: getBiometricType(),
    authenticate,
    enableBiometric,
    disableBiometric,
    authenticateAndGetCredentials,
  };
}

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  isBiometricEnabled,
  getSavedEmail,
  getBiometricTypeName,
  setupBiometricLogin,
} from "../lib/biometric-auth";

export default function LoginScreen() {
  const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState("Biometric");
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);

  // Check biometric availability and request location permission on mount
  useEffect(() => {
    checkBiometrics();
    requestLocationPermission();
  }, []);

  const checkBiometrics = async () => {
    const config = await checkBiometricAvailability();
    setBiometricAvailable(config.isAvailable);
    if (config.isAvailable) {
      setBiometricType(getBiometricTypeName(config.supportedTypes));
      const enabled = await isBiometricEnabled();
      setBiometricEnabled(enabled);

      // If biometric is enabled, try to auto-login
      if (enabled) {
        const savedEmail = await getSavedEmail();
        if (savedEmail) {
          setEmail(savedEmail);
          // Prompt for biometric auth after a short delay
          setTimeout(() => {
            handleBiometricLogin();
          }, 500);
        }
      }
    }
  };

  const requestLocationPermission = async () => {
    if (locationPermissionAsked) return;
    
    try {
      // First check if location services are enabled on the device
      const isEnabled = await Location.hasServicesEnabledAsync();
      
      if (!isEnabled) {
        setLocationPermissionAsked(true);
        Alert.alert(
          'Location Services Disabled',
          'Please enable Location Services in your device settings to use location features in MANTIS.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                // On iOS, this will open the settings app
                // On Android, you might need to use Linking.openSettings()
                if (Platform.OS === 'ios') {
                  // iOS will automatically prompt to open settings
                } else {
                  // For Android, you can use expo-intent-launcher or similar
                  Alert.alert('Please enable Location in Settings');
                }
              }
            }
          ]
        );
        return;
      }

      // Check current permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        setLocationPermissionAsked(true);
        return;
      }

      // If not granted, request permission immediately on startup
      // This will show the OS native location permission dialog
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionAsked(true);
      
      // Optionally show feedback based on the result
      if (status === 'denied') {
        Alert.alert(
          'Location Access',
          'Location services are required to record accurate infringement locations. You can enable this later in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermissionAsked(true);
    }
  };

  const handleBiometricLogin = async () => {
    const savedEmail = await getSavedEmail();
    if (!savedEmail) {
      Alert.alert(
        "Error",
        "No saved account found. Please sign in with password first."
      );
      return;
    }

    const result = await authenticateWithBiometrics();
    if (result.success) {
      // User authenticated with biometrics, now we need the password
      // In production, you'd want to securely store the password or use a token
      Alert.alert(
        "Biometric Success",
        "Please enter your password to complete sign in.",
        [{ text: "OK" }]
      );
    } else if (result.error) {
      Alert.alert("Authentication Failed", result.error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } else {
      // Ask if user wants to enable biometric login
      if (biometricAvailable && !biometricEnabled) {
        setShowBiometricSetup(true);
      } else {
        // Navigation handled by auth state change
        router.replace("/(tabs)");
      }
    }
  };

  const handleSetupBiometric = async () => {
    const result = await setupBiometricLogin(email);
    if (result.success) {
      Alert.alert(
        "Success",
        `${biometricType} login enabled! You can now sign in using ${biometricType}.`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
      );
    } else {
      Alert.alert(
        "Setup Failed",
        result.error || "Could not enable biometric login"
      );
      router.replace("/(tabs)");
    }
  };

  const skipBiometricSetup = () => {
    setShowBiometricSetup(false);
    router.replace("/(tabs)");
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show biometric setup prompt after successful login
  if (showBiometricSetup) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.setupContainer}>
            <Text style={styles.setupIcon}>🔐</Text>
            <Text style={styles.setupTitle}>Enable {biometricType}?</Text>
            <Text style={styles.setupText}>
              Sign in faster using {biometricType} instead of your password.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSetupBiometric}
            >
              <Text style={styles.buttonText}>Enable {biometricType}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={skipBiometricSetup}
            >
              <Text style={styles.linkText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" backgroundColor="#007AFF" />

      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🚓 MANTIS</Text>
          <Text style={styles.tagline}>Mobile Infringement System</Text>
          <Text style={styles.subtitle}>Officer Login</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="officer@agency.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              editable={!loading}
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Biometric Login Button */}
          {biometricEnabled && biometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Text style={styles.biometricButtonText}>
                🔐 Sign in with {biometricType}
              </Text>
            </TouchableOpacity>
          )}

          {/* <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/forgot-password')}
            disabled={loading}
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity> */}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>For officer use only</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 14,
  },
  footer: {
    marginTop: 48,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  versionText: {
    fontSize: 10,
    color: "#ccc",
  },
  setupContainer: {
    alignItems: "center",
    padding: 24,
  },
  setupIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  setupText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  biometricButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  biometricButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

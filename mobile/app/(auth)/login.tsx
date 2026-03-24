/**
 * MANTIS Mobile - Login Screen
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const announce = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      announce('Please enter both email and password.');
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      announce('Please enter a valid email address.');
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      announce('Password must be at least six characters.');
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    announce('Signing in. Please wait.');
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      if (error.includes('Invalid login credentials')) {
        announce('Login failed. Email or password is incorrect.');
        Alert.alert('Login Failed', 'Email or password is incorrect');
      } else if (error.includes('Email not confirmed')) {
        announce('Email not verified. Please verify your email before logging in.');
        Alert.alert('Email Not Verified', 'Please verify your email before logging in');
      } else {
        announce(error);
        Alert.alert('Login Failed', error);
      }
    }
  };

  const handlePasswordReset = async () => {
    if (resetLoading) return;

    if (!resetEmail) {
      announce('Please enter your email address.');
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(resetEmail)) {
      announce('Please enter a valid email address.');
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    announce('Sending password reset link. Please wait.');
    const { error } = await resetPassword(resetEmail);
    setResetLoading(false);

    if (error) {
      announce(error);
      Alert.alert('Error', error);
    } else {
      announce('Password reset email sent.');
      Alert.alert(
        'Password Reset',
        'Check your email for password reset instructions',
        [{
          text: 'OK',
          onPress: () => {
            setShowPasswordReset(false);
            setResetEmail('');
          },
        }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              MANTIS
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Multi-Agency National Traffic{'\n'}Infringement System
            </ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText type="subtitle" style={styles.formTitle}>
              Officer Login
            </ThemedText>

            {!showPasswordReset ? (
              <>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Email</ThemedText>
                  <TextInput
                    style={[styles.input, { color: colors.primaryForeground, borderColor: colors.icon }]}
                    placeholder="officer@example.com"
                    placeholderTextColor={colors.icon}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                    accessibilityLabel="Email address"
                    accessibilityHint="Enter your agency email"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Password</ThemedText>
                  <TextInput
                    style={[styles.input, { color: colors.primaryForeground, borderColor: colors.icon }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.icon}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                    accessibilityLabel="Password"
                    accessibilityHint="Enter your account password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.tint }]}
                  onPress={handleLogin}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel={loading ? 'Signing in' : 'Sign in'}
                  accessibilityState={{ disabled: loading, busy: loading }}
                >
                  <ThemedText style={styles.buttonText}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => setShowPasswordReset(true)}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                  accessibilityState={{ disabled: loading }}
                >
                  <ThemedText style={[styles.forgotPasswordText, { color: colors.tint }]}>
                    Forgot Password?
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Email Address</ThemedText>
                  <TextInput
                    style={[styles.input, { color: colors.primaryForeground, borderColor: colors.icon }]}
                    placeholder="officer@example.com"
                    placeholderTextColor={colors.icon}
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!resetLoading}
                    accessibilityLabel="Password reset email address"
                    returnKeyType="send"
                    onSubmitEditing={handlePasswordReset}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.tint }]}
                  onPress={handlePasswordReset}
                  disabled={resetLoading}
                  accessibilityRole="button"
                  accessibilityLabel={resetLoading ? 'Sending reset link' : 'Send password reset link'}
                  accessibilityState={{ disabled: resetLoading, busy: resetLoading }}
                >
                  <ThemedText style={styles.buttonText}>
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => {
                    setShowPasswordReset(false);
                    setResetEmail('');
                  }}
                  disabled={resetLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Back to login"
                  accessibilityState={{ disabled: resetLoading }}
                >
                  <ThemedText style={[styles.forgotPasswordText, { color: colors.tint }]}>
                    ← Back to Login
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.infoBox}>
              <ThemedText style={styles.infoText}>
                🔐 Use your agency-provided credentials
              </ThemedText>
              <ThemedText style={styles.infoText}>
                📱 Contact your team leader if you need access
              </ThemedText>
              <ThemedText style={styles.infoText}>
                🆘 Check your email for password reset instructions
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
});

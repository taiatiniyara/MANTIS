/**
 * MANTIS Mobile - Session Status Component
 * Shows session and verification status
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/supabase';

export function SessionStatus() {
  const { session } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (session?.user?.email_confirmed_at) {
      setShowWarning(false);
    } else if (session?.user?.email) {
      setShowWarning(true);
    }
  }, [session?.user?.email_confirmed_at]);

  const handleResendVerification = async () => {
    try {
      // Note: resendEncodedSignupLink is not available in all Supabase versions
      // Instead, we'll use the updateUser method to trigger a re-verification
      const { error } = await supabase.auth.updateUser({
        email: session?.user?.email || '',
      });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Verification Email Sent',
          'Check your email and click the confirmation link'
        );
      }
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  if (!showWarning) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: '#fff3cd', borderColor: '#856404' }]}>
      <View style={styles.content}>
        <ThemedText style={styles.warningText}>
          ⚠️ Email Not Verified
        </ThemedText>
        <ThemedText style={styles.descriptionText}>
          Please verify your email to access all features
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={handleResendVerification}
      >
        <ThemedText style={styles.buttonText}>Resend</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 12,
    color: '#856404',
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

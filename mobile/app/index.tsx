/**
 * MANTIS Mobile - Index/Splash Screen
 * 
 * Auth gate that redirects to appropriate screen based on auth state
 */

import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function IndexScreen() {
  const { session, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (session && user) {
        // Redirect based on role
        if (user.role === 'Team Leader' || user.role === 'Agency Admin') {
          router.replace('/(leader)/' as any);
        } else {
          router.replace('/(officer)/' as any);
        }
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [loading, router, session, user]);

  return (
    <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>MANTIS</ThemedText>
        <ThemedText style={styles.subtitle}>
          Multi-Agency National Traffic{'\n'}Infringement System
        </ThemedText>
        <ActivityIndicator size="large" style={styles.loader} />
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.7,
  },
  loader: {
    marginTop: 20,
  },
});

/**
 * MANTIS Mobile - Profile Screen
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { formatRole } from '@/lib/formatting';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.avatarText}>
              {user?.display_name?.charAt(0).toUpperCase() || 'O'}
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.name}>
            {user?.display_name || 'Officer'}
          </ThemedText>
          <ThemedText style={styles.role}>{formatRole(user?.role || '')}</ThemedText>
        </View>

        {/* Agency Info */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Agency Information
          </ThemedText>
          <View style={[styles.infoCard, { borderColor: colors.icon }]}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Agency</ThemedText>
              <ThemedText style={styles.infoValue}>
                {user?.agency?.name || 'N/A'}
              </ThemedText>
            </View>
            {user?.team && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Team</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {user.team.name}
                </ThemedText>
              </View>
            )}
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Role</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatRole(user?.role || '')}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          <TouchableOpacity
            style={[styles.menuItem, { borderColor: colors.icon }]}
            onPress={() => {
              // Navigate to settings
            }}
          >
            <ThemedText>⚙️ App Settings</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderColor: colors.icon }]}
            onPress={() => {
              // Navigate to help
            }}
          >
            <ThemedText>❓ Help & Support</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderColor: colors.icon }]}
            onPress={() => {
              // Navigate to about
            }}
          >
            <ThemedText>ℹ️ About MANTIS</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#f44336' }]}
          onPress={handleSignOut}
        >
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>

        {/* Version */}
        <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    marginBottom: 4,
  },
  role: {
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    opacity: 0.7,
  },
  infoValue: {
    fontWeight: '600',
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    opacity: 0.5,
    fontSize: 12,
    marginTop: 24,
  },
});

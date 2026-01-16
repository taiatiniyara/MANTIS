/**
 * MANTIS Mobile - Profile Screen
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { formatRole, formatCurrency, formatDate } from '@/lib/formatting';
import { getInfringements } from '@/lib/database';
import { Infringement } from '@/lib/types';
import { getSyncStats, syncPendingData, clearSyncQueue, clearAllDrafts, setOfflineMode as setOfflineModeStorage, isOfflineMode } from '@/lib/offline';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as LocalAuthentication from 'expo-local-authentication';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [stats, setStats] = useState<{
    total: number;
    draft: number;
    submitted: number;
    pending: number;
    approved: number;
    totalFines: number;
  }>({ total: 0, draft: 0, submitted: 0, pending: 0, approved: 0, totalFines: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncStats, setSyncStats] = useState({ draftCount: 0, queueCount: 0, lastSync: null as Date | null });
  const [syncing, setSyncing] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(15);

  useEffect(() => {
    loadStats();
    loadSyncStats();
    loadOfflineMode();
    checkBiometric();
  }, [user]);

  const checkBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setBiometricAvailable(compatible);
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const loadSyncStats = async () => {
    const stats = await getSyncStats();
    setSyncStats(stats);
  };

  const loadOfflineMode = async () => {
    const offline = await isOfflineMode();
    setOfflineMode(offline);
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const { data } = await getInfringements({
        officer_id: user.id,
        limit: 1000,
      });

      if (data) {
        const draft = data.filter(i => i.status === 'draft').length;
        const submitted = data.filter(i => i.status === 'submitted').length;
        const pending = data.filter(i => i.status === 'pending').length;
        const approved = data.filter(i => i.status === 'approved').length;
        const totalFines = data.reduce((sum, i) => sum + (i.fine_amount || 0), 0);

        setStats({
          total: data.length,
          draft,
          submitted,
          pending,
          approved,
          totalFines,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

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

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await syncPendingData();
      Alert.alert(
        'Sync Complete',
        `Successfully synced: ${result.success}\nFailed: ${result.failed}`,
        [{ text: 'OK', onPress: loadSyncStats }]
      );
    } catch (error) {
      Alert.alert('Sync Error', 'Failed to sync pending data');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearSyncQueue = () => {
    Alert.alert(
      'Clear Sync Queue',
      'Are you sure? This will delete all pending sync items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearSyncQueue();
            await loadSyncStats();
            Alert.alert('Success', 'Sync queue cleared');
          },
        },
      ]
    );
  };

  const handleClearDrafts = () => {
    Alert.alert(
      'Clear All Drafts',
      'Are you sure? This will delete all saved drafts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllDrafts();
            await loadSyncStats();
            Alert.alert('Success', 'All drafts cleared');
          },
        },
      ]
    );
  };

  const handleOfflineModeToggle = async (value: boolean) => {
    setOfflineMode(value);
    await setOfflineModeStorage(value);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      try {
        const compatible = await LocalAuthentication.isAvailableAsync();
        if (!compatible) {
          Alert.alert('Not Available', 'Biometric authentication is not available on this device');
          return;
        }
        setBiometricEnabled(true);
        Alert.alert('Biometric Enabled', 'You can now use biometric authentication to sign in');
      } catch (error) {
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    } else {
      setBiometricEnabled(false);
    }
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

        {/* Stats */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Performance Statistics
          </ThemedText>
          {loadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.tint} />
            </View>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
                  <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
                  <ThemedText style={styles.statLabel}>Total Cases</ThemedText>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#9E9E9E20', borderColor: '#9E9E9E' }]}>
                  <ThemedText style={styles.statValue}>{stats.draft}</ThemedText>
                  <ThemedText style={styles.statLabel}>Drafts</ThemedText>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#2196F320', borderColor: '#2196F3' }]}>
                  <ThemedText style={styles.statValue}>{stats.submitted}</ThemedText>
                  <ThemedText style={styles.statLabel}>Submitted</ThemedText>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FF980020', borderColor: '#FF9800' }]}>
                  <ThemedText style={styles.statValue}>{stats.pending}</ThemedText>
                  <ThemedText style={styles.statLabel}>Pending</ThemedText>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#4CAF5020', borderColor: '#4CAF50' }]}>
                  <ThemedText style={styles.statValue}>{stats.approved}</ThemedText>
                  <ThemedText style={styles.statLabel}>Approved</ThemedText>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
                  <ThemedText style={styles.statValue}>{formatCurrency(stats.totalFines)}</ThemedText>
                  <ThemedText style={styles.statLabel}>Total Fines</ThemedText>
                </View>
              </View>
            </>
          )}
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

        {/* Sync & Data Management */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Sync & Data
          </ThemedText>
          <View style={[styles.infoCard, { borderColor: colors.icon }]}>
            <View style={styles.syncInfoRow}>
              <ThemedText style={styles.syncLabel}>Pending Sync:</ThemedText>
              <ThemedText style={styles.syncValue}>{syncStats.queueCount} items</ThemedText>
            </View>
            <View style={styles.syncInfoRow}>
              <ThemedText style={styles.syncLabel}>Saved Drafts:</ThemedText>
              <ThemedText style={styles.syncValue}>{syncStats.draftCount} drafts</ThemedText>
            </View>
            {syncStats.lastSync && (
              <View style={styles.syncInfoRow}>
                <ThemedText style={styles.syncLabel}>Last Sync:</ThemedText>
                <ThemedText style={styles.syncValue}>
                  {formatDate(syncStats.lastSync, 'short')}
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.syncButtons}>
            <TouchableOpacity
              style={[styles.syncActionButton, { backgroundColor: colors.tint }]}
              onPress={handleManualSync}
              disabled={syncing || syncStats.queueCount === 0}
            >
              {syncing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.syncActionText}>
                  🔄 Sync Now
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          {syncStats.queueCount > 0 && (
            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: '#f44336' }]}
              onPress={handleClearSyncQueue}
            >
              <ThemedText style={[styles.dangerButtonText, { color: '#f44336' }]}>
                Clear Sync Queue
              </ThemedText>
            </TouchableOpacity>
          )}

          {syncStats.draftCount > 0 && (
            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: '#f44336' }]}
              onPress={handleClearDrafts}
            >
              <ThemedText style={[styles.dangerButtonText, { color: '#f44336' }]}>
                Clear All Drafts
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Preferences
          </ThemedText>
          <View style={[styles.infoCard, { borderColor: colors.icon }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>🔔 Notifications</ThemedText>
                <ThemedText style={styles.settingDescription}>Receive case updates</ThemedText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: colors.tint }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>📴 Offline Mode</ThemedText>
                <ThemedText style={styles.settingDescription}>Work without internet</ThemedText>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={handleOfflineModeToggle}
                trackColor={{ false: '#767577', true: colors.tint }}
                thumbColor={offlineMode ? '#fff' : '#f4f3f4'}
              />
            </View>
            {biometricAvailable && (
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>👆 Biometric Login</ThemedText>
                  <ThemedText style={styles.settingDescription}>Use fingerprint or face ID</ThemedText>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: '#767577', true: colors.tint }}
                  thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            )}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>⏱️ Session Timeout</ThemedText>
                <ThemedText style={styles.settingDescription}>{sessionTimeout} minutes of inactivity</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* More Options */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            More
          </ThemedText>
          <TouchableOpacity
            style={[styles.menuItem, { borderColor: colors.icon }]}
            onPress={() => {
              Alert.alert('Help & Support', 'Contact: support@mantis.app\nPhone: +1-800-MANTIS');
            }}
          >
            <View style={styles.menuItemContent}>
              <ThemedText>❓ Help & Support</ThemedText>
              <ThemedText style={styles.menuArrow}>›</ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, { borderColor: colors.icon }]}
            onPress={() => {
              Alert.alert(
                'About MANTIS',
                'Mobile Application for Network Traffic Infringement System\n\nVersion 1.0.0\n\n© 2026 MANTIS Team'
              );
            }}
          >
            <View style={styles.menuItemContent}>
              <ThemedText>ℹ️ About MANTIS</ThemedText>
              <ThemedText style={styles.menuArrow}>›</ThemedText>
            </View>
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuArrow: {
    fontSize: 24,
    opacity: 0.5,
  },
  syncInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  syncLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  syncValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  syncButtons: {
    marginTop: 12,
  },
  syncActionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  syncActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
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

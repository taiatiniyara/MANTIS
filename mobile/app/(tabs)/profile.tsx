/**
 * Profile Screen
 * Officer profile, statistics, and settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncManager } from '@/lib/sync-manager';
import {
  isBiometricEnabled,
  setBiometricEnabled,
  checkBiometricAvailability,
  setupBiometricLogin,
  clearBiometricData,
  getBiometricTypeName,
} from '@/lib/biometric-auth';

interface Stats {
  today: number;
  week: number;
  month: number;
  total: number;
}

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({ today: 0, week: 0, month: 0, total: 0 });
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadStats(),
      checkBiometric(),
    ]);
    setLoading(false);
  };

  const loadStats = async () => {
    if (!profile?.id) return;

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Today's count
      const { count: todayCount } = await supabase
        .from('infringements')
        .select('*', { count: 'exact', head: true })
        .eq('recorded_by', profile.id)
        .gte('recorded_at', startOfDay.toISOString());

      // This week
      const { count: weekCount } = await supabase
        .from('infringements')
        .select('*', { count: 'exact', head: true })
        .eq('recorded_by', profile.id)
        .gte('recorded_at', startOfWeek.toISOString());

      // This month
      const { count: monthCount } = await supabase
        .from('infringements')
        .select('*', { count: 'exact', head: true })
        .eq('recorded_by', profile.id)
        .gte('recorded_at', startOfMonth.toISOString());

      // Total
      const { count: totalCount } = await supabase
        .from('infringements')
        .select('*', { count: 'exact', head: true })
        .eq('recorded_by', profile.id);

      setStats({
        today: todayCount || 0,
        week: weekCount || 0,
        month: monthCount || 0,
        total: totalCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkBiometric = async () => {
    const config = await checkBiometricAvailability();
    setBiometricAvailable(config.isAvailable);
    if (config.isAvailable) {
      setBiometricType(getBiometricTypeName(config.supportedTypes));
      const enabled = await isBiometricEnabled();
      setBiometricEnabledState(enabled);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Enable biometric
      if (!profile?.email) {
        Alert.alert('Error', 'Email not found');
        return;
      }

      const result = await setupBiometricLogin(profile.email);
      if (result.success) {
        setBiometricEnabledState(true);
        Alert.alert('Success', `${biometricType} login enabled!`);
      } else {
        Alert.alert('Error', result.error || 'Failed to enable biometric login');
      }
    } else {
      // Disable biometric
      Alert.alert(
        'Disable Biometric',
        `Are you sure you want to disable ${biometricType} login?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await setBiometricEnabled(false);
              setBiometricEnabledState(false);
              Alert.alert('Disabled', `${biometricType} login has been disabled`);
            },
          },
        ]
      );
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    
    const result = await syncManager.syncAll();
    setSyncing(false);

    if (result.success) {
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${result.synced} items.\n${result.failed > 0 ? `Failed: ${result.failed}` : ''}`
      );
      // Refresh stats
      await loadStats();
    } else {
      const errorMessage = result.errors?.length 
        ? result.errors.join('\n') 
        : 'Could not sync data';
      Alert.alert('Sync Failed', errorMessage);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all offline data. Make sure you have synced first!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all async storage keys except auth
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(key => 
                key.includes('infringements_queue') || 
                key.includes('photos_queue') ||
                key.includes('gps_queue')
              );
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            // Clear biometric data if enabled
            if (biometricEnabled) {
              await clearBiometricData();
            }
            await signOut();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#007AFF" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'O'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Officer'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <Text style={styles.position}>{profile?.position || 'Field Officer'}</Text>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.today}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.week}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.month}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        {/* Biometric Toggle */}
        {biometricAvailable && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{biometricType} Login</Text>
              <Text style={styles.settingDescription}>
                Sign in with {biometricType} instead of password
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        )}

        {/* Manual Sync */}
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={handleManualSync}
          disabled={syncing}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sync Data</Text>
            <Text style={styles.settingDescription}>
              Upload pending infringements and photos
            </Text>
          </View>
          {syncing ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.settingChevron}>›</Text>
          )}
        </TouchableOpacity>

        {/* Clear Cache */}
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={handleClearCache}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Clear Cache</Text>
            <Text style={styles.settingDescription}>
              Remove offline data (sync first!)
            </Text>
          </View>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>Sprint 4</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>React Native + Expo</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>MANTIS Mobile v1.0.0</Text>
        <Text style={styles.footerText}>© 2025 • For Officer Use Only</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  position: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  settingChevron: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  signOutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
});

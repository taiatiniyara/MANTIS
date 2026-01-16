/**
 * MANTIS Mobile - Sync Status Component
 * 
 * Displays sync status and allows manual sync trigger
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import {
  syncPendingData,
  getSyncStats,
  shouldAutoSync,
  getLastSyncTime,
} from '@/lib/offline';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/lib/formatting';
import * as Network from 'expo-network';

interface SyncStatusProps {
  autoSync?: boolean;
}

export function SyncStatus({ autoSync = false }: SyncStatusProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({
    draftCount: 0,
    queueCount: 0,
    lastSync: null as Date | null,
  });

  useEffect(() => {
    loadStats();
    checkNetworkStatus();
    
    // Auto-sync check
    if (autoSync) {
      checkAutoSync();
    }

    // Refresh stats and network every 30 seconds
    const interval = setInterval(() => {
      loadStats();
      checkNetworkStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSync]);

  const loadStats = async () => {
    const syncStats = await getSyncStats();
    setStats(syncStats);
  };

  const checkNetworkStatus = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      setIsOnline(networkState.isConnected ?? false);
    } catch (error) {
      console.error('Error checking network:', error);
      setIsOnline(false);
    }
  };

  const checkAutoSync = async () => {
    const should = await shouldAutoSync();
    if (should) {
      handleSync();
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('No Connection', 'Please check your internet connection and try again.');
      return;
    }

    setSyncing(true);
    try {
      const result = await syncPendingData();
      
      if (result.success > 0 || result.failed > 0) {
        Alert.alert(
          'Sync Complete',
          `Synced: ${result.success}\nFailed: ${result.failed}`,
          [{ text: 'OK', onPress: loadStats }]
        );
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Error', 'Failed to sync pending data');
    } finally {
      setSyncing(false);
      loadStats();
    }
  };

  if (stats.queueCount === 0 && stats.draftCount === 0) {
    return null; // Don't show if nothing to sync
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.tint + '20' }]}>
      <View style={styles.info}>
        {!isOnline && (
          <ThemedText style={styles.offlineText}>🔴 Offline Mode</ThemedText>
        )}
        {stats.draftCount > 0 && (
          <ThemedText style={styles.stat}>
            📝 {stats.draftCount} draft{stats.draftCount !== 1 ? 's' : ''}
          </ThemedText>
        )}
        {stats.queueCount > 0 && (
          <ThemedText style={[styles.stat, !isOnline && styles.pendingOffline]}>
            ⏳ {stats.queueCount} pending sync
          </ThemedText>
        )}
        {stats.lastSync && (
          <ThemedText style={styles.lastSync}>
            Last: {formatDate(stats.lastSync, 'short')}
          </ThemedText>
        )}
      </View>

      {stats.queueCount > 0 && (
        <TouchableOpacity
          style={[
            styles.syncButton,
            { backgroundColor: isOnline ? colors.tint : '#9E9E9E' },
          ]}
          onPress={handleSync}
          disabled={syncing || !isOnline}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.syncButtonText}>Sync</ThemedText>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  stat: {
    fontSize: 14,
    fontWeight: '600',
  },
  offlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
  },
  pendingOffline: {
    opacity: 0.6,
  },
  lastSync: {
    fontSize: 12,
    opacity: 0.7,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

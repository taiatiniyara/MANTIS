import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getSyncQueue,
  syncPendingInfringements,
  retrySyncItem,
  clearSyncedItems,
  getSyncQueueStats,
  setupAutoSync,
  getLastSyncStatus,
  type QueuedInfringement,
  type SyncQueueStats,
} from '@/lib/api/sync-queue';

export default function SyncQueueScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [queue, setQueue] = useState<QueuedInfringement[]>([]);
  const [stats, setStats] = useState<SyncQueueStats>({
    total: 0,
    pending: 0,
    syncing: 0,
    synced: 0,
    failed: 0,
  });
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load queue data
  const loadQueue = async () => {
    try {
      const [queueData, statsData, lastSyncData] = await Promise.all([
        getSyncQueue(),
        getSyncQueueStats(),
        getLastSyncStatus(),
      ]);
      
      setQueue(queueData);
      setStats(statsData);
      setLastSync(lastSyncData?.last_sync || null);
    } catch (error: any) {
      console.error('Error loading sync queue:', error);
      Alert.alert('Error', 'Failed to load sync queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and reload on focus
  useEffect(() => {
    loadQueue();
    
    // Setup auto-sync listener
    const unsubscribe = setupAutoSync(() => {
      loadQueue(); // Reload queue when sync completes
    });

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQueue();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadQueue();
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      
      const results = await syncPendingInfringements();
      
      if (results.success > 0 || results.failed > 0) {
        Alert.alert(
          'Sync Complete',
          `Synced: ${results.success}\nFailed: ${results.failed}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Info', 'No pending infringements to sync', [{ text: 'OK' }]);
      }
      
      await loadQueue();
    } catch (error: any) {
      Alert.alert('Sync Error', error.message || 'Failed to sync infringements');
    } finally {
      setSyncing(false);
    }
  };

  const handleRetryItem = async (localId: string) => {
    try {
      await retrySyncItem(localId);
      Alert.alert('Success', 'Infringement synced successfully', [{ text: 'OK' }]);
      await loadQueue();
    } catch (error: any) {
      Alert.alert('Retry Failed', error.message || 'Failed to retry sync');
    }
  };

  const handleClearSynced = async () => {
    Alert.alert(
      'Clear Synced Items',
      'Remove all successfully synced infringements from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const count = await clearSyncedItems();
              Alert.alert('Success', `Cleared ${count} synced item(s)`, [{ text: 'OK' }]);
              await loadQueue();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to clear synced items');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'syncing':
        return '#F97316';
      case 'synced':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'syncing':
        return 'arrow.clockwise';
      case 'synced':
        return 'checkmark.circle';
      case 'failed':
        return 'exclamationmark.triangle';
      default:
        return 'questionmark.circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderQueueItem = ({ item }: { item: QueuedInfringement }) => (
    <View style={styles.queueItem}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.regNumber}>{item.vehicle_reg_number}</Text>
          <Text style={styles.createdAt}>{formatDate(item.created_at)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.sync_status) + '20' },
          ]}>
          <IconSymbol
            name={getStatusIcon(item.sync_status)}
            size={16}
            color={getStatusColor(item.sync_status)}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.sync_status) }]}>
            {item.sync_status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.location} numberOfLines={1}>
          📍 {item.location_description}
        </Text>
        {item.photos.length > 0 && (
          <Text style={styles.photoCount}>📷 {item.photos.length} photo(s)</Text>
        )}
        {item.sync_attempts > 0 && (
          <Text style={styles.attempts}>
            Attempts: {item.sync_attempts}
          </Text>
        )}
      </View>

      {item.sync_error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} numberOfLines={2}>
            ⚠️ {item.sync_error}
          </Text>
        </View>
      )}

      {(item.sync_status === 'failed' || item.sync_status === 'pending') && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => handleRetryItem(item.id)}>
          <IconSymbol name="arrow.clockwise" size={16} color="#F97316" />
          <Text style={styles.retryButtonText}>Retry Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading sync queue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sync Queue</Text>
        <Text style={styles.subtitle}>Manage offline infringements</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderColor: '#f59e0b' }]}>
          <IconSymbol name="clock" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#10b981' }]}>
          <IconSymbol name="checkmark.circle" size={24} color="#10b981" />
          <Text style={styles.statValue}>{stats.synced}</Text>
          <Text style={styles.statLabel}>Synced</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#ef4444' }]}>
          <IconSymbol name="exclamationmark.triangle" size={24} color="#ef4444" />
          <Text style={styles.statValue}>{stats.failed}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>

      {/* Last Sync Info */}
      {lastSync && (
        <View style={styles.lastSyncContainer}>
          <IconSymbol name="clock" size={16} color="#64748b" />
          <Text style={styles.lastSyncText}>
            Last sync: {formatDate(lastSync)}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.syncButton]}
          onPress={handleSyncAll}
          disabled={syncing || stats.pending === 0}>
          {syncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <IconSymbol name="arrow.clockwise" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Sync All</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClearSynced}
          disabled={stats.synced === 0}>
          <IconSymbol name="trash" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Clear Synced</Text>
        </TouchableOpacity>
      </View>

      {/* Queue List */}
      {queue.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="checkmark.circle" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>
            No pending infringements in the sync queue
          </Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={renderQueueItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  lastSyncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  lastSyncText: {
    fontSize: 13,
    color: '#64748b',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  syncButton: {
    backgroundColor: '#F97316',
  },
  clearButton: {
    backgroundColor: '#64748b',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  queueItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  regNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemDetails: {
    gap: 6,
  },
  location: {
    fontSize: 14,
    color: '#475569',
  },
  photoCount: {
    fontSize: 13,
    color: '#64748b',
  },
  attempts: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    padding: 12,
    marginTop: 12,
    borderRadius: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#991b1b',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

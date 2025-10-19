import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface SyncQueue {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

const SYNC_QUEUE_KEY = '@mantis_sync_queue';
const OFFLINE_DATA_KEY = '@mantis_offline_data';
const MAX_RETRY_COUNT = 3;

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      
      // Auto-sync when coming back online
      if (state.isConnected) {
        syncPendingChanges();
      }
    });

    loadPendingCount();

    return () => unsubscribe();
  }, []);

  const loadPendingCount = async () => {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncQueue[] = queueJson ? JSON.parse(queueJson) : [];
      setPendingCount(queue.length);
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  };

  const addToSyncQueue = async (
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ) => {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncQueue[] = queueJson ? JSON.parse(queueJson) : [];

      const syncItem: SyncQueue = {
        id: `${Date.now()}_${Math.random().toString(36)}`,
        type,
        table,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(syncItem);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setPendingCount(queue.length);

      // Try to sync immediately if online
      if (isOnline) {
        syncPendingChanges();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  };

  const syncPendingChanges = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);

    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncQueue[] = queueJson ? JSON.parse(queueJson) : [];

      if (queue.length === 0) {
        setIsSyncing(false);
        return;
      }

      const successfulIds: string[] = [];
      const failedItems: SyncQueue[] = [];

      for (const item of queue) {
        try {
          // Call the API to sync the data
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: item.type,
              table: item.table,
              data: item.data,
            }),
          });

          if (response.ok) {
            successfulIds.push(item.id);
          } else {
            throw new Error('Sync failed');
          }
        } catch (error) {
          console.error('Error syncing item:', error);
          
          // Increment retry count
          item.retryCount++;
          
          // Keep in queue if under max retry count
          if (item.retryCount < MAX_RETRY_COUNT) {
            failedItems.push(item);
          } else {
            console.warn('Max retry count reached for item:', item.id);
          }
        }
      }

      // Update queue with failed items only
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedItems));
      setPendingCount(failedItems.length);
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveOfflineData = async (key: string, data: any) => {
    try {
      const offlineDataJson = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      const offlineData = offlineDataJson ? JSON.parse(offlineDataJson) : {};
      
      offlineData[key] = {
        data,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
    } catch (error) {
      console.error('Error saving offline data:', error);
      throw error;
    }
  };

  const loadOfflineData = async (key: string) => {
    try {
      const offlineDataJson = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      const offlineData = offlineDataJson ? JSON.parse(offlineDataJson) : {};
      
      return offlineData[key]?.data || null;
    } catch (error) {
      console.error('Error loading offline data:', error);
      return null;
    }
  };

  const clearOfflineData = async (key?: string) => {
    try {
      if (key) {
        const offlineDataJson = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
        const offlineData = offlineDataJson ? JSON.parse(offlineDataJson) : {};
        delete offlineData[key];
        await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
      } else {
        await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
      }
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  };

  return {
    isOnline,
    isSyncing,
    pendingCount,
    addToSyncQueue,
    syncPendingChanges,
    saveOfflineData,
    loadOfflineData,
    clearOfflineData,
  };
}

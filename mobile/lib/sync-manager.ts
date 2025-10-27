/**
 * Offline Sync Manager
 * 
 * Manages synchronization of offline data (infringements, GPS, photos)
 * when the device comes back online.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { infringements, gpsTracking, storage } from './supabase';
import * as FileSystem from 'expo-file-system';

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

class SyncManager {
  private isSyncing = false;
  private syncListeners: Array<(progress: SyncProgress) => void> = [];

  constructor() {
    // Listen for network changes
    NetInfo.addEventListener((state) => {
      if (state.isConnected && !this.isSyncing) {
        this.autoSync();
      }
    });
  }

  /**
   * Add listener for sync progress updates
   */
  onSyncProgress(callback: (progress: SyncProgress) => void) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all listeners of sync progress
   */
  private notifyProgress(progress: SyncProgress) {
    this.syncListeners.forEach((callback) => callback(progress));
  }

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  /**
   * Get count of items waiting to sync
   */
  async getPendingCount(): Promise<{
    infringements: number;
    gpsPoints: number;
    photos: number;
  }> {
    try {
      const [infringementsData, gpsData, photosData] = await Promise.all([
        AsyncStorage.getItem('offline_infringements'),
        AsyncStorage.getItem('offline_gps_queue'),
        AsyncStorage.getItem('offline_photos'),
      ]);

      return {
        infringements: infringementsData ? JSON.parse(infringementsData).length : 0,
        gpsPoints: gpsData ? JSON.parse(gpsData).length : 0,
        photos: photosData ? JSON.parse(photosData).length : 0,
      };
    } catch (error) {
      console.error('Error getting pending count:', error);
      return { infringements: 0, gpsPoints: 0, photos: 0 };
    }
  }

  /**
   * Automatically sync when coming online
   */
  private async autoSync() {
    const pending = await this.getPendingCount();
    const total = pending.infringements + pending.gpsPoints + pending.photos;

    if (total > 0) {
      console.log(`Auto-sync triggered: ${total} items pending`);
      await this.syncAll();
    }
  }

  /**
   * Manually trigger a full sync
   */
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Sync already in progress'],
      };
    }

    const online = await this.isOnline();
    if (!online) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Device is offline'],
      };
    }

    this.isSyncing = true;
    let totalSynced = 0;
    let totalFailed = 0;
    const errors: string[] = [];

    try {
      // Sync infringements first
      const infringementResult = await this.syncInfringements();
      totalSynced += infringementResult.synced;
      totalFailed += infringementResult.failed;
      errors.push(...infringementResult.errors);

      // Sync GPS points
      const gpsResult = await this.syncGPSPoints();
      totalSynced += gpsResult.synced;
      totalFailed += gpsResult.failed;
      errors.push(...gpsResult.errors);

      // Sync photos last (they depend on infringements)
      const photoResult = await this.syncPhotos();
      totalSynced += photoResult.synced;
      totalFailed += photoResult.failed;
      errors.push(...photoResult.errors);

      return {
        success: totalFailed === 0,
        synced: totalSynced,
        failed: totalFailed,
        errors,
      };
    } catch (error: any) {
      console.error('Sync error:', error);
      return {
        success: false,
        synced: totalSynced,
        failed: totalFailed + 1,
        errors: [...errors, error.message || 'Unknown error'],
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync offline infringements
   */
  private async syncInfringements(): Promise<SyncResult> {
    try {
      const queueData = await AsyncStorage.getItem('offline_infringements');
      if (!queueData) {
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      const queue = JSON.parse(queueData);
      if (queue.length === 0) {
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      console.log(`Syncing ${queue.length} infringements...`);
      const results: Array<{ success: boolean; item: any; data?: any }> = [];
      const errors: string[] = [];

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];

        this.notifyProgress({
          total: queue.length,
          completed: i,
          failed: errors.length,
          current: `Syncing infringement ${item.vehicle_id}`,
        });

        try {
          // Remove offline-only fields before syncing
          const { offline, ...dataToSync } = item;
          
          const { data, error } = await infringements.create(dataToSync);
          if (error) throw error;

          results.push({ success: true, item, data });
        } catch (error: any) {
          console.error('Failed to sync infringement:', error);
          results.push({ success: false, item });
          errors.push(`Infringement ${item.vehicle_id}: ${error.message}`);
        }
      }

      // Remove successfully synced items
      const remaining = queue.filter((item: any, index: number) => !results[index].success);

      if (remaining.length > 0) {
        await AsyncStorage.setItem('offline_infringements', JSON.stringify(remaining));
      } else {
        await AsyncStorage.removeItem('offline_infringements');
      }

      const synced = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      this.notifyProgress({
        total: queue.length,
        completed: synced,
        failed,
        current: 'Infringements synced',
      });

      return { success: failed === 0, synced, failed, errors };
    } catch (error: any) {
      console.error('Error syncing infringements:', error);
      return {
        success: false,
        synced: 0,
        failed: 1,
        errors: [error.message || 'Failed to sync infringements'],
      };
    }
  }

  /**
   * Sync offline GPS points
   */
  private async syncGPSPoints(): Promise<SyncResult> {
    try {
      const queueData = await AsyncStorage.getItem('offline_gps_queue');
      if (!queueData) {
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      const queue = JSON.parse(queueData);
      if (queue.length === 0) {
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      console.log(`Syncing ${queue.length} GPS points...`);
      const results: Array<{ success: boolean; item: any }> = [];
      const errors: string[] = [];

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];

        this.notifyProgress({
          total: queue.length,
          completed: i,
          failed: errors.length,
          current: `Syncing GPS point ${i + 1}/${queue.length}`,
        });

        try {
          const { error } = await gpsTracking.track(item);
          if (error) throw error;

          results.push({ success: true, item });
        } catch (error: any) {
          console.error('Failed to sync GPS point:', error);
          results.push({ success: false, item });
          errors.push(`GPS point: ${error.message}`);
        }
      }

      // Remove successfully synced items
      const remaining = queue.filter((item: any, index: number) => !results[index].success);

      if (remaining.length > 0) {
        await AsyncStorage.setItem('offline_gps_queue', JSON.stringify(remaining));
      } else {
        await AsyncStorage.removeItem('offline_gps_queue');
      }

      const synced = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      this.notifyProgress({
        total: queue.length,
        completed: synced,
        failed,
        current: 'GPS points synced',
      });

      return { success: failed === 0, synced, failed, errors };
    } catch (error: any) {
      console.error('Error syncing GPS points:', error);
      return {
        success: false,
        synced: 0,
        failed: 1,
        errors: [error.message || 'Failed to sync GPS points'],
      };
    }
  }

  /**
   * Sync offline photos
   */
  private async syncPhotos(): Promise<SyncResult> {
    try {
      const queueData = await AsyncStorage.getItem('offline_photos');
      if (!queueData) {
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      const queue = JSON.parse(queueData);
      if (queue.length === 0) {
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      console.log(`Syncing ${queue.length} photos...`);
      const results: Array<{ success: boolean; item: any }> = [];
      const errors: string[] = [];

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];

        this.notifyProgress({
          total: queue.length,
          completed: i,
          failed: errors.length,
          current: `Uploading photo ${i + 1}/${queue.length}`,
        });

        try {
          // Check if file still exists
          const fileInfo = await FileSystem.getInfoAsync(item.uri);
          if (!fileInfo.exists) {
            throw new Error('File not found');
          }

          // Read file as base64
          const base64 = await FileSystem.readAsStringAsync(item.uri, {
            encoding: 'base64',
          });

          // Upload to storage
          const fileName = `${item.infringementId}_${Date.now()}_${i}.jpg`;
          const { error } = await storage.uploadPhoto(fileName, base64);

          if (error) throw error;

          results.push({ success: true, item });
        } catch (error: any) {
          console.error('Failed to sync photo:', error);
          results.push({ success: false, item });
          errors.push(`Photo ${i + 1}: ${error.message}`);
        }
      }

      // Remove successfully synced items
      const remaining = queue.filter((item: any, index: number) => !results[index].success);

      if (remaining.length > 0) {
        await AsyncStorage.setItem('offline_photos', JSON.stringify(remaining));
      } else {
        await AsyncStorage.removeItem('offline_photos');
      }

      const synced = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      this.notifyProgress({
        total: queue.length,
        completed: synced,
        failed,
        current: 'Photos synced',
      });

      return { success: failed === 0, synced, failed, errors };
    } catch (error: any) {
      console.error('Error syncing photos:', error);
      return {
        success: false,
        synced: 0,
        failed: 1,
        errors: [error.message || 'Failed to sync photos'],
      };
    }
  }

  /**
   * Clear all offline queues (use with caution!)
   */
  async clearAllQueues(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem('offline_infringements'),
        AsyncStorage.removeItem('offline_gps_queue'),
        AsyncStorage.removeItem('offline_photos'),
      ]);
      console.log('All offline queues cleared');
    } catch (error) {
      console.error('Error clearing queues:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
    };
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Export class for testing
export default SyncManager;

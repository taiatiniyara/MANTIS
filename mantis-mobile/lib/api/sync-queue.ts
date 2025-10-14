import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createInfringement, uploadEvidencePhotos } from './infringements';
import { CapturedPhoto } from '@/components/camera-screen';

/**
 * Offline Sync Manager
 * Handles offline infringement creation and background sync
 */

const QUEUE_KEY = '@mantis_sync_queue';
const SYNC_STATUS_KEY = '@mantis_sync_status';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface QueuedInfringement {
  id: string; // Local ID (UUID)
  vehicle_reg_number: string;
  offence_id: string;
  driver_licence_number?: string;
  location_description: string;
  notes?: string;
  photos: CapturedPhoto[];
  gps_coordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  created_at: string; // ISO timestamp
  sync_status: SyncStatus;
  sync_attempts: number;
  last_sync_attempt?: string;
  sync_error?: string;
  synced_infringement_id?: string; // Remote ID after successful sync
}

export interface SyncQueueStats {
  total: number;
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
}

/**
 * Get all queued infringements
 */
export async function getSyncQueue(): Promise<QueuedInfringement[]> {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
    if (!queueJson) return [];
    return JSON.parse(queueJson);
  } catch (error) {
    console.error('Error reading sync queue:', error);
    return [];
  }
}

/**
 * Add infringement to sync queue (offline creation)
 */
export async function addToSyncQueue(
  infringement: Omit<QueuedInfringement, 'id' | 'created_at' | 'sync_status' | 'sync_attempts'>
): Promise<string> {
  try {
    const queue = await getSyncQueue();
    
    const queuedItem: QueuedInfringement = {
      ...infringement,
      id: generateLocalId(),
      created_at: new Date().toISOString(),
      sync_status: 'pending',
      sync_attempts: 0,
    };

    queue.push(queuedItem);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    // Try to sync immediately if online
    tryBackgroundSync();

    return queuedItem.id;
  } catch (error: any) {
    console.error('Error adding to sync queue:', error);
    throw new Error(`Failed to save offline: ${error.message}`);
  }
}

/**
 * Update queued infringement status
 */
async function updateQueueItem(
  localId: string,
  updates: Partial<QueuedInfringement>
): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const index = queue.findIndex((item) => item.id === localId);
    
    if (index === -1) {
      throw new Error('Queue item not found');
    }

    queue[index] = { ...queue[index], ...updates };
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error: any) {
    console.error('Error updating queue item:', error);
    throw error;
  }
}

/**
 * Remove infringement from sync queue
 */
export async function removeFromSyncQueue(localId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const filtered = queue.filter((item) => item.id !== localId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (error: any) {
    console.error('Error removing from sync queue:', error);
    throw error;
  }
}

/**
 * Sync a single queued infringement
 */
async function syncSingleItem(item: QueuedInfringement): Promise<void> {
  try {
    // Update status to syncing
    await updateQueueItem(item.id, {
      sync_status: 'syncing',
      last_sync_attempt: new Date().toISOString(),
      sync_attempts: item.sync_attempts + 1,
    });

    // Create the infringement on the server
    const infringement = await createInfringement({
      vehicle_reg_number: item.vehicle_reg_number,
      offence_id: item.offence_id,
      driver_licence_number: item.driver_licence_number,
      location_description: item.location_description,
      notes: item.notes,
    });

    // Upload photos if any
    if (item.photos.length > 0) {
      try {
        await uploadEvidencePhotos(infringement.id, item.photos);
      } catch (photoError: any) {
        console.warn('Photo upload failed during sync:', photoError);
        // Continue - infringement is synced even if photos fail
      }
    }

    // Mark as synced
    await updateQueueItem(item.id, {
      sync_status: 'synced',
      synced_infringement_id: infringement.id,
      sync_error: undefined,
    });
  } catch (error: any) {
    console.error('Error syncing item:', error);
    
    // Mark as failed
    await updateQueueItem(item.id, {
      sync_status: 'failed',
      sync_error: error.message || 'Unknown error',
    });

    throw error;
  }
}

/**
 * Sync all pending infringements
 */
export async function syncPendingInfringements(): Promise<{
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ id: string; error: string }>,
  };

  try {
    // Check network status
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No network connection');
    }

    const queue = await getSyncQueue();
    const pendingItems = queue.filter(
      (item) => item.sync_status === 'pending' || item.sync_status === 'failed'
    );

    if (pendingItems.length === 0) {
      return results;
    }

    // Sync each item sequentially
    for (const item of pendingItems) {
      try {
        await syncSingleItem(item);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          id: item.id,
          error: error.message || 'Unknown error',
        });
      }
    }

    // Save sync status
    await AsyncStorage.setItem(
      SYNC_STATUS_KEY,
      JSON.stringify({
        last_sync: new Date().toISOString(),
        success: results.success,
        failed: results.failed,
      })
    );

    return results;
  } catch (error: any) {
    console.error('Error syncing pending infringements:', error);
    throw error;
  }
}

/**
 * Try to sync in background (fire and forget)
 */
export function tryBackgroundSync(): void {
  syncPendingInfringements().catch((error) => {
    console.log('Background sync skipped or failed:', error.message);
  });
}

/**
 * Get sync queue statistics
 */
export async function getSyncQueueStats(): Promise<SyncQueueStats> {
  try {
    const queue = await getSyncQueue();
    
    return {
      total: queue.length,
      pending: queue.filter((item) => item.sync_status === 'pending').length,
      syncing: queue.filter((item) => item.sync_status === 'syncing').length,
      synced: queue.filter((item) => item.sync_status === 'synced').length,
      failed: queue.filter((item) => item.sync_status === 'failed').length,
    };
  } catch (error) {
    console.error('Error getting sync stats:', error);
    return { total: 0, pending: 0, syncing: 0, synced: 0, failed: 0 };
  }
}

/**
 * Clear synced items from queue (cleanup)
 */
export async function clearSyncedItems(): Promise<number> {
  try {
    const queue = await getSyncQueue();
    const unsynced = queue.filter((item) => item.sync_status !== 'synced');
    const removedCount = queue.length - unsynced.length;
    
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(unsynced));
    return removedCount;
  } catch (error) {
    console.error('Error clearing synced items:', error);
    return 0;
  }
}

/**
 * Retry failed sync for a specific item
 */
export async function retrySyncItem(localId: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const item = queue.find((i) => i.id === localId);
    
    if (!item) {
      throw new Error('Item not found in queue');
    }

    if (item.sync_status !== 'failed' && item.sync_status !== 'pending') {
      throw new Error('Item is not in failed or pending state');
    }

    // Check network
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No network connection');
    }

    await syncSingleItem(item);
  } catch (error: any) {
    console.error('Error retrying sync:', error);
    throw error;
  }
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
}

/**
 * Get last sync status
 */
export async function getLastSyncStatus(): Promise<{
  last_sync?: string;
  success?: number;
  failed?: number;
} | null> {
  try {
    const statusJson = await AsyncStorage.getItem(SYNC_STATUS_KEY);
    if (!statusJson) return null;
    return JSON.parse(statusJson);
  } catch (error) {
    console.error('Error getting sync status:', error);
    return null;
  }
}

/**
 * Generate a local UUID-like ID
 */
function generateLocalId(): string {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Setup network listener for auto-sync
 */
export function setupAutoSync(callback?: () => void): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      console.log('Network connected - attempting auto-sync');
      tryBackgroundSync();
      callback?.();
    }
  });

  // Initial sync attempt
  tryBackgroundSync();

  return unsubscribe;
}

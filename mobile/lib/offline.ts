/**
 * MANTIS Mobile - Offline Storage & Sync Queue
 * 
 * Handles offline data storage and background synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewInfringement, LocalInfringement, LocalPhoto } from './types';
import { createInfringement, uploadEvidenceFile } from './database';

// Storage keys
const KEYS = {
  DRAFTS: '@mantis:drafts',
  SYNC_QUEUE: '@mantis:sync_queue',
  LAST_SYNC: '@mantis:last_sync',
  OFFLINE_MODE: '@mantis:offline_mode',
};

// -----------------------------------------------------
// Draft Management
// -----------------------------------------------------

export async function saveDraft(draft: LocalInfringement): Promise<void> {
  try {
    const drafts = await getDrafts();
    const existing = drafts.findIndex(d => d.id === draft.id);
    
    if (existing >= 0) {
      drafts[existing] = draft;
    } else {
      drafts.push(draft);
    }
    
    await AsyncStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
}

export async function getDrafts(): Promise<LocalInfringement[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.DRAFTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting drafts:', error);
    return [];
  }
}

export async function getDraft(id: string): Promise<LocalInfringement | null> {
  try {
    const drafts = await getDrafts();
    return drafts.find(d => d.id === id) || null;
  } catch (error) {
    console.error('Error getting draft:', error);
    return null;
  }
}

export async function deleteDraft(id: string): Promise<void> {
  try {
    const drafts = await getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    await AsyncStorage.setItem(KEYS.DRAFTS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
}

// -----------------------------------------------------
// Sync Queue Management
// -----------------------------------------------------

export interface SyncQueueItem {
  id: string;
  type: 'infringement' | 'evidence';
  data: any;
  retries: number;
  created_at: string;
  last_attempt?: string;
}

export async function addToSyncQueue(
  type: SyncQueueItem['type'],
  data: any
): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const item: SyncQueueItem = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      retries: 0,
      created_at: new Date().toISOString(),
    };
    
    queue.push(item);
    await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SYNC_QUEUE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from sync queue:', error);
    throw error;
  }
}

export async function updateSyncQueueItem(
  id: string,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  try {
    const queue = await getSyncQueue();
    const index = queue.findIndex(item => item.id === id);
    
    if (index >= 0) {
      queue[index] = { ...queue[index], ...updates };
      await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Error updating sync queue item:', error);
    throw error;
  }
}

// -----------------------------------------------------
// Sync Operations
// -----------------------------------------------------

export interface SyncResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export async function syncPendingData(): Promise<SyncResult> {
  const result: SyncResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  try {
    const queue = await getSyncQueue();
    
    for (const item of queue) {
      try {
        await syncQueueItem(item);
        await removeFromSyncQueue(item.id);
        result.success++;
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);
        
        const newRetries = item.retries + 1;
        
        if (newRetries >= 3) {
          // Max retries reached, remove from queue
          await removeFromSyncQueue(item.id);
          result.failed++;
          result.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        } else {
          // Increment retry count
          await updateSyncQueueItem(item.id, {
            retries: newRetries,
            last_attempt: new Date().toISOString(),
          });
          result.failed++;
        }
      }
    }

    // Update last sync timestamp
    await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
  } catch (error) {
    console.error('Error during sync:', error);
  }

  return result;
}

async function syncQueueItem(item: SyncQueueItem): Promise<void> {
  switch (item.type) {
    case 'infringement':
      await syncInfringement(item.data);
      break;
    case 'evidence':
      await syncEvidence(item.data);
      break;
    default:
      throw new Error(`Unknown sync item type: ${item.type}`);
  }
}

async function syncInfringement(data: NewInfringement): Promise<void> {
  const { error } = await createInfringement(data);
  if (error) {
    throw new Error(error.message);
  }
}

async function syncEvidence(data: {
  infringementId: string;
  fileUri: string;
  fileType: string;
}): Promise<void> {
  const { error } = await uploadEvidenceFile(
    data.infringementId,
    data.fileUri,
    data.fileType
  );
  if (error) {
    throw new Error(error.message);
  }
}

// -----------------------------------------------------
// Offline Mode Management
// -----------------------------------------------------

export async function isOfflineMode(): Promise<boolean> {
  try {
    const mode = await AsyncStorage.getItem(KEYS.OFFLINE_MODE);
    return mode === 'true';
  } catch (error) {
    return false;
  }
}

export async function setOfflineMode(offline: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.OFFLINE_MODE, offline.toString());
  } catch (error) {
    console.error('Error setting offline mode:', error);
  }
}

export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    return null;
  }
}

// -----------------------------------------------------
// Auto-sync Helper
// -----------------------------------------------------

export async function shouldAutoSync(): Promise<boolean> {
  const queue = await getSyncQueue();
  const lastSync = await getLastSyncTime();
  
  // Auto-sync if:
  // 1. There are items in the queue
  // 2. Last sync was more than 5 minutes ago or never synced
  if (queue.length === 0) {
    return false;
  }
  
  if (!lastSync) {
    return true;
  }
  
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return lastSync < fiveMinutesAgo;
}

// -----------------------------------------------------
// Batch Operations
// -----------------------------------------------------

export async function clearAllDrafts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.DRAFTS);
  } catch (error) {
    console.error('Error clearing drafts:', error);
    throw error;
  }
}

export async function clearSyncQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SYNC_QUEUE);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
    throw error;
  }
}

export async function getSyncStats(): Promise<{
  draftCount: number;
  queueCount: number;
  lastSync: Date | null;
}> {
  const drafts = await getDrafts();
  const queue = await getSyncQueue();
  const lastSync = await getLastSyncTime();
  
  return {
    draftCount: drafts.length,
    queueCount: queue.length,
    lastSync,
  };
}

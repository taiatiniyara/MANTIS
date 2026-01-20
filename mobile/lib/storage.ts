/**
 * MANTIS Mobile - Storage Helper
 * 
 * Wrapper around AsyncStorage for type-safe local storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StorageKeys,
  LocalInfringement,
  SyncQueue,
  AppSettings,
  User,
  LocalPhoto,
} from './types';

// -----------------------------------------------------
// Generic Storage Functions
// -----------------------------------------------------

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
}

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
}

async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

// -----------------------------------------------------
// User Profile
// -----------------------------------------------------

export async function saveUserProfile(user: User): Promise<void> {
  return setItem(StorageKeys.USER_PROFILE, user);
}

export async function getUserProfile(): Promise<User | null> {
  return getItem<User>(StorageKeys.USER_PROFILE);
}

export async function removeUserProfile(): Promise<void> {
  return removeItem(StorageKeys.USER_PROFILE);
}

// -----------------------------------------------------
// App Settings
// -----------------------------------------------------

const defaultSettings: AppSettings = {
  offline_mode: false,
  auto_sync: true,
  camera_quality: 'high',
  gps_accuracy: 'high',
  map_cache_enabled: true,
  notifications_enabled: true,
  dark_mode: false,
};

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  return setItem(StorageKeys.SETTINGS, updated);
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await getItem<AppSettings>(StorageKeys.SETTINGS);
  return settings || defaultSettings;
}

// -----------------------------------------------------
// Local Infringements (Drafts & Offline Queue)
// -----------------------------------------------------

export async function saveLocalInfringement(
  infringement: LocalInfringement
): Promise<void> {
  const infringements = await getLocalInfringements();
  const index = infringements.findIndex(i => i.id === infringement.id);
  
  if (index >= 0) {
    infringements[index] = infringement;
  } else {
    infringements.push(infringement);
  }
  
  return setItem(StorageKeys.INFRINGEMENTS, infringements);
}

export async function getLocalInfringements(): Promise<LocalInfringement[]> {
  const infringements = await getItem<LocalInfringement[]>(StorageKeys.INFRINGEMENTS);
  return infringements || [];
}

export async function getLocalInfringement(id: string): Promise<LocalInfringement | null> {
  const infringements = await getLocalInfringements();
  return infringements.find(i => i.id === id) || null;
}

export async function deleteLocalInfringement(id: string): Promise<void> {
  const infringements = await getLocalInfringements();
  const filtered = infringements.filter(i => i.id !== id);
  return setItem(StorageKeys.INFRINGEMENTS, filtered);
}

export async function getDraftInfringements(): Promise<LocalInfringement[]> {
  const infringements = await getLocalInfringements();
  return infringements.filter(i => i.status === 'draft');
}

export async function getPendingSyncInfringements(): Promise<LocalInfringement[]> {
  const infringements = await getLocalInfringements();
  return infringements.filter(i => i.status === 'pending_sync');
}

// -----------------------------------------------------
// Local Photos
// -----------------------------------------------------

export async function saveLocalPhoto(photo: LocalPhoto): Promise<void> {
  const infringement = await getLocalInfringement(photo.infringement_id);
  
  if (!infringement) {
    throw new Error(`Infringement ${photo.infringement_id} not found`);
  }
  
  const existingIndex = infringement.photos.findIndex(p => p.id === photo.id);
  
  if (existingIndex >= 0) {
    infringement.photos[existingIndex] = photo;
  } else {
    infringement.photos.push(photo);
  }
  
  return saveLocalInfringement(infringement);
}

export async function deleteLocalPhoto(photoId: string, infringementId: string): Promise<void> {
  const infringement = await getLocalInfringement(infringementId);
  
  if (!infringement) {
    return;
  }
  
  infringement.photos = infringement.photos.filter(p => p.id !== photoId);
  return saveLocalInfringement(infringement);
}

// -----------------------------------------------------
// Sync Queue
// -----------------------------------------------------

export async function getSyncQueue(): Promise<SyncQueue> {
  const queue = await getItem<SyncQueue>(StorageKeys.SYNC_QUEUE);
  return queue || {
    items: [],
    last_sync: null,
    pending_count: 0,
  };
}

export async function addToSyncQueue(item: Omit<SyncQueue['items'][0], 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const queue = await getSyncQueue();
  
  queue.items.push({
    ...item,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    retries: 0,
  });
  
  queue.pending_count = queue.items.length;
  
  return setItem(StorageKeys.SYNC_QUEUE, queue);
}

export async function removeFromSyncQueue(itemId: string): Promise<void> {
  const queue = await getSyncQueue();
  queue.items = queue.items.filter(item => item.id !== itemId);
  queue.pending_count = queue.items.length;
  return setItem(StorageKeys.SYNC_QUEUE, queue);
}

export async function updateSyncQueueItem(
  itemId: string,
  updates: Partial<SyncQueue['items'][0]>
): Promise<void> {
  const queue = await getSyncQueue();
  const index = queue.items.findIndex(item => item.id === itemId);
  
  if (index >= 0) {
    queue.items[index] = { ...queue.items[index], ...updates };
    return setItem(StorageKeys.SYNC_QUEUE, queue);
  }
}

export async function updateLastSync(): Promise<void> {
  const queue = await getSyncQueue();
  queue.last_sync = new Date();
  return setItem(StorageKeys.SYNC_QUEUE, queue);
}

export async function clearSyncQueue(): Promise<void> {
  const queue: SyncQueue = {
    items: [],
    last_sync: new Date(),
    pending_count: 0,
  };
  return setItem(StorageKeys.SYNC_QUEUE, queue);
}

// -----------------------------------------------------
// Map Cache
// -----------------------------------------------------

interface MapCache {
  tiles: Record<string, {
    url: string;
    cached_at: Date;
    expires_at: Date;
  }>;
}

export async function getMapCache(): Promise<MapCache> {
  const cache = await getItem<MapCache>(StorageKeys.MAP_CACHE);
  return cache || { tiles: {} };
}

export async function saveMapTile(
  tileKey: string,
  url: string,
  ttl: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): Promise<void> {
  const cache = await getMapCache();
  const now = new Date();
  
  cache.tiles[tileKey] = {
    url,
    cached_at: now,
    expires_at: new Date(now.getTime() + ttl),
  };
  
  return setItem(StorageKeys.MAP_CACHE, cache);
}

export async function getMapTile(tileKey: string): Promise<string | null> {
  const cache = await getMapCache();
  const tile = cache.tiles[tileKey];
  
  if (!tile) {
    return null;
  }
  
  // Check if expired
  if (new Date(tile.expires_at) < new Date()) {
    delete cache.tiles[tileKey];
    await setItem(StorageKeys.MAP_CACHE, cache);
    return null;
  }
  
  return tile.url;
}

export async function clearMapCache(): Promise<void> {
  return setItem(StorageKeys.MAP_CACHE, { tiles: {} });
}

export async function cleanExpiredMapTiles(): Promise<void> {
  const cache = await getMapCache();
  const now = new Date();
  
  Object.keys(cache.tiles).forEach(key => {
    if (new Date(cache.tiles[key].expires_at) < now) {
      delete cache.tiles[key];
    }
  });
  
  return setItem(StorageKeys.MAP_CACHE, cache);
}

// -----------------------------------------------------
// Offline Mode
// -----------------------------------------------------

export async function setOfflineMode(enabled: boolean): Promise<void> {
  return setItem(StorageKeys.OFFLINE_MODE, enabled);
}

export async function isOfflineMode(): Promise<boolean> {
  const mode = await getItem<boolean>(StorageKeys.OFFLINE_MODE);
  return mode || false;
}

// -----------------------------------------------------
// Auth Token
// -----------------------------------------------------

export async function saveAuthToken(token: string): Promise<void> {
  return setItem(StorageKeys.AUTH_TOKEN, token);
}

export async function getAuthToken(): Promise<string | null> {
  return getItem<string>(StorageKeys.AUTH_TOKEN);
}

export async function removeAuthToken(): Promise<void> {
  return removeItem(StorageKeys.AUTH_TOKEN);
}

// -----------------------------------------------------
// Clear All Data (Logout)
// -----------------------------------------------------

export async function clearAllData(): Promise<void> {
  await clear();
}

// -----------------------------------------------------
// Storage Info
// -----------------------------------------------------

export async function getStorageInfo(): Promise<{
  total_keys: number;
  infringements_count: number;
  sync_queue_count: number;
  map_tiles_count: number;
}> {
  const [infringements, syncQueue, mapCache] = await Promise.all([
    getLocalInfringements(),
    getSyncQueue(),
    getMapCache(),
  ]);
  
  const allKeys = await AsyncStorage.getAllKeys();
  
  return {
    total_keys: allKeys.length,
    infringements_count: infringements.length,
    sync_queue_count: syncQueue.items.length,
    map_tiles_count: Object.keys(mapCache.tiles).length,
  };
}

// -----------------------------------------------------
// Supabase Storage - Photo Upload Functions
// -----------------------------------------------------

import { supabase } from '@/utils/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const STORAGE_BUCKET = 'infringement-evidence';

/**
 * Upload a photo to Supabase storage
 * @param uri - Local file URI
 * @param fileName - Name for the uploaded file
 * @param userId - ID of the user uploading (for path organization)
 * @returns Public URL of the uploaded file or null on error
 */
export async function uploadPhoto(
  uri: string,
  fileName: string,
  userId: string
): Promise<string | null> {
  try {
    // Read the file as base64
    const file = new FileSystem.File(uri);
    const base64 = await file.base64();

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Generate unique file path
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}_${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    return null;
  }
}

/**
 * Upload multiple photos to Supabase storage
 * @param photos - Array of photo items with uri, type, and name
 * @param userId - ID of the user uploading
 * @returns Array of public URLs (null for failed uploads)
 */
export async function uploadPhotos(
  photos: Array<{ uri: string; type: string; name: string }>,
  userId: string
): Promise<Array<string | null>> {
  const uploadPromises = photos.map(photo =>
    uploadPhoto(photo.uri, photo.name, userId)
  );
  return Promise.all(uploadPromises);
}

/**
 * Delete a photo from Supabase storage
 * @param url - Public URL of the photo to delete
 * @returns true if successful, false otherwise
 */
export async function deletePhoto(url: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split(`/${STORAGE_BUCKET}/`);
    if (urlParts.length < 2) {
      console.error('Invalid photo URL');
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}

/**
 * Delete multiple photos from Supabase storage
 * @param urls - Array of public URLs to delete
 * @returns Array of boolean results
 */
export async function deletePhotos(urls: string[]): Promise<boolean[]> {
  const deletePromises = urls.map(url => deletePhoto(url));
  return Promise.all(deletePromises);
}

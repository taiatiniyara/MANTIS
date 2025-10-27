import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage implementation using SecureStore for tokens
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage === 'undefined') {
          return null;
        }
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.setItem(key, value);
      } catch (fallbackError) {
        console.error('Error with AsyncStorage fallback:', fallbackError);
      }
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
      // Try AsyncStorage fallback
      try {
        await AsyncStorage.removeItem(key);
      } catch (fallbackError) {
        console.error('Error with AsyncStorage fallback:', fallbackError);
      }
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for common operations
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },
};

// User profile operations
export const profiles = {
  get: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  update: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },
};

// Infringement operations
export const infringements = {
  create: async (infringement: any) => {
    const { data, error } = await supabase
      .from('infringements')
      .insert(infringement)
      .select()
      .single();
    return { data, error };
  },

  list: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('infringements')
      .select(`
        *,
        type:infringement_types (
          code,
          name,
          fine_amount,
          category:infringement_categories (
            name
          )
        )
      `)
      .eq('officer_id', userId)
      .order('issued_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('infringements')
      .select(`
        *,
        type:infringement_types (
          code,
          name,
          fine_amount,
          category:infringement_categories (
            name
          )
        )
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },
};

// Infringement types
export const infringementTypes = {
  list: async () => {
    const { data, error } = await supabase
      .from('infringement_types')
      .select(`
        *,
        category:infringement_categories (
          id,
          name
        )
      `)
      .order('code');
    return { data, error };
  },

  listByCategory: async (categoryId: string) => {
    const { data, error } = await supabase
      .from('infringement_types')
      .select('*')
      .eq('category_id', categoryId)
      .order('code');
    return { data, error };
  },
};

// Categories
export const categories = {
  list: async () => {
    const { data, error } = await supabase
      .from('infringement_categories')
      .select('*')
      .order('name');
    return { data, error };
  },
};

// GPS Tracking
export const gpsTracking = {
  track: async (trackingData: {
    user_id: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  }) => {
    const { data, error } = await supabase
      .from('gps_tracking')
      .insert(trackingData)
      .select()
      .single();
    return { data, error };
  },

  getHistory: async (userId: string, limit = 100) => {
    const { data, error } = await supabase
      .from('gps_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('tracked_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },
};

// Storage for photos
export const storage = {
  uploadPhoto: async (
    fileName: string,
    base64Data: string,
    bucket = 'evidence-photos'
  ) => {
    // Decode base64 to binary
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, binaryData, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    return { data, error };
  },

  uploadPhotoFromUri: async (
    fileName: string,
    fileUri: string,
    bucket = 'evidence-photos'
  ) => {
    try {
      // Use expo-file-system legacy API to read the file as base64
      const base64 = await readAsStringAsync(fileUri, {
        encoding: 'base64',
      });
      
      // Convert base64 to ArrayBuffer
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // Get the session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }
      
      // Upload directly via fetch to bypass FormData issues
      const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'image/jpeg',
            'apikey': supabaseAnonKey,
          },
          body: byteArray,
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        return {
          data: null,
          error: new Error(`Upload failed: ${response.status} - ${errorText}`)
        };
      }
      
      const result = await response.json();
      return { data: result, error: null };
    } catch (err: any) {
      console.error('Upload error:', err);
      return { data: null, error: err };
    }
  },

  getPhotoUrl: (fileName: string, bucket = 'evidence-photos') => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  },

  deletePhoto: async (fileName: string, bucket = 'evidence-photos') => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    return { data, error };
  },
};

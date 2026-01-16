import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Custom lock implementation for React Native
// LockFunc type: <R>(name: string, acquireTimeout: number, fn: () => Promise<R>) => Promise<R>
const customLock = async <R>(
  lockKey: string,
  acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => {
  const startTime = Date.now();
  const retryInterval = 100; // 100ms retry interval
  
  // Try to acquire the lock
  while (Date.now() - startTime < acquireTimeout) {
    const existingLock = await AsyncStorage.getItem(lockKey);
    
    if (!existingLock || Date.now() - parseInt(existingLock) > 10000) {
      // Lock is free or expired, acquire it
      await AsyncStorage.setItem(lockKey, Date.now().toString());
      
      try {
        // Execute the function while holding the lock
        return await fn();
      } finally {
        // Always release the lock
        await AsyncStorage.removeItem(lockKey);
      }
    }
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }
  
  // Force acquire after timeout and execute
  await AsyncStorage.setItem(lockKey, Date.now().toString());
  try {
    return await fn();
  } finally {
    await AsyncStorage.removeItem(lockKey);
  }
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      ...(Platform.OS !== 'web' && { 
        lock: customLock,
      }),
    },
  }
)
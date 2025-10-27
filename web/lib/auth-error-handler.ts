/**
 * Auth Error Handler
 * 
 * Centralized error handling for Supabase authentication errors
 */

import { AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase/client';

export interface AuthErrorDetails {
  message: string;
  shouldRedirect: boolean;
  redirectPath?: string;
}

/**
 * Handle authentication errors and determine the appropriate action
 */
export function handleAuthError(error: AuthError | Error): AuthErrorDetails {
  const errorMessage = error.message.toLowerCase();

  // Refresh token errors - session has expired
  if (errorMessage.includes('refresh_token_not_found') || 
      errorMessage.includes('invalid refresh token') ||
      errorMessage.includes('refresh token not found')) {
    console.warn('Session expired or invalid refresh token');
    return {
      message: 'Your session has expired. Please sign in again.',
      shouldRedirect: true,
      redirectPath: '/auth/login',
    };
  }

  // JWT expired
  if (errorMessage.includes('jwt expired') || errorMessage.includes('token expired')) {
    console.warn('JWT token expired');
    return {
      message: 'Your session has expired. Please sign in again.',
      shouldRedirect: true,
      redirectPath: '/auth/login',
    };
  }

  // Invalid JWT
  if (errorMessage.includes('invalid jwt') || errorMessage.includes('invalid token')) {
    console.warn('Invalid JWT token');
    return {
      message: 'Authentication error. Please sign in again.',
      shouldRedirect: true,
      redirectPath: '/auth/login',
    };
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      message: 'Network error. Please check your connection and try again.',
      shouldRedirect: false,
    };
  }

  // Default case
  return {
    message: 'An authentication error occurred. Please try again.',
    shouldRedirect: false,
  };
}

/**
 * Clear all auth-related data from the browser
 */
export async function clearAuthData() {
  try {
    // Sign out from Supabase (this will clear cookies)
    await supabase.auth.signOut();
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      // Clear specific Supabase keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage
      sessionStorage.clear();
    }
    
    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

/**
 * Check if the current session is valid
 */
export async function validateSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }
    
    return !!session;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      const errorDetails = handleAuthError(error);
      if (errorDetails.shouldRedirect) {
        await clearAuthData();
      }
      return false;
    }
    
    return !!data.session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}

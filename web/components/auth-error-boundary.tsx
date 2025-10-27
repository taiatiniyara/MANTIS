"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { handleAuthError, clearAuthData } from '@/lib/auth-error-handler';
import { AuthError } from '@supabase/supabase-js';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Global auth error boundary that catches authentication errors
 * and handles them appropriately
 */
export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        // Handle successful token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          setHasError(false);
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Only redirect if not already on auth page
          if (!pathname.startsWith('/auth')) {
            router.push('/auth/login');
          }
        }

        // Handle user deletion or session invalidation
        if (event === 'USER_UPDATED' && !session) {
          console.log('Session invalidated');
          await clearAuthData();
          if (!pathname.startsWith('/auth')) {
            router.push('/auth/login');
          }
        }
      }
    );

    // Global error handler for Supabase errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Clone response to read it
        const clonedResponse = response.clone();
        
        // Check if it's a Supabase auth endpoint
        const url = args[0]?.toString() || '';
        if (url.includes('supabase.co/auth') || url.includes('/auth/v1/')) {
          try {
            const data = await clonedResponse.json();
            
            // Check for auth errors
            if (data.error || data.error_description) {
              const errorMsg = data.error_description || data.error || '';
              
              if (errorMsg.toLowerCase().includes('refresh_token_not_found') ||
                  errorMsg.toLowerCase().includes('invalid refresh token')) {
                console.warn('Auth error detected in fetch:', errorMsg);
                
                // Create an AuthError-like object
                const authError = new Error(errorMsg) as AuthError;
                const errorDetails = handleAuthError(authError);
                
                if (errorDetails.shouldRedirect && !pathname.startsWith('/auth')) {
                  console.log('Redirecting due to auth error...');
                  await clearAuthData();
                  setHasError(true);
                  router.push('/auth/login');
                }
              }
            }
          } catch (jsonError) {
            // Not JSON or couldn't parse, ignore
          }
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };

    return () => {
      subscription.unsubscribe();
      // Restore original fetch
      window.fetch = originalFetch;
    };
  }, [router, pathname]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
          <p className="text-muted-foreground mb-4">
            Your session has expired. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

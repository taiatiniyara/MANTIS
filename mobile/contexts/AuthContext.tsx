/**
 * MANTIS Mobile - Auth Context
 * 
 * Manages authentication state across the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { User, UserWithRelations } from '@/lib/types';
import { saveUserProfile, getUserProfile, removeUserProfile } from '@/lib/storage';
import { useSessionUser } from '@/hooks/useSessionUser';
import { queryKeys } from '@/lib/queryKeys';

interface AuthContextType {
  session: Session | null;
  user: UserWithRelations | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRelations | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const queryClient = useQueryClient();

  const sessionUserQuery = useSessionUser(!!session);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error('Error checking auth session:', error);
          setSession(null);
          return;
        }

        setSession(data.session);
      } catch (error) {
        console.error('Unexpected error initializing auth session:', error);
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    };

    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        setSession(session);
        try {
          if (session) {
            queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
          } else {
            setUser(null);
            await removeUserProfile();
            queryClient.removeQueries({ queryKey: queryKeys.currentUser });
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    let isMounted = true;

    const hydrateFromCache = async () => {
      if (!session) {
        await removeUserProfile();
        setUser(null);
        return;
      }

      const cachedUser = await getUserProfile();
      if (cachedUser && isMounted) {
        setUser(cachedUser as UserWithRelations);
      }
    };

    hydrateFromCache();
    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (sessionUserQuery.data) {
      setUser(sessionUserQuery.data);
      saveUserProfile(sessionUserQuery.data as User);
    }
  }, [sessionUserQuery.data]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await removeUserProfile();
    setUser(null);
    queryClient.removeQueries({ queryKey: queryKeys.currentUser });
  };

  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'mantis://reset-password',
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: 'Failed to send reset email' };
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  };

  const value = {
    session,
    user,
    loading: authChecking || (session ? sessionUserQuery.isLoading : false),
    signIn,
    signOut,
    refreshUser,
    resetPassword,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

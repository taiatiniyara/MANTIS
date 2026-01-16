/**
 * MANTIS Mobile - Auth Context
 * 
 * Manages authentication state across the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { User, UserWithRelations } from '@/lib/types';
import { getCurrentUser } from '@/lib/database';
import { saveUserProfile, getUserProfile, removeUserProfile } from '@/lib/storage';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUser();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await loadUser();
        } else {
          setUser(null);
          await removeUserProfile();
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      // Try to load from cache first
      const cachedUser = await getUserProfile();
      if (cachedUser) {
        setUser(cachedUser as UserWithRelations);
      }

      // Then fetch fresh data
      const { data, error } = await getCurrentUser();
      if (data && !error) {
        setUser(data);
        await saveUserProfile(data as User);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

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
  };

  const refreshUser = async () => {
    await loadUser();
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
    loading,
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

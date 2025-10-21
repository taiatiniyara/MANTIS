import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, auth as authAPI, profiles } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  position: string | null;
  role: string;
  agency_id: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{error: any}>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    authAPI.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await profiles.get(userId);
      
      if (error) {
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfile(data as UserProfile);
        // Cache profile for offline access
        await AsyncStorage.setItem('user_profile', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Exception loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authAPI.signIn(email, password);
    
    if (error) {
      return { error };
    }

    if (data.user) {
      await loadProfile(data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await authAPI.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    
    // Clear cached data
    await AsyncStorage.multiRemove([
      'user_profile',
      'pending_infringements',
      'cached_types',
      'cached_categories',
    ]);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

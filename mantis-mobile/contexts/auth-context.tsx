import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/supabase/config';

/**
 * Auth Context for Mobile App
 * Manages authentication state and provides auth-related functions
 */

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'central_admin' | 'agency_admin' | 'officer' | 'citizen';
  agency_id?: string;
  phone_number?: string;
  is_active: boolean;
  agency?: {
    id: string;
    name: string;
    type: string;
  };
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          agency:agencies(id, name, type)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  // Check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!profile) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(profile.role);
  };

  // Permission check based on role
  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;

    const rolePermissions: Record<string, string[]> = {
      central_admin: ['*'], // All permissions
      agency_admin: [
        'view_dashboard',
        'view_infringements',
        'create_infringement',
        'edit_infringement',
        'void_infringement',
        'view_payments',
        'view_disputes',
        'resolve_dispute',
        'view_reports',
        'manage_officers',
      ],
      officer: [
        'view_dashboard',
        'view_infringements',
        'create_infringement',
        'edit_own_infringement',
        'void_own_infringement',
        'view_own_reports',
      ],
      citizen: [
        'view_own_infringements',
        'create_payment',
        'view_own_payments',
        'create_dispute',
        'view_own_disputes',
      ],
    };

    const permissions = rolePermissions[profile.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasRole,
    hasPermission,
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

import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Automatically refresh token before it expires
      autoRefreshToken: true,
      // Persist session in cookies
      persistSession: true,
      // Detect when access token has changed
      detectSessionInUrl: true,
    },
  }
);

// Handle auth errors globally
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
    }
  }
  
  // Handle specific auth errors
  if (event === 'USER_UPDATED' && !session) {
    console.log('Session lost, redirecting to login');
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth/login';
    }
  }
});

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /auth/signout
 * Sign out the current user and clear their session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Sign out from Supabase (this clears the cookies)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear the cookies
    }
    
    // Create response that redirects to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    
    // Clear all Supabase cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
    ];
    
    // Get all cookies and clear any that contain 'sb-' or 'supabase'
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
        response.cookies.delete(cookie.name);
      }
    });
    
    cookiesToClear.forEach((cookieName) => {
      response.cookies.delete(cookieName);
    });
    
    return response;
  } catch (error) {
    console.error('Unexpected error during sign out:', error);
    // Redirect to login even on error
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

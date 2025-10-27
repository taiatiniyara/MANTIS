"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/actions";
import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage before signing out
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Call the server action
      await signOutAction();
      // Note: redirect() in the action will throw a NEXT_REDIRECT error
      // This is expected behavior and will perform the redirect
    } catch (error) {
      // Check if it's a redirect error (which is expected)
      if (error && typeof error === 'object' && 'digest' in error) {
        // This is a Next.js redirect, which is expected - do nothing
        console.log('Redirecting to login...');
      } else {
        console.error('Unexpected logout error:', error);
        // Even on error, try to redirect manually
        window.location.href = '/auth/login';
      }
    } finally {
      // Don't set loading to false if redirecting
      // setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/actions";

/**
 * Form-based logout button
 * Uses server action with form submission for better reliability
 */
export function LogoutButtonForm() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="default">
        Logout
      </Button>
    </form>
  );
}

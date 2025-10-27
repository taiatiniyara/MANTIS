"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server action to sign out the current user
 * This ensures cookies are properly cleared on the server side
 */
export async function signOutAction() {
  const supabase = await createClient();

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    // Continue anyway to clear the session
  }

  // Revalidate the cache for all pages
  revalidatePath("/", "layout");

  // Redirect to login page
  redirect("/auth/login");
}

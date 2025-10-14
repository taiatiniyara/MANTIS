import { supabase } from "@/lib/supabase";

export interface SystemStatus {
  hasUsers: boolean;
  userCount: number;
  initialized: boolean;
}

export interface FirstUserData {
  email: string;
  password: string;
  displayName: string;
}

/**
 * Check if the system has any users
 */
export async function checkSystemStatus(): Promise<SystemStatus> {
  try {
    // Try using the database function first (bypasses RLS)
    const { data: functionData, error: functionError } = await supabase.rpc(
      "check_system_initialized"
    );

    if (!functionError && functionData) {
      return {
        hasUsers: functionData.has_users || false,
        userCount: functionData.user_count || 0,
        initialized: functionData.initialized || false,
      };
    }

    // Fallback to direct query if function doesn't exist
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return {
      hasUsers: (count ?? 0) > 0,
      userCount: count ?? 0,
      initialized: (count ?? 0) > 0,
    };
  } catch (error) {
    console.error("Error checking system status:", error);
    throw error;
  }
}

/**
 * Create the first system administrator
 */
export async function createFirstAdmin(userData: FirstUserData) {
  try {
    // Step 1: Create the auth user via signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: undefined, // Skip email confirmation for first admin
        data: {
          display_name: userData.displayName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    // Step 2: Create the user profile using the database function that bypasses RLS
    const { error: functionError } = await supabase.rpc(
      "insert_first_admin_profile",
      {
        p_user_id: authData.user.id,
        p_display_name: userData.displayName,
      }
    );

    if (functionError) {
      // If profile creation fails, we should ideally clean up the auth user
      // but for now, just throw the error
      console.error("Failed to create user profile:", functionError);
      throw new Error(
        `Failed to create user profile: ${functionError.message}`
      );
    }

    // Step 3: Sign in the newly created user
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

    if (signInError) throw signInError;

    return {
      user: signInData.user,
      session: signInData.session,
    };
  } catch (error) {
    console.error("Error creating first admin:", error);
    throw error;
  }
}

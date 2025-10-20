import { supabase } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    

    // Check authentication and authorization
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("users")
      .select("role, agency_id")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "super_admin" && profile.role !== "agency_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { email, position, role, agency_id, location_id } = body;

    // Validate input
    if (!email || !position || !role) {
      return NextResponse.json(
        { error: "Email, position, and role are required" },
        { status: 400 }
      );
    }

    // Agency admins can only create users in their agency
    if (profile.role === "agency_admin") {
      if (agency_id && agency_id !== profile.agency_id) {
        return NextResponse.json(
          { error: "You can only create users in your own agency" },
          { status: 403 }
        );
      }
    }

    // Generate a random password
    const tempPassword = generateRandomPassword();

    // Create auth user via Supabase Auth Admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: tempPassword,
      email_confirm: false, // Require email confirmation
      user_metadata: {
        position: position.trim(),
        role,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create auth user" },
        { status: 400 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Create user profile in database
    const { error: profileError } = await supabase.from("users").insert({
      id: authUser.user.id,
      position: position.trim(),
      role,
      agency_id: agency_id || null,
      location_id: location_id || null,
    });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Attempt to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Send password reset email (serves as invitation)
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email.trim(),
    });

    if (resetError) {
      console.error("Email error:", resetError);
      // User is created, but email failed - not critical
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          position,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

function generateRandomPassword(): string {
  const length = 16;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const {
    userId,
    title,
    message,
    type,
    category,
    priority,
    actionUrl,
    actionLabel,
    metadata,
  } = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user has permission to create notifications
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "agency_admin", "manager"].includes(userData.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create notification
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      message,
      type: type || "info",
      category,
      priority: priority || "normal",
      action_url: actionUrl,
      action_label: actionLabel,
      metadata,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }

  return NextResponse.json({ success: true, notification });
}

// Batch create notifications
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  
  const {
    userIds,
    title,
    message,
    type,
    category,
    priority,
    actionUrl,
    actionLabel,
    metadata,
  } = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user has permission
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "agency_admin", "manager"].includes(userData.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create notifications for multiple users
  const notifications = userIds.map((userId: string) => ({
    user_id: userId,
    title,
    message,
    type: type || "info",
    category,
    priority: priority || "normal",
    action_url: actionUrl,
    action_label: actionLabel,
    metadata,
  }));

  const { data, error } = await supabase
    .from("notifications")
    .insert(notifications)
    .select();

  if (error) {
    console.error("Error creating notifications:", error);
    return NextResponse.json({ error: "Failed to create notifications" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    count: data?.length || 0,
    notifications: data,
  });
}

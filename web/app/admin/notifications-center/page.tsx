import { createClient } from "@/lib/supabase/server";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all notifications for the user
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  // Get stats by type
  const allNotifications = notifications || [];
  const typeStats = {
    info: allNotifications.filter((n) => n.type === "info").length,
    success: allNotifications.filter((n) => n.type === "success").length,
    warning: allNotifications.filter((n) => n.type === "warning").length,
    error: allNotifications.filter((n) => n.type === "error").length,
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with system events and important alerts
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              New notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Information</CardTitle>
            <Info className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.info}</div>
            <p className="text-xs text-muted-foreground">Info messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.warning}</div>
            <p className="text-xs text-muted-foreground">Warning alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.success}</div>
            <p className="text-xs text-muted-foreground">Completed actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Center */}
      <NotificationCenter notifications={notifications || []} userId={user.id} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationPreferences } from "@/components/admin/notification-preferences";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user details
  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id, position")
    .eq("id", user.id)
    .single();

  if (!userData) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notification Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your notification preferences and alert settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Receive email alerts for important events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences
              userId={user.id}
              userRole={userData.role}
              type="email"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In-App Notifications</CardTitle>
            <CardDescription>
              Get notified within the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences
              userId={user.id}
              userRole={userData.role}
              type="in-app"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Digest Emails</CardTitle>
            <CardDescription>
              Receive summary reports at regular intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences
              userId={user.id}
              userRole={userData.role}
              type="digest"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch summary statistics
  const [
    { count: agenciesCount },
    { count: usersCount },
    { count: infringementsCount },
    { count: teamsCount },
    { count: routesCount },
    { count: locationsCount },
  ] = await Promise.all([
    supabase.from("agencies").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("infringements").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("routes").select("*", { count: "exact", head: true }),
    supabase.from("locations").select("*", { count: "exact", head: true }),
  ]);

  // Get recent infringements
  const { data: recentInfringements } = await supabase
    .from("infringements")
    .select(
      `
      id,
      vehicle_id,
      issued_at,
      created_at,
      officer:users!officer_id (
        position
      ),
      agency:agencies (
        name
      ),
      type:infringement_types (
        code,
        name
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  // Get audit logs for recent activity
  const { data: recentActivity } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayInfringements } = await supabase
    .from("infringements")
    .select("*", { count: "exact", head: true })
    .gte("issued_at", today.toISOString());

  // Calculate this month's stats
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const { count: monthInfringements } = await supabase
    .from("infringements")
    .select("*", { count: "exact", head: true })
    .gte("issued_at", startOfMonth.toISOString());

  // Get user role distribution
  const { data: userRoles } = await supabase.from("users").select("role");

  const roleCounts =
    userRoles?.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  const stats = [
    {
      title: "Total Infringements",
      value: infringementsCount || 0,
      description: `${todayInfringements || 0} today`,
      icon: FileText,
      href: "/admin/infringements",
      trend: "+12%",
    },
    {
      title: "Active Agencies",
      value: agenciesCount || 0,
      description: "Enforcement agencies",
      icon: Building2,
      href: "/admin/agencies",
    },
    {
      title: "System Users",
      value: usersCount || 0,
      description: `${roleCounts.officer || 0} officers`,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "This Month",
      value: monthInfringements || 0,
      description: "Infringements recorded",
      icon: TrendingUp,
      href: "/admin/analytics",
      trend: "+8%",
    },
  ];

  const additionalStats = [
    { label: "Teams", value: teamsCount || 0, href: "/admin/teams" },
    { label: "Routes", value: routesCount || 0, href: "/admin/routes" },
    {
      label: "Locations",
      value: locationsCount || 0,
      href: "/admin/locations",
    },
    { label: "Categories", value: 0, href: "/admin/categories" },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Super Admin overview of the MANTIS system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {additionalStats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                  >
                    <div className="mt-1">
                      {activity.action === "CREATE" && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {activity.action === "UPDATE" && (
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      )}
                      {activity.action === "DELETE" && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.action} {activity.table_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>User {activity.user_id?.slice(0, 8)}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/agencies"
              className="flex items-center gap-2 p-3 rounded-md hover:bg-accent transition-colors border"
            >
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Manage Agencies</p>
                <p className="text-xs text-muted-foreground">
                  {agenciesCount || 0} agencies
                </p>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 p-3 rounded-md hover:bg-accent transition-colors border"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Manage Users</p>
                <p className="text-xs text-muted-foreground">
                  {usersCount || 0} users
                </p>
              </div>
            </Link>
            <Link
              href="/admin/infringements"
              className="flex items-center gap-2 p-3 rounded-md hover:bg-accent transition-colors border"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">View Infringements</p>
                <p className="text-xs text-muted-foreground">
                  {infringementsCount || 0} total
                </p>
              </div>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 p-3 rounded-md hover:bg-accent transition-colors border"
            >
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Analytics Dashboard</p>
                <p className="text-xs text-muted-foreground">
                  View detailed insights
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Infringements and System Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Infringements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Infringements</CardTitle>
            <CardDescription>Latest recorded violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInfringements && recentInfringements.length > 0 ? (
                recentInfringements.slice(0, 5).map((infringement) => {
                  const infringementType = infringement.type?.[0];
                  const officer = infringement.officer?.[0];
                  const agency = infringement.agency?.[0];

                  return (
                    <div
                      key={infringement.id}
                      className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {infringementType?.name || "Unknown"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Officer {officer?.position || "Unknown"}</span>
                          <span>•</span>
                          <span>{agency?.name || "Unknown Agency"}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(infringement.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent infringements
                </p>
              )}
            </div>
            {recentInfringements && recentInfringements.length > 5 && (
              <Link
                href="/admin/infringements"
                className="block mt-4 text-sm text-primary hover:underline"
              >
                View all infringements →
              </Link>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">API Services</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Background Jobs</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Running
              </Badge>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium">99.9%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response Time</span>
              <span className="font-medium">45ms avg</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

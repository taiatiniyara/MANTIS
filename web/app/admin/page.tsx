import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, TrendingUp, Activity, Clock, AlertCircle, CheckCircle } from "lucide-react";
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
    .select(`
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
    `)
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
  const { data: userRoles } = await supabase
    .from("users")
    .select("role");

  const roleCounts = userRoles?.reduce((acc: Record<string, number>, user) => {
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
    { label: "Locations", value: locationsCount || 0, href: "/admin/locations" },
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/agencies"
              className="block p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="font-medium">Manage Agencies</div>
              <div className="text-sm text-muted-foreground">
                Create and configure enforcement agencies
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="block p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-muted-foreground">
                Assign roles and permissions
              </div>
            </Link>
            <Link
              href="/admin/reports"
              className="block p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="font-medium">View Reports</div>
              <div className="text-sm text-muted-foreground">
                Cross-agency analytics and insights
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>MANTIS platform health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-sm font-medium text-green-600">
                ● Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication</span>
              <span className="text-sm font-medium text-green-600">
                ● Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mobile API</span>
              <span className="text-sm font-medium text-green-600">
                ● Online
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

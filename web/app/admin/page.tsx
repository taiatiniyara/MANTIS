import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch summary statistics
  const [
    { count: agenciesCount },
    { count: usersCount },
    { count: infringementsCount },
  ] = await Promise.all([
    supabase.from("agencies").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("infringements").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      title: "Agencies",
      value: agenciesCount || 0,
      description: "Active enforcement agencies",
      icon: Building2,
      href: "/admin/agencies",
    },
    {
      title: "Users",
      value: usersCount || 0,
      description: "System users across all agencies",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Infringements",
      value: infringementsCount || 0,
      description: "Total recorded infringements",
      icon: FileText,
      href: "/admin/reports",
    },
    {
      title: "Active Rate",
      value: "N/A",
      description: "Coming soon",
      icon: TrendingUp,
      href: "#",
    },
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

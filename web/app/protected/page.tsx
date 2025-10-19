import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Route as RouteIcon, MapPin, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user data
  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id, position, agency:agencies(name)")
    .eq("id", user.id)
    .single();

  if (!userData) {
    redirect("/auth/login");
  }

  const isAgencyAdmin = userData.role === "agency_admin";
  const agencyName = (userData.agency as any)?.name || "Unknown Agency";

  // Get statistics for the agency
  const [infringementsResult, teamsResult, routesResult, locationsResult] =
    await Promise.all([
      supabase
        .from("infringements")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", userData.agency_id),
      supabase
        .from("teams")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", userData.agency_id),
      supabase
        .from("routes")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", userData.agency_id),
      supabase
        .from("locations")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", userData.agency_id),
    ]);

  // Get recent infringements for the agency
  const { data: recentInfringements } = await supabase
    .from("infringements")
    .select("id, vehicle_id, issued_at, type:infringement_types(name)")
    .eq("agency_id", userData.agency_id)
    .order("issued_at", { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userData.position || "User"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {agencyName} Dashboard
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Infringements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{infringementsResult.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamsResult.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes</CardTitle>
            <RouteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routesResult.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Patrol routes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationsResult.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Managed locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Infringements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Infringements</CardTitle>
              <CardDescription>
                Latest infringements recorded by your agency
              </CardDescription>
            </div>
            <Link href="/protected/infringements">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentInfringements && recentInfringements.length > 0 ? (
            <div className="space-y-3">
              {recentInfringements.map((infringement: any) => (
                <div
                  key={infringement.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {infringement.vehicle_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {infringement.type?.name || "Unknown Type"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(infringement.issued_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                No infringements recorded yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Agency Admins */}
      {isAgencyAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your agency's resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/protected/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/protected/teams">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Teams
                </Button>
              </Link>
              <Link href="/protected/routes">
                <Button variant="outline" className="w-full justify-start">
                  <RouteIcon className="mr-2 h-4 w-4" />
                  Manage Routes
                </Button>
              </Link>
              <Link href="/protected/locations">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Manage Locations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
  const isOfficer = userData.role === "officer";
  const agencyName = (userData.agency as any)?.name || "Unknown Agency";

  if (isOfficer) {
    // Officer-specific dashboard
    // Get officer statistics
    const [
      myInfringementsResult,
      thisWeekResult,
      pendingResult,
    ] = await Promise.all([
      // Total infringements by this officer
      supabase
        .from("infringements")
        .select("id", { count: "exact", head: true })
        .eq("officer_id", user.id),
      // This week's infringements
      supabase
        .from("infringements")
        .select("id", { count: "exact", head: true })
        .eq("officer_id", user.id)
        .gte("issued_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      // Pending reviews
      supabase
        .from("infringements")
        .select("id", { count: "exact", head: true })
        .eq("officer_id", user.id)
        .eq("status", "pending"),
    ]);

    // Calculate approval rate
    const approvedInfringementsResult = await supabase
      .from("infringements")
      .select("id", { count: "exact", head: true })
      .eq("officer_id", user.id)
      .eq("status", "approved");

    const totalProcessed = (myInfringementsResult.count || 0) - (pendingResult.count || 0);
    const approvalRate = totalProcessed > 0
      ? Math.round(((approvedInfringementsResult.count || 0) / totalProcessed) * 100)
      : 0;

    // Get recent infringements by this officer
    const { data: recentInfringements } = await supabase
      .from("infringements")
      .select(`
        id,
        vehicle_id,
        issued_at,
        status,
        type:infringement_types(name)
      `)
      .eq("officer_id", user.id)
      .order("issued_at", { ascending: false })
      .limit(10);

    // Get today's assignment (team and route)
    const { data: teamMembership } = await supabase
      .from("team_members")
      .select(`
        team:teams (
          id,
          name,
          team_routes (
            route:routes (
              id,
              name,
              start_location:locations!routes_start_location_id_fkey (name),
              end_location:locations!routes_end_location_id_fkey (name)
            )
          )
        )
      `)
      .eq("user_id", user.id)
      .limit(1)
      .single();

    return (
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Officer {userData.position || user.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            {agencyName}
          </p>
        </div>

        {/* Officer Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Infringements</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myInfringementsResult.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisWeekResult.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingResult.count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRate}%</div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Assignment */}
        {teamMembership && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Assignment</CardTitle>
              <CardDescription>
                Your current team and route assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Team</p>
                    <p className="text-sm text-muted-foreground">
                      {(teamMembership.team as any)?.name || "Not assigned"}
                    </p>
                  </div>
                </div>
                {(teamMembership.team as any)?.team_routes?.[0] && (
                  <div className="flex items-center gap-3">
                    <RouteIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Route</p>
                      <p className="text-sm text-muted-foreground">
                        {(teamMembership.team as any).team_routes[0].route?.name || "Not assigned"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(teamMembership.team as any).team_routes[0].route?.start_location?.name} →{" "}
                        {(teamMembership.team as any).team_routes[0].route?.end_location?.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Infringements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Recent Infringements</CardTitle>
                <CardDescription>
                  Last 10 infringements you've recorded
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
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        infringement.status === 'approved' ? 'bg-green-100 text-green-700' :
                        infringement.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        <FileText className="h-5 w-5" />
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
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        infringement.status === 'approved' ? 'bg-green-100 text-green-700' :
                        infringement.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {infringement.status}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(infringement.issued_at).toLocaleDateString()}
                      </div>
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
      </div>
    );
  }

  // Agency Admin dashboard
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

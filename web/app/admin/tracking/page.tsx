import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapComponent } from "@/components/maps/map-component";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Gauge, User } from "lucide-react";

export default async function TrackingPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!profile || !["super_admin", "agency_admin"].includes(profile.role)) {
    redirect("/protected");
  }

  // Fetch latest GPS tracking data
  // We need to get the most recent position for each officer
  let trackingQuery = supabase
    .from("gps_tracking")
    .select(
      `
      *,
      user:users (
        id,
        full_name,
        position,
        role,
        agency_id
      )
    `
    )
    .order("tracked_at", { ascending: false })
    .limit(1000); // Get recent entries

  // Filter by agency for agency admins
  if (profile.role === "agency_admin" && profile.agency_id) {
    trackingQuery = trackingQuery.eq("user.agency_id", profile.agency_id);
  }

  const { data: trackingData } = await trackingQuery;

  // Get only the latest position for each officer
  const latestPositions: Record<string, any> = {};
  
  if (trackingData) {
    for (const track of trackingData) {
      if (!latestPositions[track.user_id] || 
          new Date(track.tracked_at) > new Date(latestPositions[track.user_id].tracked_at)) {
        latestPositions[track.user_id] = track;
      }
    }
  }

  const officers = Object.values(latestPositions);

  // Calculate stats
  const activeOfficers = officers.filter(o => {
    const lastUpdate = new Date(o.tracked_at);
    const now = new Date();
    const minutesAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    return minutesAgo <= 15; // Active within last 15 minutes
  }).length;

  const totalOfficers = officers.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GPS Officer Tracking</h1>
        <p className="text-muted-foreground mt-2">
          Real-time location monitoring for field officers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Officers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOfficers}</div>
            <p className="text-xs text-muted-foreground">
              Updated within 15 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracked</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOfficers}</div>
            <p className="text-xs text-muted-foreground">
              Officers with GPS data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOfficers > 0 ? Math.round((activeOfficers / totalOfficers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Officers currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Officer Locations</CardTitle>
          <CardDescription>
            Real-time GPS positions of field officers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {officers.length > 0 ? (
            <MapComponent
              center={{ lat: -18.1416, lng: 178.4419 }} // Suva, Fiji
              zoom={12}
              markers={officers.map((officer: any) => {
                const lastUpdate = new Date(officer.tracked_at);
                const now = new Date();
                const minutesAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
                const isActive = minutesAgo <= 15;

                return {
                  id: officer.user_id,
                  position: {
                    lat: officer.latitude,
                    lng: officer.longitude,
                  },
                  title: `${officer.user?.full_name || officer.user?.position || "Officer"} - ${officer.speed || 0} km/h`,
                  onClick: () => {
                    // Could open officer detail modal
                  },
                };
              })}
              height="600px"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No GPS Data Available</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                GPS tracking data will appear here once officers start using the mobile app
                with location services enabled.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Officer List */}
      <Card>
        <CardHeader>
          <CardTitle>Officer Details</CardTitle>
          <CardDescription>
            Detailed information about tracked officers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {officers.length > 0 ? (
            <div className="space-y-3">
              {officers.map((officer: any) => {
                const lastUpdate = new Date(officer.tracked_at);
                const now = new Date();
                const minutesAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
                const isActive = minutesAgo <= 15;

                return (
                  <div
                    key={officer.user_id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {officer.user?.full_name || officer.user?.position || "Unknown Officer"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {officer.user?.position || "Officer"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {officer.latitude.toFixed(6)}, {officer.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Gauge className="h-3 w-3" />
                        <span>{officer.speed || 0} km/h</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {minutesAgo < 1
                            ? "Just now"
                            : minutesAgo < 60
                            ? `${minutesAgo}m ago`
                            : `${Math.floor(minutesAgo / 60)}h ago`}
                        </span>
                      </div>
                      {officer.accuracy && (
                        <p className="text-xs text-muted-foreground">
                          ±{Math.round(officer.accuracy)}m accuracy
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No officers are currently being tracked
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

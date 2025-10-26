import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapComponent } from "@/components/maps/map-component";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

export default async function RoutesMapPage() {
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

  // Fetch routes with coverage areas
  let routesQuery = supabase
    .from("routes")
    .select(
      `
      *,
      agency:agencies(id, name)
    `
    )
    .order("name");

  // Agency admins only see their agency's routes
  if (profile.role === "agency_admin" && profile.agency_id) {
    routesQuery = routesQuery.eq("agency_id", profile.agency_id);
  }

  const { data: routes } = await routesQuery;

  // Transform routes to polygons format
  const polygons: Array<{
    id: string;
    path: Array<{ lat: number; lng: number }>;
    name: string;
    strokeColor?: string;
    fillColor?: string;
  }> = [];

  if (routes) {
    routes.forEach((route: any) => {
      // Add route coverage area as polygon
      if (route.coverage_area && Array.isArray(route.coverage_area) && route.coverage_area.length >= 3) {
        polygons.push({
          id: route.id,
          path: route.coverage_area,
          name: route.name,
          strokeColor: '#2563eb', // Blue
          fillColor: '#3b82f680', // Blue with transparency
        });
      }
    });
  }

  const routesWithCoverage = routes?.filter(
    (r: any) => r.coverage_area && Array.isArray(r.coverage_area) && r.coverage_area.length >= 3
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/routes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Routes
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Routes Map View</h1>
          <p className="text-muted-foreground mt-2">
            Visualize patrol routes and their locations
          </p>
        </div>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Route Coverage Areas</CardTitle>
          <CardDescription>
            {routesWithCoverage && routesWithCoverage.length > 0
              ? `Showing ${routesWithCoverage.length} route${routesWithCoverage.length === 1 ? "" : "s"} with coverage areas`
              : "No routes with coverage areas defined"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {polygons.length > 0 ? (
            <MapComponent
              center={{ lat: -18.1416, lng: 178.4419 }} // Suva, Fiji
              zoom={11}
              polygons={polygons}
              height="600px"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Route Coverage Areas Found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Routes will appear on the map once their coverage areas have been defined.
                Create routes and draw polygon coverage areas to see them here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Routes List */}
      <Card>
        <CardHeader>
          <CardTitle>Route Details</CardTitle>
          <CardDescription>
            Information about patrol route coverage areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {routes && routes.length > 0 ? (
            <div className="space-y-4">
              {routes.map((route: any) => {
                const hasCoverage = route.coverage_area && Array.isArray(route.coverage_area) && route.coverage_area.length >= 3;

                return (
                  <div
                    key={route.id}
                    className={`rounded-lg border p-4 ${!hasCoverage ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold">{route.name}</h3>
                          {route.description && (
                            <p className="text-sm text-muted-foreground">{route.description}</p>
                          )}
                        </div>

                        {hasCoverage ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
                              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm text-blue-700 dark:text-blue-300">
                                Coverage area defined ({route.coverage_area.length} points)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                            ⚠️ This route has no coverage area and won't appear on the map
                          </p>
                        )}
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <p>{route.agency?.name || "No Agency"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No routes found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

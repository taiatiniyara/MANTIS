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

  // Fetch routes with their start and end locations
  let routesQuery = supabase
    .from("routes")
    .select(
      `
      *,
      agency:agencies(id, name),
      start_location:locations!routes_start_location_id_fkey(id, name, latitude, longitude, address),
      end_location:locations!routes_end_location_id_fkey(id, name, latitude, longitude, address)
    `
    )
    .order("name");

  // Agency admins only see their agency's routes
  if (profile.role === "agency_admin" && profile.agency_id) {
    routesQuery = routesQuery.eq("agency_id", profile.agency_id);
  }

  const { data: routes } = await routesQuery;

  // Create markers for all start and end locations
  const markers: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    onClick?: () => void;
  }> = [];

  if (routes) {
    routes.forEach((route: any) => {
      // Add start location marker
      if (route.start_location?.latitude && route.start_location?.longitude) {
        markers.push({
          id: `start-${route.id}`,
          position: {
            lat: route.start_location.latitude,
            lng: route.start_location.longitude,
          },
          title: `${route.name} - Start: ${route.start_location.name}`,
        });
      }

      // Add end location marker
      if (route.end_location?.latitude && route.end_location?.longitude) {
        markers.push({
          id: `end-${route.id}`,
          position: {
            lat: route.end_location.latitude,
            lng: route.end_location.longitude,
          },
          title: `${route.name} - End: ${route.end_location.name}`,
        });
      }
    });
  }

  const routesWithLocations = routes?.filter(
    (r: any) =>
      (r.start_location?.latitude && r.start_location?.longitude) ||
      (r.end_location?.latitude && r.end_location?.longitude)
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
          <CardTitle>Route Locations</CardTitle>
          <CardDescription>
            {routesWithLocations && routesWithLocations.length > 0
              ? `Showing ${routesWithLocations.length} route${routesWithLocations.length === 1 ? "" : "s"} with GPS coordinates`
              : "No routes with location data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {markers.length > 0 ? (
            <MapComponent
              center={{ lat: -18.1416, lng: 178.4419 }} // Suva, Fiji
              zoom={11}
              markers={markers}
              height="600px"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Route Locations Found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Routes will appear on the map once their start and end locations have GPS coordinates.
                Make sure to add latitude and longitude to location records.
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
            Information about patrol routes and their locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {routes && routes.length > 0 ? (
            <div className="space-y-4">
              {routes.map((route: any) => {
                const hasStartGPS = route.start_location?.latitude && route.start_location?.longitude;
                const hasEndGPS = route.end_location?.latitude && route.end_location?.longitude;
                const hasAnyGPS = hasStartGPS || hasEndGPS;

                return (
                  <div
                    key={route.id}
                    className={`rounded-lg border p-4 ${!hasAnyGPS ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold">{route.name}</h3>
                          {route.description && (
                            <p className="text-sm text-muted-foreground">{route.description}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {/* Start Location */}
                          <div>
                            <p className="font-medium text-muted-foreground">Start Location</p>
                            <p>{route.start_location?.name || "Not set"}</p>
                            {hasStartGPS && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {route.start_location.latitude.toFixed(4)}, {route.start_location.longitude.toFixed(4)}
                              </p>
                            )}
                          </div>

                          {/* End Location */}
                          <div>
                            <p className="font-medium text-muted-foreground">End Location</p>
                            <p>{route.end_location?.name || "Not set"}</p>
                            {hasEndGPS && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {route.end_location.latitude.toFixed(4)}, {route.end_location.longitude.toFixed(4)}
                              </p>
                            )}
                          </div>
                        </div>

                        {!hasAnyGPS && (
                          <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                            ⚠️ This route has no GPS coordinates and won't appear on the map
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

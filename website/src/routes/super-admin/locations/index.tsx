import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Location } from "@/lib/supabase/schema";
import { useState, useMemo } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Plus } from "lucide-react";

export const Route = createFileRoute("/super-admin/locations/")({
  component: RouteComponent,
});

interface LocationWithCoords extends Location {
  coordinates?: { lat: number; lng: number };
}

function parseGeometry(
  geom: string | null,
): { lat: number; lng: number } | null {
  if (!geom) return null;
  try {
    const parsed = JSON.parse(geom);
    if (parsed.type === "Point" && parsed.coordinates) {
      return { lng: parsed.coordinates[0], lat: parsed.coordinates[1] };
    }
    // For Polygon, use centroid approximation (first coordinate)
    if (parsed.type === "Polygon" && parsed.coordinates?.[0]?.[0]) {
      return {
        lng: parsed.coordinates[0][0][0],
        lat: parsed.coordinates[0][0][1],
      };
    }
  } catch (e) {
    console.error("Failed to parse geometry:", e);
  }
  return null;
}

function RouteComponent() {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationWithCoords | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: -18.1416, // Default to Fiji
    longitude: 178.4419,
    zoom: 8,
  });

  const {
    data: locations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data as Location[]).map((loc) => ({
        ...loc,
        coordinates: parseGeometry(loc.geom),
      })) as LocationWithCoords[];
    },
  });

  const locationsWithCoords = useMemo(
    () => locations?.filter((loc) => loc.coordinates) || [],
    [locations],
  );

  // Center map on locations once when data first loads
  useMemo(() => {
    if (locationsWithCoords.length > 0 && !hasInitialized) {
      const avgLat =
        locationsWithCoords.reduce(
          (sum, loc) => sum + (loc.coordinates?.lat || 0),
          0,
        ) / locationsWithCoords.length;
      const avgLng =
        locationsWithCoords.reduce(
          (sum, loc) => sum + (loc.coordinates?.lng || 0),
          0,
        ) / locationsWithCoords.length;
      setViewState((prev) => ({
        ...prev,
        latitude: avgLat,
        longitude: avgLng,
      }));
      setHasInitialized(true);
    }
  }, [locationsWithCoords, hasInitialized]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Locations</h1>
            <p className="text-muted-foreground">
              {locationsWithCoords.length} location
              {locationsWithCoords.length !== 1 ? "s" : ""} on map
            </p>
          </div>
          <Link to="/super-admin/locations/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </Link>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          mapLib={maplibregl}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          <NavigationControl position="top-right" />

          {/* Markers */}
          {locationsWithCoords.map((location) => (
            <Marker
              key={location.id}
              latitude={location.coordinates!.lat}
              longitude={location.coordinates!.lng}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedLocation(location);
              }}
            >
              <button
                className="transform hover:scale-110 transition-transform cursor-pointer"
                aria-label={`View ${location.name}`}
              >
                <MapPin className="w-6 h-6 text-primary fill-primary/20" />
              </button>
            </Marker>
          ))}

          {/* Popup */}
          {selectedLocation && selectedLocation.coordinates && (
            <Popup
              latitude={selectedLocation.coordinates.lat}
              longitude={selectedLocation.coordinates.lng}
              onClose={() => setSelectedLocation(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-2 min-w-50">
                <h3 className="font-bold text-lg mb-2">
                  {selectedLocation.name}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedLocation.type}</Badge>
                  </div>
                  {selectedLocation.agency_id && (
                    <p className="text-muted-foreground">
                      Agency ID: {selectedLocation.agency_id}
                    </p>
                  )}
                  {selectedLocation.parent_id && (
                    <p className="text-muted-foreground">
                      Parent ID: {selectedLocation.parent_id}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground pt-2">
                    Lat: {selectedLocation.coordinates.lat.toFixed(4)}, Lng:{" "}
                    {selectedLocation.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Sidebar with location list */}
        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur rounded-lg shadow-lg max-h-[calc(100vh-8rem)] overflow-auto max-w-xs">
          <div className="p-4">
            <h2 className="font-semibold mb-3">All Locations</h2>
            <div className="space-y-2">
              {locations?.map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    const coords = location.coordinates;
                    if (coords) {
                      setViewState((prev) => ({
                        ...prev,
                        latitude: coords.lat,
                        longitude: coords.lng,
                        zoom: 12,
                      }));
                      setSelectedLocation(location);
                    }
                  }}
                  className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin
                      className={`w-4 h-4 mt-0.5 shrink-0 ${location.coordinates ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {location.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {location.type}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {locations?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No locations yet. Create one to get started.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

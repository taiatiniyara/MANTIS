"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapComponent } from "@/components/maps/map-component";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { MapPin, ArrowLeft, MapIcon, Pencil, X, Save } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface Agency {
  id: string;
  name: string;
}

interface PolygonPoint {
  lat: number;
  lng: number;
}

interface ExistingRoute {
  id: string;
  name: string;
  coverage_area?: PolygonPoint[];
}

interface CreateRouteFormProps {
  agencies: Agency[];
  userRole: string;
  userAgencyId: string | null;
}

export function CreateRouteForm({
  agencies,
  userRole,
  userAgencyId,
}: CreateRouteFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agencyId, setAgencyId] = useState<string>(
    userRole === "agency_admin" && userAgencyId ? userAgencyId : ""
  );
  const [polygonPoints, setPolygonPoints] = useState<PolygonPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [existingRoutes, setExistingRoutes] = useState<ExistingRoute[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  // Determine back link based on user role
  const backLink = userRole === "super_admin" ? "/admin/routes" : "/protected/routes";

  // Fetch existing routes when agency changes
  useEffect(() => {
    if (agencyId) {
      fetchExistingRoutes();
    }
  }, [agencyId]);

  const fetchExistingRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("routes")
        .select("id, name, coverage_area")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExistingRoutes((data as any) || []);
    } catch (error) {
      console.error("Error fetching existing routes:", error);
    }
  };

  // Handle map clicks to add polygon vertices
  const handleMapClick = (lat: number, lng: number) => {
    if (!isDrawing) return;
    
    const newPoint: PolygonPoint = { lat, lng };
    setPolygonPoints([...polygonPoints, newPoint]);
    
    toast({
      title: "Point Added",
      description: `Vertex ${polygonPoints.length + 1}: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  };

  // Remove last polygon point
  const removeLastPoint = () => {
    if (polygonPoints.length > 0) {
      setPolygonPoints(polygonPoints.slice(0, -1));
      toast({
        title: "Point Removed",
        description: "Last vertex removed",
      });
    }
  };

  // Clear all points
  const clearPolygon = () => {
    setPolygonPoints([]);
    setIsDrawing(false);
    toast({
      title: "Polygon Cleared",
      description: "All vertices removed",
    });
  };

  // Start drawing mode
  const startDrawing = () => {
    setIsDrawing(true);
    setPolygonPoints([]);
    toast({
      title: "Drawing Mode Activated",
      description: "Click on the map to add polygon vertices",
    });
  };

  // Complete the polygon
  const completePolygon = () => {
    if (polygonPoints.length < 3) {
      toast({
        title: "Polygon Too Small",
        description: "A polygon needs at least 3 points",
        variant: "destructive",
      });
      return;
    }
    setIsDrawing(false);
    toast({
      title: "Polygon Complete",
      description: `Coverage area defined with ${polygonPoints.length} vertices`,
    });
  };

  // Memoize map center to prevent re-initialization
  const mapCenter = useMemo(() => {
    if (polygonPoints.length > 0) {
      return { lat: polygonPoints[0].lat, lng: polygonPoints[0].lng };
    }
    return { lat: -18.1416, lng: 178.4419 }; // Suva, Fiji default
  }, [polygonPoints.length > 0 ? polygonPoints[0] : null]);

  // Memoize map markers to prevent unnecessary re-renders
  const mapMarkers = useMemo(() => {
    return polygonPoints.map((point, index) => ({
      id: `vertex-${index}`,
      position: { lat: point.lat, lng: point.lng },
      title: `Vertex ${index + 1}`,
    }));
  }, [polygonPoints]);

  // Memoize polygon overlays to prevent unnecessary re-renders
  const polygonOverlays = useMemo(() => {
    const overlays = existingRoutes
      .filter(route => route.coverage_area && route.coverage_area.length >= 3)
      .map(route => ({
        id: route.id,
        path: route.coverage_area!,
        strokeColor: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        title: route.name,
      }));

    // Add current polygon being drawn
    if (polygonPoints.length >= 2) {
      overlays.push({
        id: 'current-polygon',
        path: polygonPoints,
        strokeColor: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.3,
        title: 'New Coverage Area',
      });
    }

    return overlays;
  }, [existingRoutes, polygonPoints]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (polygonPoints.length < 3) {
      toast({
        title: "Invalid Coverage Area",
        description: "Please define a coverage area with at least 3 points",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      // Create the route with coverage area
      const { error } = await supabase
        .from("routes")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          agency_id: agencyId || null,
          coverage_area: polygonPoints,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Route created with ${polygonPoints.length} vertices`,
      });

      router.push(backLink);
      router.refresh();
    } catch (error) {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "Failed to create route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backLink}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Routes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Route</h1>
            <p className="text-muted-foreground mt-1">
              Define a patrol coverage area by drawing a polygon on the map
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Instructions Card */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapIcon className="h-5 w-5" />
                How to Draw a Coverage Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Fill in the route name below</li>
                <li>Click the <strong>"Start Drawing Polygon"</strong> button</li>
                <li>Click on the map to add corner points (minimum 3 points)</li>
                <li>The area will fill in automatically as you add points</li>
                <li>Click <strong>"Complete Polygon"</strong> when done</li>
                <li>Click <strong>"Create Route"</strong> to save</li>
              </ol>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                💡 Tip: Use "Undo Last" to remove mistakes while drawing
              </p>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Route Details</CardTitle>
              <CardDescription>
                Basic information about the patrol route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="route-name">Route Name *</Label>
                  <Input
                    id="route-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Downtown Patrol Zone"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="route-description">Description</Label>
                  <Textarea
                    id="route-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this coverage area..."
                    rows={4}
                  />
                </div>

                {userRole === "super_admin" && (
                  <div className="grid gap-2">
                    <Label htmlFor="route-agency">Agency *</Label>
                    <Select value={agencyId} onValueChange={setAgencyId} required>
                      <SelectTrigger id="route-agency">
                        <SelectValue placeholder="Select agency" />
                      </SelectTrigger>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            {agency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Drawing Controls */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label>Drawing Tools</Label>
                    <Badge variant={isDrawing ? "default" : "secondary"}>
                      {isDrawing ? "✏️ Drawing" : "Ready"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isDrawing ? (
                      <Button
                        type="button"
                        onClick={startDrawing}
                        variant="default"
                        className="flex-1"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Start Drawing Polygon
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          onClick={completePolygon}
                          variant="default"
                          className="flex-1"
                          disabled={polygonPoints.length < 3}
                        >
                          Complete Polygon ({polygonPoints.length} points)
                        </Button>
                        <Button
                          type="button"
                          onClick={removeLastPoint}
                          variant="outline"
                          disabled={polygonPoints.length === 0}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Undo Last
                        </Button>
                        <Button
                          type="button"
                          onClick={clearPolygon}
                          variant="destructive"
                        >
                          Clear All
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {polygonPoints.length} vertex{polygonPoints.length !== 1 ? 'es' : ''} added
                    </span>
                  </div>
                </div>

                {/* Status Messages */}
                {polygonPoints.length === 0 && !isDrawing && (
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    👆 <strong>Step 1:</strong> Click "Start Drawing Polygon" above to begin
                  </div>
                )}
                
                {polygonPoints.length > 0 && polygonPoints.length < 3 && isDrawing && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                    📍 <strong>{polygonPoints.length} of 3 points added.</strong> Keep clicking the map to add more corner points.
                  </div>
                )}

                {polygonPoints.length >= 3 && isDrawing && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm text-green-800 dark:text-green-200">
                    ✅ <strong>Polygon ready!</strong> Click "Complete Polygon" above, or add more points for detail.
                  </div>
                )}

                {polygonPoints.length >= 3 && !isDrawing && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm text-green-800 dark:text-green-200">
                    ✅ <strong>Coverage area defined with {polygonPoints.length} points.</strong> Click "Create Route" below to save.
                  </div>
                )}

                {existingRoutes.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                    ℹ️ <strong>Existing routes shown in blue on map</strong> - {existingRoutes.length} route(s)
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Link href={backLink} className="flex-1">
                    <Button type="button" variant="outline" className="w-full" disabled={loading}>
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={loading || polygonPoints.length < 3 || isDrawing}
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Creating..." : "Create Route"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Map */}
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Coverage Area Map</span>
                <Badge variant="outline">
                  {polygonPoints.length} point{polygonPoints.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
              <CardDescription>
                {isDrawing 
                  ? "Click on the map to add polygon vertices. At least 3 points needed."
                  : "Click 'Start Drawing Polygon' to define the coverage area"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="w-full h-full min-h-[500px]">
                <MapComponent
                  markers={mapMarkers}
                  polygons={polygonOverlays}
                  center={mapCenter}
                  zoom={13}
                  height="100%"
                  onMapClick={handleMapClick}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Route, Search, GripVertical, MapPin, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface RouteItem {
  id: string;
  name: string;
  description: string | null;
  coverage_area?: any;
}

interface Team {
  id: string;
  name: string;
  agency_id: string | null;
  agency?: {
    name: string;
  } | null;
}

interface TeamRoute {
  route_id: string;
  route: RouteItem;
}

interface ManageTeamRoutesPageProps {
  team: Team;
  userRole: string;
}

export function ManageTeamRoutesPage({
  team,
  userRole,
}: ManageTeamRoutesPageProps) {
  const [teamRoutes, setTeamRoutes] = useState<TeamRoute[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<RouteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedRoute, setDraggedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const backLink = userRole === "super_admin" ? "/admin/teams" : "/protected/teams";

  useEffect(() => {
    fetchTeamRoutes();
    fetchAvailableRoutes();
  }, [team.id]);

  const fetchTeamRoutes = async () => {
    try {
      // First get the team route IDs
      const { data: routeData, error: routeError } = await supabase
        .from("team_routes")
        .select("route_id")
        .eq("team_id", team.id);

      if (routeError) {
        console.error("Supabase error:", routeError);
        throw routeError;
      }

      if (!routeData || routeData.length === 0) {
        setTeamRoutes([]);
        return;
      }

      // Then get the full route details
      const routeIds = routeData.map((r) => r.route_id);
      const { data: fullRoutes, error: fullRoutesError } = await supabase
        .from("routes")
        .select("id, name, description, coverage_area")
        .in("id", routeIds);

      if (fullRoutesError) {
        console.error("Route fetch error:", fullRoutesError);
        throw fullRoutesError;
      }

      // Transform to match the expected structure
      const transformedData = routeData.map((routeItem) => ({
        route_id: routeItem.route_id,
        route: fullRoutes?.find((r) => r.id === routeItem.route_id),
      }));

      setTeamRoutes(transformedData as any);
    } catch (error) {
      console.error("Error fetching team routes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch team routes",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableRoutes = async () => {
    try {
      let query = supabase
        .from("routes")
        .select("id, name, description, coverage_area")
        .order("name");

      if (team.agency_id) {
        query = query.eq("agency_id", team.agency_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAvailableRoutes((data as any) || []);
    } catch (error) {
      console.error("Error fetching available routes:", error);
    }
  };

  const handleAddRoute = async (routeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("team_routes").insert({
        team_id: team.id,
        route_id: routeId,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Assigned",
            description: "This route is already assigned to this team",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Route assigned to team",
      });

      fetchTeamRoutes();
      router.refresh();
    } catch (error: any) {
      console.error("Error adding route:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign route",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRoute = async (routeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("team_routes")
        .delete()
        .eq("team_id", team.id)
        .eq("route_id", routeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route removed from team",
      });

      fetchTeamRoutes();
      router.refresh();
    } catch (error) {
      console.error("Error removing route:", error);
      toast({
        title: "Error",
        description: "Failed to remove route",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, routeId: string) => {
    setDraggedRoute(routeId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropToTeam = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedRoute) {
      handleAddRoute(draggedRoute);
      setDraggedRoute(null);
    }
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedRoute) {
      handleRemoveRoute(draggedRoute);
      setDraggedRoute(null);
    }
  };

  // Filter routes
  const assignedRouteIds = teamRoutes.map((tr) => tr.route_id);
  const unassignedRoutes = availableRoutes.filter((route) => {
    const notAssigned = !assignedRouteIds.includes(route.id);
    const matchesSearch = searchTerm === "" ||
      route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return notAssigned && matchesSearch;
  });

  const filteredTeamRoutes = teamRoutes.filter((tr) => {
    if (searchTerm === "") return true;
    return (
      tr.route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.route.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backLink}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Route className="h-8 w-8" />
              Manage Team Routes
            </h1>
            <p className="text-muted-foreground mt-1">
              {team.name} {team.agency && `• ${team.agency.name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-base">How to Assign Routes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• <strong>Drag & Drop:</strong> Drag routes from "Available Routes" to "Assigned Routes" to add them</p>
          <p>• <strong>Remove:</strong> Drag routes from "Assigned Routes" back to "Available Routes" to remove them</p>
          <p>• <strong>Quick Add:</strong> Click the <Plus className="inline h-4 w-4" /> icon on any available route</p>
          <p>• <strong>Search:</strong> Use the search box to filter routes by name or description</p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search routes by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Routes</span>
              <Badge variant="outline">{unassignedRoutes.length}</Badge>
            </CardTitle>
            <CardDescription>
              Drag routes to the assigned area or click the add icon
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto"
            onDragOver={handleDragOver}
            onDrop={handleDropToAvailable}
          >
            {unassignedRoutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Route className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">No available routes</p>
                <p className="text-xs mt-1">All routes are already assigned to this team</p>
              </div>
            ) : (
              unassignedRoutes.map((route) => (
                <div
                  key={route.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, route.id)}
                  className={`group flex items-center justify-between p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors ${
                    draggedRoute === route.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{route.name}</span>
                        {route.coverage_area && route.coverage_area.length >= 3 && (
                          <Badge variant="secondary" className="text-xs">
                            {route.coverage_area.length} points
                          </Badge>
                        )}
                      </div>
                      {route.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 ml-6">
                          {route.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddRoute(route.id)}
                    disabled={loading}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Assigned Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Assigned Routes</span>
              <Badge variant="default">{filteredTeamRoutes.length}</Badge>
            </CardTitle>
            <CardDescription>
              Routes assigned to this team. Drag them out to remove.
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto bg-primary/5"
            onDragOver={handleDragOver}
            onDrop={handleDropToTeam}
          >
            {filteredTeamRoutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Route className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">No routes assigned yet</p>
                <p className="text-xs mt-1">Drag routes here to assign them to the team</p>
              </div>
            ) : (
              filteredTeamRoutes.map((teamRoute) => (
                <div
                  key={teamRoute.route_id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, teamRoute.route_id)}
                  className={`group flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors bg-background ${
                    draggedRoute === teamRoute.route_id ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium truncate">{teamRoute.route.name}</span>
                      {teamRoute.route.coverage_area && teamRoute.route.coverage_area.length >= 3 && (
                        <Badge variant="secondary" className="text-xs">
                          {teamRoute.route.coverage_area.length} points
                        </Badge>
                      )}
                    </div>
                    {teamRoute.route.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 ml-6">
                        {teamRoute.route.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

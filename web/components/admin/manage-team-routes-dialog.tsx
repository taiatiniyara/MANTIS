"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Route {
  id: string;
  name: string;
  description: string | null;
  location: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface TeamRoute {
  route_id: string;
  route: Route;
}

interface ManageTeamRoutesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: {
    id: string;
    name: string;
    agency_id: string | null;
  };
}

export function ManageTeamRoutesDialog({
  open,
  onOpenChange,
  team,
}: ManageTeamRoutesDialogProps) {
  const [assignedRoutes, setAssignedRoutes] = useState<TeamRoute[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    if (open) {
      fetchAssignedRoutes();
      fetchAvailableRoutes();
    }
  }, [open, team.id]);

  async function fetchAssignedRoutes() {
    const { data, error } = await supabase
      .from("team_routes")
      .select(
        `
        route_id,
        route:routes (
          id,
          name,
          description,
          location:locations (
            id,
            name,
            type
          )
        )
      `
      )
      .eq("team_id", team.id);

    if (error) {
      toast.error("Failed to load assigned routes");
      console.error(error);
      return;
    }

    setAssignedRoutes((data as any) || []);
  }

  async function fetchAvailableRoutes() {
    // Fetch all routes for the team's agency
    let query = supabase
      .from("routes")
      .select(
        `
        id,
        name,
        description,
        location:locations (
          id,
          name,
          type
        )
      `
      )
      .order("name");

    // Filter by agency if team has one
    if (team.agency_id) {
      query = query.eq("agency_id", team.agency_id);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load available routes");
      console.error(error);
      return;
    }

    setAvailableRoutes((data as any) || []);
  }

  async function handleAddRoute() {
    if (!selectedRouteId) return;

    setLoading(true);

    const { error } = await supabase.from("team_routes").insert({
      team_id: team.id,
      route_id: selectedRouteId,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("This route is already assigned to this team");
      } else {
        toast.error("Failed to assign route");
        console.error(error);
      }
    } else {
      toast.success("Route assigned successfully");
      setSelectedRouteId("");
      fetchAssignedRoutes();
    }

    setLoading(false);
  }

  async function handleRemoveRoute(routeId: string) {
    setLoading(true);

    const { error } = await supabase
      .from("team_routes")
      .delete()
      .eq("team_id", team.id)
      .eq("route_id", routeId);

    if (error) {
      toast.error("Failed to remove route");
      console.error(error);
    } else {
      toast.success("Route removed successfully");
      fetchAssignedRoutes();
    }

    setLoading(false);
  }

  // Filter out already assigned routes
  const unassignedRoutes = availableRoutes.filter(
    (route) =>
      !assignedRoutes.some((assigned) => assigned.route.id === route.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Routes - {team.name}</DialogTitle>
          <DialogDescription>
            Assign or remove routes for this team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Routes */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              Assigned Routes ({assignedRoutes.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {assignedRoutes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No routes assigned yet
                </p>
              ) : (
                assignedRoutes.map((teamRoute) => (
                  <div
                    key={teamRoute.route_id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{teamRoute.route.name}</p>
                        {teamRoute.route.location && (
                          <Badge variant="outline" className="text-xs">
                            {teamRoute.route.location.name}
                          </Badge>
                        )}
                      </div>
                      {teamRoute.route.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {teamRoute.route.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRoute(teamRoute.route_id)}
                      disabled={loading}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Route */}
          <div>
            <h4 className="text-sm font-medium mb-3">Add Route</h4>
            <div className="flex gap-2">
              <Select
                value={selectedRouteId}
                onValueChange={setSelectedRouteId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a route..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedRoutes.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No available routes
                    </div>
                  ) : (
                    unassignedRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        <div className="flex items-center gap-2">
                          <span>{route.name}</span>
                          {route.location && (
                            <span className="text-xs text-muted-foreground">
                              ({route.location.name})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddRoute}
                disabled={!selectedRouteId || loading}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

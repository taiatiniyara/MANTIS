"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Route, Pencil, Trash2 } from "lucide-react";
import { EditRouteDialog } from "./edit-route-dialog";
import { DeleteRouteDialog } from "./delete-route-dialog";
import { useState } from "react";

type LocationType = 'division' | 'station' | 'post' | 'region' | 'office' | 'council' | 'department' | 'zone';

interface Agency {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  type: LocationType;
  agency_id: string | null;
}

interface Team {
  id: string;
  name: string;
  agency_id: string | null;
}

interface RouteData {
  id: string;
  name: string;
  description: string | null;
  agency_id: string | null;
  location_id: string | null;
  created_at: string;
  agency?: Agency | null;
  location?: Location | null;
}

interface RoutesTableProps {
  routes: RouteData[];
  agencies: Agency[];
  locations: Location[];
  teams: Team[];
  userRole: string;
  userAgencyId: string | null;
}

export function RoutesTable({
  routes,
  agencies,
  locations,
  teams,
  userRole,
  userAgencyId,
}: RoutesTableProps) {
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  const [deletingRoute, setDeletingRoute] = useState<RouteData | null>(null);

  if (routes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Route className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No routes found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating a new route
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {route.name}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {route.description ? (
                    <span className="text-sm text-muted-foreground">
                      {route.description}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      No description
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {route.agency ? (
                    <span className="text-sm">{route.agency.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {route.location ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{route.location.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {route.location.type}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No location
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(route.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingRoute(route)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingRoute(route)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingRoute && (
        <EditRouteDialog
          route={editingRoute}
          agencies={agencies}
          locations={locations}
          userRole={userRole}
          userAgencyId={userAgencyId}
          open={!!editingRoute}
          onOpenChange={(open: boolean) => !open && setEditingRoute(null)}
        />
      )}

      {deletingRoute && (
        <DeleteRouteDialog
          route={deletingRoute}
          open={!!deletingRoute}
          onOpenChange={(open: boolean) => !open && setDeletingRoute(null)}
        />
      )}
    </>
  );
}

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { EditLocationDialog } from "./edit-location-dialog";
import { DeleteLocationDialog } from "./delete-location-dialog";
import { useState } from "react";

type LocationType = 'division' | 'station' | 'post' | 'region' | 'office' | 'council' | 'department' | 'zone';

interface Agency {
  id: string;
  name: string;
}

interface ParentLocation {
  id: string;
  name: string;
  type: LocationType;
}

interface Location {
  id: string;
  name: string;
  type: LocationType;
  agency_id: string | null;
  parent_id: string | null;
  created_at: string;
  agency?: Agency | null;
  parent?: ParentLocation | null;
}

interface LocationsTableProps {
  locations: Location[];
  agencies: Agency[];
  allLocations: Location[];
  userRole: string;
  userAgencyId: string | null;
}

const locationTypeColors: Record<LocationType, string> = {
  division: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  station: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  post: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  region: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  office: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  council: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
  department: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
  zone: "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20",
};

export function LocationsTable({
  locations,
  agencies,
  allLocations,
  userRole,
  userAgencyId,
}: LocationsTableProps) {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  if (locations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No locations found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating a new location
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollableTable maxHeight="calc(100vh - 18rem)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Parent Location</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={locationTypeColors[location.type]}
                  >
                    {location.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {location.agency ? (
                    <span className="text-sm">{location.agency.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {location.parent ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{location.parent.name}</span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {location.parent.type}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Top Level
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(location.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingLocation(location)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingLocation(location)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollableTable>

      {editingLocation && (
        <EditLocationDialog
          location={editingLocation}
          agencies={agencies}
          locations={allLocations}
          userRole={userRole}
          userAgencyId={userAgencyId}
          open={!!editingLocation}
          onOpenChange={(open: boolean) => !open && setEditingLocation(null)}
        />
      )}

      {deletingLocation && (
        <DeleteLocationDialog
          location={deletingLocation}
          open={!!deletingLocation}
          onOpenChange={(open: boolean) => !open && setDeletingLocation(null)}
        />
      )}
    </>
  );
}

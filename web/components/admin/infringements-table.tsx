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
import { Pencil, Trash2, FileText, Eye } from "lucide-react";
import { EditInfringementDialog } from "./edit-infringement-dialog";
import { DeleteInfringementDialog } from "./delete-infringement-dialog";
import { ViewInfringementDialog } from "./view-infringement-dialog";
import { useState } from "react";

interface Agency {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Type {
  id: string;
  code: string;
  name: string;
  category_id: string;
}

interface Team {
  id: string;
  name: string;
  agency_id: string | null;
}

interface Route {
  id: string;
  name: string;
  agency_id: string | null;
}

interface Officer {
  id: string;
  position: string | null;
  role: string;
  agency_id: string | null;
}

interface Infringement {
  id: string;
  officer_id: string;
  agency_id: string | null;
  team_id: string | null;
  route_id: string | null;
  type_id: string;
  vehicle_id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  notes: string | null;
  issued_at: string;
  created_at: string;
  officer: {
    id: string;
    position: string | null;
    role: string;
  };
  agency: {
    id: string;
    name: string;
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
  route: {
    id: string;
    name: string;
  } | null;
  type: {
    id: string;
    code: string;
    name: string;
    fine_amount: number | null;
    demerit_points: number | null;
    gl_code: string;
    category_id: string;
    category: {
      id: string;
      name: string;
    };
  };
}

interface InfringementsTableProps {
  infringements: Infringement[];
  agencies: Agency[];
  categories: Category[];
  types: Type[];
  teams: Team[];
  routes: Route[];
  officers: Officer[];
  userRole: string;
  userAgencyId: string | null;
}

export function InfringementsTable({
  infringements,
  agencies,
  categories,
  types,
  teams,
  routes,
  officers,
  userRole,
  userAgencyId,
}: InfringementsTableProps) {
  const [viewingInfringement, setViewingInfringement] =
    useState<Infringement | null>(null);
  const [editingInfringement, setEditingInfringement] =
    useState<Infringement | null>(null);
  const [deletingInfringement, setDeletingInfringement] =
    useState<Infringement | null>(null);

  if (infringements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No infringements found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Record a new infringement to get started
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
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Officer</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Fine</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {infringements.map((infringement) => (
              <TableRow key={infringement.id}>
                <TableCell className="font-mono font-medium">
                  {infringement.vehicle_id}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {infringement.type.code}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {infringement.type.name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {infringement.officer?.position || "Officer"}
                  </span>
                </TableCell>
                <TableCell>
                  {infringement.team ? (
                    <Badge variant="outline" className="text-xs">
                      {infringement.team.name}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {infringement.route ? (
                    <span className="text-sm">{infringement.route.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {infringement.address ? (
                    <span className="text-sm">
                      {infringement.address}
                    </span>
                  ) : infringement.latitude && infringement.longitude ? (
                    <span className="text-sm text-muted-foreground">
                      {infringement.latitude.toFixed(4)}, {infringement.longitude.toFixed(4)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {infringement.type.fine_amount ? (
                    <span className="font-medium">
                      ${infringement.type.fine_amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(infringement.issued_at).toLocaleDateString()}
                  <br />
                  <span className="text-xs">
                    {new Date(infringement.issued_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingInfringement(infringement)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingInfringement(infringement)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingInfringement(infringement)}
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

      {viewingInfringement && (
        <ViewInfringementDialog
          infringement={viewingInfringement}
          open={!!viewingInfringement}
          onOpenChange={(open: boolean) =>
            !open && setViewingInfringement(null)
          }
        />
      )}

      {editingInfringement && (
        <EditInfringementDialog
          infringement={editingInfringement}
          agencies={agencies}
          categories={categories}
          types={types}
          teams={teams}
          routes={routes}
          officers={officers}
          userRole={userRole}
          userAgencyId={userAgencyId}
          open={!!editingInfringement}
          onOpenChange={(open: boolean) =>
            !open && setEditingInfringement(null)
          }
        />
      )}

      {deletingInfringement && (
        <DeleteInfringementDialog
          infringement={deletingInfringement}
          open={!!deletingInfringement}
          onOpenChange={(open: boolean) =>
            !open && setDeletingInfringement(null)
          }
        />
      )}
    </>
  );
}

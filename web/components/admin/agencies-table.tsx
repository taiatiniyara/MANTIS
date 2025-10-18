"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "@/lib/database.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditAgencyDialog } from "./edit-agency-dialog";
import { DeleteAgencyDialog } from "./delete-agency-dialog";

type Agency = Database["public"]["Tables"]["agencies"]["Row"];

interface AgenciesTableProps {
  agencies: Agency[];
}

export function AgenciesTable({ agencies }: AgenciesTableProps) {
  const router = useRouter();
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);

  if (agencies.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No agencies found. Create your first agency to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencies.map((agency) => (
            <TableRow key={agency.id}>
              <TableCell className="font-medium">{agency.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(agency.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingAgency(agency)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingAgency(agency)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingAgency && (
        <EditAgencyDialog
          agency={editingAgency}
          open={!!editingAgency}
          onOpenChange={(open: boolean) => !open && setEditingAgency(null)}
        />
      )}

      {deletingAgency && (
        <DeleteAgencyDialog
          agency={deletingAgency}
          open={!!deletingAgency}
          onOpenChange={(open: boolean) => !open && setDeletingAgency(null)}
        />
      )}
    </div>
  );
}

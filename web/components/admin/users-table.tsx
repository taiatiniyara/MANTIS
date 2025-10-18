"use client";

import { useState } from "react";
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
import { Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { RoleBadge } from "./role-badge";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

type User = Database["public"]["Tables"]["users"]["Row"] & {
  agencies?: { id: number; name: string } | null;
  locations?: { id: number; name: string } | null;
};

interface UsersTableProps {
  users: User[];
  isSuperAdmin: boolean;
  currentUserId: string;
}

export function UsersTable({ users, isSuperAdmin, currentUserId }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  if (users.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No users found. Create your first user to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position/Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Agency</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.position || "No position set"}
              </TableCell>
              <TableCell>
                <RoleBadge role={user.role as "super_admin" | "agency_admin" | "officer"} />
              </TableCell>
              <TableCell>
                {user.agencies?.name || <span className="text-muted-foreground">No agency</span>}
              </TableCell>
              <TableCell>
                {user.locations?.name || <span className="text-muted-foreground">No location</span>}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(user.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(user)}
                    disabled={!isSuperAdmin && user.id === currentUserId}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingUser(user)}
                    disabled={user.id === currentUserId}
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

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open: boolean) => !open && setEditingUser(null)}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onOpenChange={(open: boolean) => !open && setDeletingUser(null)}
        />
      )}
    </div>
  );
}

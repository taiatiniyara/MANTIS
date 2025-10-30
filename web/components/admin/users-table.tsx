"use client";

import { useState, useMemo } from "react";
import { Database } from "@/lib/database.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { RoleBadge } from "./role-badge";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LocationType = 'division' | 'station' | 'post' | 'region' | 'office' | 'council' | 'department' | 'zone';

type User = Database["public"]["Tables"]["users"]["Row"] & {
  agencies?: { id: string; name: string } | null;
  locations?: { id: string; name: string } | null;
};

interface Agency {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  type: LocationType;
  agency_id: string | null;
  parent?: {
    id: string;
    name: string;
    type: LocationType;
  } | null;
}

interface UsersTableProps {
  users: User[];
  isSuperAdmin: boolean;
  currentUserId: string;
  agencies: Agency[];
  locations: Location[];
}

export function UsersTable({ users, isSuperAdmin, currentUserId, agencies, locations }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (searchTerm && !user.position?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }
      if (agencyFilter !== "all" && user.agency_id !== agencyFilter) {
        return false;
      }
      return true;
    });
  }, [users, searchTerm, roleFilter, agencyFilter]);

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
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="agency_admin">Agency Admin</SelectItem>
            <SelectItem value="officer">Officer</SelectItem>
          </SelectContent>
        </Select>
        {isSuperAdmin && agencies.length > 0 && (
          <Select value={agencyFilter} onValueChange={setAgencyFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by agency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agencies</SelectItem>
              {agencies.map((agency) => (
                <SelectItem key={agency.id} value={agency.id}>
                  {agency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {(searchTerm || roleFilter !== "all" || agencyFilter !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
              setAgencyFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>
      <ScrollableTable maxHeight="calc(100vh - 22rem)">
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
            {filteredUsers.map((user) => (
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
      </ScrollableTable>
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open: boolean) => !open && setEditingUser(null)}
          isSuperAdmin={isSuperAdmin}
          agencies={agencies}
          locations={locations}
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

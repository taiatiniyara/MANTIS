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
import { Users, UserPlus, Pencil, Trash2, Route } from "lucide-react";
import { EditTeamDialog } from "./edit-team-dialog";
import { DeleteTeamDialog } from "./delete-team-dialog";
import { ManageTeamMembersDialog } from "./manage-team-members-dialog";
import { ManageTeamRoutesDialog } from "./manage-team-routes-dialog";
import { useState } from "react";

interface Agency {
  id: string;
  name: string;
}

interface User {
  id: string;
  position: string | null;
  role: string;
  agency_id: string | null;
}

interface Team {
  id: string;
  name: string;
  agency_id: string | null;
  created_at: string;
  agency?: Agency | null;
  team_members?: Array<{ count: number }>;
}

interface TeamsTableProps {
  teams: Team[];
  agencies: Agency[];
  users: User[];
  userRole: string;
  userAgencyId: string | null;
}

export function TeamsTable({
  teams,
  agencies,
  users,
  userRole,
  userAgencyId,
}: TeamsTableProps) {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [managingTeam, setManagingTeam] = useState<Team | null>(null);
  const [managingRoutes, setManagingRoutes] = useState<Team | null>(null);

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No teams found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating a new team
        </p>
      </div>
    );
  }

  // Get member count from the aggregation
  const getMemberCount = (team: Team) => {
    if (team.team_members && team.team_members.length > 0) {
      return team.team_members[0].count || 0;
    }
    return 0;
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {team.name}
                  </div>
                </TableCell>
                <TableCell>
                  {team.agency ? (
                    <span className="text-sm">{team.agency.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getMemberCount(team)} {getMemberCount(team) === 1 ? "member" : "members"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(team.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setManagingTeam(team)}
                      title="Manage members"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setManagingRoutes(team)}
                      title="Manage routes"
                    >
                      <Route className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTeam(team)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingTeam(team)}
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

      {editingTeam && (
        <EditTeamDialog
          team={editingTeam}
          agencies={agencies}
          userRole={userRole}
          userAgencyId={userAgencyId}
          open={!!editingTeam}
          onOpenChange={(open: boolean) => !open && setEditingTeam(null)}
        />
      )}

      {deletingTeam && (
        <DeleteTeamDialog
          team={deletingTeam}
          open={!!deletingTeam}
          onOpenChange={(open: boolean) => !open && setDeletingTeam(null)}
        />
      )}

      {managingTeam && (
        <ManageTeamMembersDialog
          team={managingTeam}
          users={users}
          userAgencyId={userAgencyId}
          open={!!managingTeam}
          onOpenChange={(open: boolean) => !open && setManagingTeam(null)}
        />
      )}

      {managingRoutes && (
        <ManageTeamRoutesDialog
          team={managingRoutes}
          open={!!managingRoutes}
          onOpenChange={(open: boolean) => !open && setManagingRoutes(null)}
        />
      )}
    </>
  );
}

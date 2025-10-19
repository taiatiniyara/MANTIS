"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, X } from "lucide-react";

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
}

interface TeamMember {
  user_id: string;
  users: {
    id: string;
    position: string | null;
    role: string;
  };
}

interface ManageTeamMembersDialogProps {
  team: Team;
  users: User[];
  userAgencyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTeamMembersDialog({
  team,
  users,
  userAgencyId,
  open,
  onOpenChange,
}: ManageTeamMembersDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
    }
  }, [open, team.id]);

  const fetchTeamMembers = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          user_id,
          users:user_id(id, position, role)
        `)
        .eq("team_id", team.id);

      if (error) throw error;
      setTeamMembers((data as any) || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: selectedUserId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added to team",
      });

      setSelectedUserId("");
      fetchTeamMembers();
      router.refresh();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", team.id)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from team",
      });

      fetchTeamMembers();
      router.refresh();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users: only show users from the team's agency (if team has agency)
  // and exclude users already in the team
  const memberIds = teamMembers.map((tm) => tm.user_id);
  const availableUsers = users.filter((user) => {
    const notInTeam = !memberIds.includes(user.id);
    const sameAgency = team.agency_id ? user.agency_id === team.agency_id : true;
    return notInTeam && sameAgency;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Manage Team Members - {team.name}
          </DialogTitle>
          <DialogDescription>
            Add or remove members from this team
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Current Members */}
          <div className="grid gap-2">
            <Label>Current Members ({teamMembers.length})</Label>
            {teamMembers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No members in this team yet
              </div>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {member.users.position || "Unknown"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {member.users.role}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.user_id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Member */}
          <div className="grid gap-2">
            <Label htmlFor="member">Add Member</Label>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={loading}>
                <SelectTrigger id="member" className="flex-1">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No available users
                    </div>
                  ) : (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.position || "Unknown"}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUserId || loading}
              >
                {loading ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

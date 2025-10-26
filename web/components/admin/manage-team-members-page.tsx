"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Search, GripVertical, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface User {
  id: string;
  position: string | null;
  role: string;
  agency_id: string | null;
  email: string;
}

interface Team {
  id: string;
  name: string;
  agency_id: string | null;
  agency?: {
    name: string;
  } | null;
}

interface TeamMember {
  user_id: string;
  users: User;
}

interface ManageTeamMembersPageProps {
  team: Team;
  users: User[];
  userRole: string;
}

export function ManageTeamMembersPage({
  team,
  users,
  userRole,
}: ManageTeamMembersPageProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedUser, setDraggedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const backLink = userRole === "super_admin" ? "/admin/teams" : "/protected/teams";

  useEffect(() => {
    fetchTeamMembers();
  }, [team.id]);

  const fetchTeamMembers = async () => {
    try {
      // First get the team member user IDs
      const { data: memberData, error: memberError } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", team.id);

      if (memberError) {
        console.error("Supabase error:", memberError);
        throw memberError;
      }

      if (!memberData || memberData.length === 0) {
        setTeamMembers([]);
        return;
      }

      // Then get the full user details
      const userIds = memberData.map((m) => m.user_id);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, position, role, agency_id, email")
        .in("id", userIds);

      if (userError) {
        console.error("User fetch error:", userError);
        throw userError;
      }

      // Transform to match the expected structure
      const transformedData = memberData.map((member) => ({
        user_id: member.user_id,
        users: userData?.find((u) => u.id === member.user_id),
      }));

      setTeamMembers(transformedData as any);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    }
  };

  const handleAddMember = async (userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: userId,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Added",
            description: "This user is already a member of this team",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Member added to team",
      });

      fetchTeamMembers();
      router.refresh();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setLoading(true);
    try {
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
        description: "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, userId: string) => {
    setDraggedUser(userId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropToTeam = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedUser) {
      handleAddMember(draggedUser);
      setDraggedUser(null);
    }
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedUser) {
      handleRemoveMember(draggedUser);
      setDraggedUser(null);
    }
  };

  // Filter users
  const memberIds = teamMembers.map((tm) => tm.user_id);
  const availableUsers = users.filter((user) => {
    const notInTeam = !memberIds.includes(user.id);
    const sameAgency = team.agency_id ? user.agency_id === team.agency_id : true;
    const matchesSearch = searchTerm === "" || 
      user.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    return notInTeam && sameAgency && matchesSearch;
  });

  const filteredTeamMembers = teamMembers.filter((member) => {
    if (searchTerm === "") return true;
    return (
      member.users.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.users.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.users.role?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Users className="h-8 w-8" />
              Manage Team Members
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
          <CardTitle className="text-base">How to Assign Members</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• <strong>Drag & Drop:</strong> Drag users from "Available Users" to "Team Members" to add them</p>
          <p>• <strong>Remove:</strong> Drag members from "Team Members" back to "Available Users" to remove them</p>
          <p>• <strong>Quick Add:</strong> Click the <UserPlus className="inline h-4 w-4" /> icon on any available user</p>
          <p>• <strong>Search:</strong> Use the search box to filter users by name, email, or role</p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Users</span>
              <Badge variant="outline">{availableUsers.length}</Badge>
            </CardTitle>
            <CardDescription>
              Drag users to the team members area or click the add icon
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto"
            onDragOver={handleDragOver}
            onDrop={handleDropToAvailable}
          >
            {availableUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">No available users</p>
                <p className="text-xs mt-1">All eligible users are already team members</p>
              </div>
            ) : (
              availableUsers.map((user) => (
                <div
                  key={user.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, user.id)}
                  className={`group flex items-center justify-between p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors ${
                    draggedUser === user.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">
                          {user.position || "Unknown"}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddMember(user.id)}
                    disabled={loading}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Team Members</span>
              <Badge variant="default">{filteredTeamMembers.length}</Badge>
            </CardTitle>
            <CardDescription>
              Current members of this team. Drag them out to remove.
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto bg-primary/5"
            onDragOver={handleDragOver}
            onDrop={handleDropToTeam}
          >
            {filteredTeamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">No team members yet</p>
                <p className="text-xs mt-1">Drag users here to add them to the team</p>
              </div>
            ) : (
              filteredTeamMembers.map((member) => (
                <div
                  key={member.user_id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, member.user_id)}
                  className={`group flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors bg-background ${
                    draggedUser === member.user_id ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {member.users.position || "Unknown"}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {member.users.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.users.email}
                    </p>
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

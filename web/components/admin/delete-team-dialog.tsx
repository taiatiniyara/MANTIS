"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle } from "lucide-react";

interface Team {
  id: string;
  name: string;
}

interface DeleteTeamDialogProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTeamDialog({
  team,
  open,
  onOpenChange,
}: DeleteTeamDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      // Check if team has members
      const { data: members } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", team.id)
        .limit(1);

      if (members && members.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This team has members. Please remove them first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if team has assigned routes
      const { data: routes } = await supabase
        .from("team_routes")
        .select("route_id")
        .eq("team_id", team.id)
        .limit(1);

      if (routes && routes.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This team has assigned routes. Please unassign them first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Delete team
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", team.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Team
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this team?
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action cannot be undone.
          </AlertDescription>
        </Alert>

        <div className="rounded-lg border p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Team Name:</span>
              <span>{team.name}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

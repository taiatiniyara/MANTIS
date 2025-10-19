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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "./role-badge";

type Agency = Database["public"]["Tables"]["agencies"]["Row"];

type User = {
  id: string;
  position: string | null;
  agency_id: string | null;
  role: string;
};

interface AssignAdminDialogProps {
  agency: Agency;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableUsers: User[];
}

export function AssignAdminDialog({
  agency,
  open,
  onOpenChange,
  availableUsers,
}: AssignAdminDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Filter users that can be assigned as admins
  const eligibleUsers = availableUsers.filter(
    (user) => user.agency_id === null || user.agency_id === agency.id
  );

  const handleAssign = async () => {
    if (!selectedUserId) {
      setError("Please select a user to assign as admin.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Update the selected user to be an agency admin for this agency
      const { error: updateError } = await supabase
        .from("users")
        .update({
          role: "agency_admin",
          agency_id: agency.id,
        })
        .eq("id", selectedUserId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      toast({
        title: "Admin assigned",
        description: `Admin has been assigned to ${agency.name} successfully.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Demote admin to officer
      const { error: updateError } = await supabase
        .from("users")
        .update({
          role: "officer",
        })
        .eq("id", adminId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      toast({
        title: "Admin removed",
        description: `Admin has been removed from ${agency.name}.`,
      });
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current admins
  const currentAdmins = availableUsers.filter(
    (user) => user.agency_id === agency.id && user.role === "agency_admin"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Admin to {agency.name}</DialogTitle>
          <DialogDescription>
            Assign a user as an agency administrator. They will have full control over this agency.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Admins */}
          {currentAdmins.length > 0 && (
            <div className="space-y-2">
              <Label>Current Admin(s)</Label>
              <div className="space-y-2">
                {currentAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {admin.position || "No name"}
                      </span>
                      <RoleBadge role="agency_admin" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAdmin(admin.id)}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assign New Admin */}
          <div className="space-y-2">
            <Label htmlFor="user-select">
              {currentAdmins.length > 0 ? "Add Another Admin" : "Select User"}
            </Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={isLoading}
            >
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {eligibleUsers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No eligible users available
                  </div>
                ) : (
                  eligibleUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.position || "No name"}</span>
                        {user.agency_id === null && (
                          <Badge variant="outline" className="text-xs">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only users not assigned to other agencies are shown.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={isLoading || !selectedUserId}
          >
            {isLoading ? "Assigning..." : "Assign Admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

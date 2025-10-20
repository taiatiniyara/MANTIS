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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { Users } from "lucide-react";

interface Agency {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  agency_id: string | null;
}

interface EditTeamDialogProps {
  team: Team;
  agencies: Agency[];
  userRole: string;
  userAgencyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTeamDialog({
  team,
  agencies,
  userRole,
  userAgencyId,
  open,
  onOpenChange,
}: EditTeamDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(team.name);
  const [agencyId, setAgencyId] = useState<string>(team.agency_id || "");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      

      const { error } = await supabase
        .from("teams")
        .update({
          name: name.trim(),
          agency_id: agencyId || null,
        })
        .eq("id", team.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team updated successfully",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Edit Team
          </DialogTitle>
          <DialogDescription>
            Update team details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {userRole === "super_admin" && (
              <div className="grid gap-2">
                <Label htmlFor="edit-agency">Agency</Label>
                <Select value={agencyId} onValueChange={setAgencyId}>
                  <SelectTrigger id="edit-agency">
                    <SelectValue placeholder="Select agency (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Unassigned)</SelectItem>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

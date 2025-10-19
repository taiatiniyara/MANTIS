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
  DialogTrigger,
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
import { createClient } from "@/lib/supabase/client";
import { Users, Plus } from "lucide-react";

interface Agency {
  id: string;
  name: string;
}

interface CreateTeamDialogProps {
  agencies: Agency[];
  userRole: string;
  userAgencyId: string | null;
}

export function CreateTeamDialog({
  agencies,
  userRole,
  userAgencyId,
}: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [agencyId, setAgencyId] = useState<string>(
    userRole === "agency_admin" && userAgencyId ? userAgencyId : ""
  );
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.from("teams").insert({
        name: name.trim(),
        agency_id: agencyId || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      setOpen(false);
      setName("");
      setAgencyId(userRole === "agency_admin" && userAgencyId ? userAgencyId : "");
      router.refresh();
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Team
          </DialogTitle>
          <DialogDescription>
            Create a new team for organizing officers
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="e.g., Alpha Team, Night Patrol"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {userRole === "super_admin" && (
              <div className="grid gap-2">
                <Label htmlFor="agency">Agency</Label>
                <Select value={agencyId} onValueChange={setAgencyId}>
                  <SelectTrigger id="agency">
                    <SelectValue placeholder="Select agency (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Unassigned)</SelectItem>
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

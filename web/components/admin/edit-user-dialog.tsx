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
import { Input } from "@/components/ui/input";
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
import { LocationSelector } from "./location-selector";

type User = Database["public"]["Tables"]["users"]["Row"];
type LocationType = 'division' | 'station' | 'post' | 'region' | 'office' | 'council' | 'department' | 'zone';

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

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSuperAdmin: boolean;
  agencies: Agency[];
  locations: Location[];
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  isSuperAdmin,
  agencies,
  locations,
}: EditUserDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(user.position || "");
  const [role, setRole] = useState(user.role);
  const [agencyId, setAgencyId] = useState(user.agency_id || "");
  const [locationId, setLocationId] = useState(user.location_id || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosition(user.position || "");
    setRole(user.role);
    setAgencyId(user.agency_id || "");
    setLocationId(user.location_id || "");
    setError(null);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("users")
        .update({
          position: position.trim() || null,
          role: role as "super_admin" | "agency_admin" | "officer",
          agency_id: agencyId || null,
          location_id: locationId || null,
        })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      toast({
        title: "User updated",
        description: `User details have been updated successfully.`,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Position/Name</Label>
              <Input
                id="edit-position"
                placeholder="e.g., Senior Officer John Doe"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {isSuperAdmin && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={role}
                    onValueChange={(value) => setRole(value as typeof role)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="agency_admin">Agency Admin</SelectItem>
                      <SelectItem value="officer">Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-agency">Agency</Label>
                  <Select
                    value={agencyId}
                    onValueChange={(value) => {
                      setAgencyId(value);
                      setLocationId(""); // Reset location when agency changes
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="edit-agency">
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
              </>
            )}

            <LocationSelector
              locations={locations}
              value={locationId}
              onValueChange={setLocationId}
              agencyId={agencyId || null}
              label="Location"
              placeholder="Select location (optional)"
              disabled={isLoading}
            />

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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

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
}

interface RouteData {
  id: string;
  name: string;
  description: string | null;
  agency_id: string | null;
  location_id: string | null;
}

interface EditRouteDialogProps {
  route: RouteData;
  agencies: Agency[];
  locations: Location[];
  userRole: string;
  userAgencyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRouteDialog({
  route,
  agencies,
  locations,
  userRole,
  userAgencyId,
  open,
  onOpenChange,
}: EditRouteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(route.name);
  const [description, setDescription] = useState(route.description || "");
  const [agencyId, setAgencyId] = useState<string>(route.agency_id || "");
  const [locationId, setLocationId] = useState<string>(route.location_id || "");
  const router = useRouter();
  const { toast } = useToast();

  // Filter locations by selected agency
  const filteredLocations = locations.filter(
    (loc) => loc.agency_id === (agencyId || null)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      

      const { error } = await supabase
        .from("routes")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          agency_id: agencyId || null,
          location_id: locationId || null,
        })
        .eq("id", route.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route updated successfully",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating route:", error);
      toast({
        title: "Error",
        description: "Failed to update route. Please try again.",
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
            <MapPin className="h-5 w-5" />
            Edit Route
          </DialogTitle>
          <DialogDescription>
            Update route details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Route Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {userRole === "super_admin" && (
              <div className="grid gap-2">
                <Label htmlFor="edit-agency">Agency</Label>
                <Select
                  value={agencyId}
                  onValueChange={(value) => {
                    setAgencyId(value);
                    setLocationId(""); // Reset location when agency changes
                  }}
                >
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

            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="edit-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {filteredLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

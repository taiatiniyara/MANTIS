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
  parent_id: string | null;
}

interface EditLocationDialogProps {
  location: Location;
  agencies: Agency[];
  locations: Location[];
  userRole: string;
  userAgencyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLocationDialog({
  location,
  agencies,
  locations,
  userRole,
  userAgencyId,
  open,
  onOpenChange,
}: EditLocationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(location.name);
  const [type, setType] = useState<LocationType>(location.type);
  const [agencyId, setAgencyId] = useState<string>(location.agency_id || "");
  const [parentId, setParentId] = useState<string>(location.parent_id || "");
  const router = useRouter();
  const { toast } = useToast();

  const locationTypes: { value: LocationType; label: string }[] = [
    { value: "division", label: "Division" },
    { value: "station", label: "Station" },
    { value: "post", label: "Post" },
    { value: "region", label: "Region" },
    { value: "office", label: "Office" },
    { value: "council", label: "Council" },
    { value: "department", label: "Department" },
    { value: "zone", label: "Zone" },
  ];

  // Filter locations by selected agency for parent dropdown, exclude self
  const availableParents = locations.filter(
    (loc) => loc.id !== location.id && loc.agency_id === (agencyId || null)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      

      const { error } = await supabase
        .from("locations")
        .update({
          name: name.trim(),
          type,
          agency_id: agencyId || null,
          parent_id: parentId || null,
        })
        .eq("id", location.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location updated successfully",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
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
            Edit Location
          </DialogTitle>
          <DialogDescription>
            Update location details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Location Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-type">Location Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as LocationType)}>
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((locType) => (
                    <SelectItem key={locType.value} value={locType.value}>
                      {locType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {userRole === "super_admin" && (
              <div className="grid gap-2">
                <Label htmlFor="edit-agency">Agency</Label>
                <Select
                  value={agencyId}
                  onValueChange={(value) => {
                    setAgencyId(value);
                    setParentId(""); // Reset parent when agency changes
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
              <Label htmlFor="edit-parent">Parent Location</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="edit-parent">
                  <SelectValue placeholder="Select parent location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {availableParents.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} ({loc.type})
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

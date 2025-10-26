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
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  const [address, setAddress] = useState(location.address || "");
  const [latitude, setLatitude] = useState(location.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(location.longitude?.toString() || "");
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
      

      // Parse GPS coordinates if provided
      const lat = latitude.trim() ? parseFloat(latitude) : null;
      const lng = longitude.trim() ? parseFloat(longitude) : null;

      // Validate coordinates if provided
      if (latitude.trim() && (isNaN(lat!) || lat! < -90 || lat! > 90)) {
        toast({
          title: "Invalid Latitude",
          description: "Latitude must be between -90 and 90",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (longitude.trim() && (isNaN(lng!) || lng! < -180 || lng! > 180)) {
        toast({
          title: "Invalid Longitude",
          description: "Longitude must be between -180 and 180",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("locations")
        .update({
          name: name.trim(),
          type,
          agency_id: agencyId || null,
          parent_id: parentId || null,
          address: address.trim() || null,
          latitude: lat,
          longitude: lng,
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

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                GPS Coordinates (Optional)
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Add coordinates to display this location on route maps
              </p>

              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  placeholder="e.g., 123 Victoria Parade, Suva"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-latitude">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    placeholder="-18.1416"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">-90 to 90</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-longitude">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    placeholder="178.4419"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">-180 to 180</p>
                </div>
              </div>
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

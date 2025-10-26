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

import { MapPin, Plus } from "lucide-react";
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

interface CreateLocationDialogProps {
  agencies: Agency[];
  locations: Location[];
  userRole: string;
  userAgencyId: string | null;
}

export function CreateLocationDialog({
  agencies,
  locations,
  userRole,
  userAgencyId,
}: CreateLocationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<LocationType>("station");
  const [agencyId, setAgencyId] = useState<string>(
    userRole === "agency_admin" && userAgencyId ? userAgencyId : ""
  );
  const [parentId, setParentId] = useState<string>("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
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

  // Filter locations by selected agency for parent dropdown
  const availableParents = locations.filter(
    (loc) => loc.agency_id === (agencyId || null)
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

      const { error } = await supabase.from("locations").insert({
        name: name.trim(),
        type,
        agency_id: agencyId || null,
        parent_id: parentId || null,
        address: address.trim() || null,
        latitude: lat,
        longitude: lng,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location created successfully",
      });

      setOpen(false);
      setName("");
      setType("station");
      setAgencyId(userRole === "agency_admin" && userAgencyId ? userAgencyId : "");
      setParentId("");
      setAddress("");
      setLatitude("");
      setLongitude("");
      router.refresh();
    } catch (error) {
      console.error("Error creating location:", error);
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
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
          Create Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Create Location
          </DialogTitle>
          <DialogDescription>
            Add a new location (division, station, etc.)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                placeholder="e.g., Central Division, Suva Station"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Location Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as LocationType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
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
                <Label htmlFor="agency">Agency</Label>
                <Select
                  value={agencyId}
                  onValueChange={(value) => {
                    setAgencyId(value);
                    setParentId(""); // Reset parent when agency changes
                  }}
                >
                  <SelectTrigger id="agency">
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
              <Label htmlFor="parent">Parent Location (Optional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parent">
                  <SelectValue placeholder="Select parent location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {availableParents.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                e.g., Suva Station under Central Division
              </p>
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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Victoria Parade, Suva"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="-18.1416"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">-90 to 90</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
      

      const { error } = await supabase.from("locations").insert({
        name: name.trim(),
        type,
        agency_id: agencyId || null,
        parent_id: parentId || null,
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

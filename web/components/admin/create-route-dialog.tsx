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
import { Textarea } from "@/components/ui/textarea";
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

interface CreateRouteDialogProps {
  agencies: Agency[];
  locations: Location[];
  userRole: string;
  userAgencyId: string | null;
}

export function CreateRouteDialog({
  agencies,
  locations,
  userRole,
  userAgencyId,
}: CreateRouteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [agencyId, setAgencyId] = useState<string>(
    userRole === "agency_admin" && userAgencyId ? userAgencyId : ""
  );
  const [locationId, setLocationId] = useState<string>("");
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
      

      const { error } = await supabase.from("routes").insert({
        name: name.trim(),
        description: description.trim() || null,
        agency_id: agencyId || null,
        location_id: locationId || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route created successfully",
      });

      setOpen(false);
      setName("");
      setDescription("");
      setAgencyId(userRole === "agency_admin" && userAgencyId ? userAgencyId : "");
      setLocationId("");
      router.refresh();
    } catch (error) {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "Failed to create route. Please try again.",
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
          Create Route
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Create Route
          </DialogTitle>
          <DialogDescription>
            Create a new patrol route
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Route Name</Label>
              <Input
                id="name"
                placeholder="e.g., Kings Road Patrol, Suva Central"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the route, key areas, or instructions"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {userRole === "super_admin" && (
              <div className="grid gap-2">
                <Label htmlFor="agency">Agency</Label>
                <Select
                  value={agencyId}
                  onValueChange={(value) => {
                    setAgencyId(value);
                    setLocationId(""); // Reset location when agency changes
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
              <Label htmlFor="location">Location (Optional)</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {filteredLocations.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No locations available
                    </div>
                  ) : (
                    filteredLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
              {loading ? "Creating..." : "Create Route"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

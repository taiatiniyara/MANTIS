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
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LocationSelector } from "./location-selector";

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

interface CreateUserDialogProps {
  isSuperAdmin: boolean;
  currentAgencyId: string | null;
  agencies: Agency[];
  locations: Location[];
}

export function CreateUserDialog({
  isSuperAdmin,
  currentAgencyId,
  agencies,
  locations,
}: CreateUserDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState<string>("");
  const [agencyId, setAgencyId] = useState<string>(currentAgencyId || "");
  const [locationId, setLocationId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Call server action to create user via Supabase Auth Admin API
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          position: position.trim(),
          role,
          agency_id: agencyId || null,
          location_id: locationId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast({
        title: "User created successfully",
        description: `An invitation email has been sent to ${email}`,
      });

      // Reset form
      setEmail("");
      setPosition("");
      setRole("");
      setAgencyId(currentAgencyId || "");
      setLocationId("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        title: "Error creating user",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the MANTIS system. They will receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                An invitation email will be sent to this address
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Position/Name</Label>
              <Input
                id="position"
                placeholder="e.g., Senior Officer John Doe"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required disabled={isLoading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  <SelectItem value="agency_admin">Agency Admin</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isSuperAdmin && agencies.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="agency">Agency</Label>
                <Select 
                  value={agencyId} 
                  onValueChange={(value) => {
                    setAgencyId(value);
                    setLocationId(""); // Reset location when agency changes
                  }} 
                  disabled={isLoading}
                >
                  <SelectTrigger id="agency">
                    <SelectValue placeholder="Select an agency (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Agency</SelectItem>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !email.trim() || !position.trim() || !role}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

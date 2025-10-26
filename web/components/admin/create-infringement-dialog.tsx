"use client";

import { useState, useEffect } from "react";
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

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  validateRequired,
  validateVehicleId,
  validatePastDate,
  validateMaxLength,
  combineValidations,
} from "@/lib/validations";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { LocationPicker } from "@/components/maps/location-picker";

interface Agency {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Type {
  id: string;
  code: string;
  name: string;
  category_id: string;
}

interface Team {
  id: string;
  name: string;
  agency_id: string | null;
}

interface Route {
  id: string;
  name: string;
  agency_id: string | null;
}

interface User {
  id: string;
  position: string | null;
  role: string;
  agency_id: string | null;
}

interface InfringementType {
  id: string;
  code: string;
  name: string;
  category_id: string;
  fine_amount: number;
}

interface CreateInfringementDialogProps {
  userRole: string;
  userAgencyId: string | null;
  agencies: Agency[];
  users: User[];
  teams: Team[];
  routes: Route[];
  categories: Category[];
  types: InfringementType[];
  children?: React.ReactNode;
}

export function CreateInfringementDialog({
  agencies,
  categories,
  types,
  teams,
  routes,
  users,
  userRole,
  userAgencyId,
  children,
}: CreateInfringementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    agency_id: userAgencyId || "",
    officer_id: "",
    type_id: "",
    category_id: "",
    team_id: "",
    route_id: "",
    vehicle_id: "",
    notes: "",
    issued_at: new Date().toISOString().slice(0, 16),
    // Location fields - entered by officer
    latitude: null as number | null,
    longitude: null as number | null,
    address: "",
  });
  const router = useRouter();
  

  // Reset agency when dialog opens for Super Admin
  useEffect(() => {
    if (open && userRole === "super_admin") {
      setFormData((prev) => ({ ...prev, agency_id: "" }));
    } else if (open && userAgencyId) {
      setFormData((prev) => ({ ...prev, agency_id: userAgencyId }));
    }
  }, [open, userRole, userAgencyId]);

  // Get current user as default officer
  useEffect(() => {
    if (open) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setFormData((prev) => ({ ...prev, officer_id: data.user.id }));
        }
      });
    }
  }, [open, supabase]);

  // Filter types by selected category
  const filteredTypes = formData.category_id
    ? types.filter((t) => t.category_id === formData.category_id)
    : types;

  // Filter teams, routes, locations by selected agency
  const filteredTeams = formData.agency_id
    ? teams.filter((t) => t.agency_id === formData.agency_id)
    : teams;

  const filteredRoutes = formData.agency_id
    ? routes.filter((r) => r.agency_id === formData.agency_id)
    : routes;

  const filteredOfficers = formData.agency_id
    ? users.filter((o) => o.agency_id === formData.agency_id && o.role === 'officer')
    : users.filter((o) => o.role === 'officer');

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    // Validate officer
    const officerValidation = validateRequired(formData.officer_id, "Officer");
    if (!officerValidation.valid) {
      newErrors.officer_id = officerValidation.error!;
    }

    // Validate vehicle ID
    const vehicleValidation = validateVehicleId(formData.vehicle_id);
    if (!vehicleValidation.valid) {
      newErrors.vehicle_id = vehicleValidation.error!;
    }

    // Validate infringement type
    const typeValidation = validateRequired(formData.type_id, "Infringement type");
    if (!typeValidation.valid) {
      newErrors.type_id = typeValidation.error!;
    }

    // Validate date is not in the future
    const dateValidation = validatePastDate(formData.issued_at, "Date & Time");
    if (!dateValidation.valid) {
      newErrors.issued_at = dateValidation.error!;
    }

    // Validate notes length
    if (formData.notes) {
      const notesValidation = validateMaxLength(formData.notes, "Notes", 500);
      if (!notesValidation.valid) {
        newErrors.notes = notesValidation.error!;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("infringements").insert({
      officer_id: formData.officer_id,
      agency_id: formData.agency_id || null,
      team_id: formData.team_id || null,
      route_id: formData.route_id || null,
      type_id: formData.type_id,
      vehicle_id: formData.vehicle_id.trim().toUpperCase(),
      notes: formData.notes.trim() || null,
      issued_at: new Date(formData.issued_at).toISOString(),
      // Location data entered by officer
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address || null,
    });

    if (error) {
      toast.error("Failed to record infringement");
      console.error(error);
    } else {
      toast.success("Infringement recorded successfully");
      setFormData({
        agency_id: userAgencyId || "",
        officer_id: "",
        type_id: "",
        category_id: "",
        team_id: "",
        route_id: "",
        vehicle_id: "",
        notes: "",
        issued_at: new Date().toISOString().slice(0, 16),
        latitude: null,
        longitude: null,
        address: "",
      });
      setErrors({});
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Infringement</DialogTitle>
            <DialogDescription>
              Create a new traffic infringement record
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Agency Selection (Super Admin only) */}
            {userRole === "super_admin" && (
              <div className="space-y-2">
                <Label htmlFor="agency">Agency</Label>
                <Select
                  value={formData.agency_id}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      agency_id: value,
                      team_id: "",
                      route_id: "",
                      officer_id: "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Officer Selection */}
            <div className="space-y-2">
              <Label htmlFor="officer">Officer *</Label>
              <Select
                value={formData.officer_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, officer_id: value });
                  setErrors({ ...errors, officer_id: "" });
                }}
              >
                <SelectTrigger className={errors.officer_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select officer" />
                </SelectTrigger>
                <SelectContent>
                  {filteredOfficers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.position || "Officer"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.officer_id && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.officer_id}
                </p>
              )}
            </div>

            {/* Vehicle ID and Issued At */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_id">Vehicle ID *</Label>
                <Input
                  id="vehicle_id"
                  placeholder="e.g., ABC123GP"
                  value={formData.vehicle_id}
                  onChange={(e) => {
                    setFormData({ ...formData, vehicle_id: e.target.value });
                    setErrors({ ...errors, vehicle_id: "" });
                  }}
                  className={errors.vehicle_id ? "border-red-500" : ""}
                  required
                />
                {errors.vehicle_id && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.vehicle_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issued_at">Date & Time *</Label>
                <Input
                  id="issued_at"
                  type="datetime-local"
                  value={formData.issued_at}
                  onChange={(e) => {
                    setFormData({ ...formData, issued_at: e.target.value });
                    setErrors({ ...errors, issued_at: "" });
                  }}
                  className={errors.issued_at ? "border-red-500" : ""}
                  required
                />
                {errors.issued_at && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.issued_at}
                  </p>
                )}
              </div>
            </div>

            {/* Category and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value, type_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Infringement Type *</Label>
                <Select
                  value={formData.type_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, type_id: value });
                    setErrors({ ...errors, type_id: "" });
                  }}
                >
                  <SelectTrigger className={errors.type_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.code} - {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type_id && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.type_id}
                  </p>
                )}
              </div>
            </div>

            {/* Team and Route */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Select
                  value={formData.team_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, team_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Team</SelectItem>
                    {filteredTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="route">Route</Label>
                <Select
                  value={formData.route_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, route_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select route (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Route</SelectItem>
                    {filteredRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location with Map Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Location (GPS Coordinates & Address)</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.latitude && formData.longitude ? (
                    <span className="text-green-600">✓ Location captured</span>
                  ) : (
                    <span>Required - Click map or search address</span>
                  )}
                </span>
              </div>
              <LocationPicker
                onLocationSelect={(lat, lng, address) => {
                  setFormData({
                    ...formData,
                    latitude: lat,
                    longitude: lng,
                    address: address || "",
                  });
                }}
                initialLocation={
                  formData.latitude && formData.longitude
                    ? { lat: formData.latitude, lng: formData.longitude }
                    : undefined
                }
                label=""
              />
              {formData.address && (
                <p className="text-sm text-muted-foreground">
                  📍 {formData.address}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or observations (max 500 chars)..."
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setFormData({ ...formData, notes: e.target.value });
                  setErrors({ ...errors, notes: "" });
                }}
                className={errors.notes ? "border-red-500" : ""}
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.notes}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.notes.length}/500 characters
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
              {loading ? "Recording..." : "Record Infringement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

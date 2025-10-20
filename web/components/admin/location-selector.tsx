"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

type LocationType = 'division' | 'station' | 'post' | 'region' | 'office' | 'council' | 'department' | 'zone';

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

interface LocationSelectorProps {
  locations: Location[];
  value: string;
  onValueChange: (value: string) => void;
  agencyId?: string | null;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function LocationSelector({
  locations,
  value,
  onValueChange,
  agencyId,
  label = "Location",
  placeholder = "Select a location",
  required = false,
  disabled = false,
}: LocationSelectorProps) {
  // Filter locations by agency if specified
  const filteredLocations = agencyId
    ? locations.filter((loc) => loc.agency_id === agencyId)
    : locations;

  // Group locations by type for better organization
  const groupedLocations = filteredLocations.reduce((acc, location) => {
    if (!acc[location.type]) {
      acc[location.type] = [];
    }
    acc[location.type].push(location);
    return acc;
  }, {} as Record<string, Location[]>);

  // Sort types in logical hierarchy
  const typeOrder = ['division', 'region', 'zone', 'station', 'office', 'department', 'council', 'post'];
  const sortedTypes = Object.keys(groupedLocations).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  return (
    <div className="grid gap-2">
      {label && (
        <Label htmlFor="location-selector" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="location-selector">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {!required && <SelectItem value="none">None (Unassigned)</SelectItem>}
          
          {filteredLocations.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No locations available
              {agencyId && <div className="mt-1">for this agency</div>}
            </div>
          ) : (
            sortedTypes.map((type) => (
              <div key={type}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  {type}s
                </div>
                {groupedLocations[type].map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                    {location.parent && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({location.parent.name})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </div>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

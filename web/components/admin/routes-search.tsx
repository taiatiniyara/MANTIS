"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

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

interface RoutesSearchProps {
  agencies: Agency[];
  locations: Location[];
  userRole: string;
}

export function RoutesSearch({ agencies, locations, userRole }: RoutesSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const handleAgencyFilter = (agency: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (agency) {
      params.set("agency", agency);
    } else {
      params.delete("agency");
    }
    router.push(`?${params.toString()}`);
  };

  const handleLocationFilter = (location: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (location) {
      params.set("location", location);
    } else {
      params.delete("location");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search routes..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {userRole === "super_admin" && (
        <Select
          value={searchParams.get("agency") || ""}
          onValueChange={handleAgencyFilter}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Agencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Agencies</SelectItem>
            {agencies.map((agency) => (
              <SelectItem key={agency.id} value={agency.id}>
                {agency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={searchParams.get("location") || ""}
        onValueChange={handleLocationFilter}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

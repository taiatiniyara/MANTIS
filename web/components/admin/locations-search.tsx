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

interface Agency {
  id: string;
  name: string;
}

interface LocationsSearchProps {
  agencies: Agency[];
  userRole: string;
}

export function LocationsSearch({ agencies, userRole }: LocationsSearchProps) {
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

  const handleTypeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
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

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get("type") || ""}
        onValueChange={handleTypeFilter}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          <SelectItem value="division">Division</SelectItem>
          <SelectItem value="station">Station</SelectItem>
          <SelectItem value="post">Post</SelectItem>
          <SelectItem value="region">Region</SelectItem>
          <SelectItem value="office">Office</SelectItem>
          <SelectItem value="council">Council</SelectItem>
          <SelectItem value="department">Department</SelectItem>
          <SelectItem value="zone">Zone</SelectItem>
        </SelectContent>
      </Select>

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
    </div>
  );
}

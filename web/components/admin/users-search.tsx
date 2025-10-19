"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersSearchProps {
  isSuperAdmin: boolean;
  agencies: Array<{ id: string; name: string }>;
}

export function UsersSearch({ isSuperAdmin, agencies }: UsersSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearch = (value: string) => {
    setSearch(value);
    updateParams({ search: value });
  };

  const handleRoleFilter = (value: string) => {
    updateParams({ role: value === "all" ? "" : value });
  };

  const handleAgencyFilter = (value: string) => {
    updateParams({ agency: value === "all" ? "" : value });
  };

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch("");
    startTransition(() => {
      router.push("/admin/users");
    });
  };

  const hasFilters = search || searchParams.get("role") || searchParams.get("agency");

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by position..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 pr-9"
          disabled={isPending}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => handleSearch("")}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select
        value={searchParams.get("role") || "all"}
        onValueChange={handleRoleFilter}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="agency_admin">Agency Admin</SelectItem>
          <SelectItem value="officer">Officer</SelectItem>
        </SelectContent>
      </Select>

      {isSuperAdmin && agencies.length > 0 && (
        <Select
          value={searchParams.get("agency") || "all"}
          onValueChange={handleAgencyFilter}
          disabled={isPending}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by agency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agencies</SelectItem>
            {agencies.map((agency) => (
              <SelectItem key={agency.id} value={agency.id.toString()}>
                {agency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isPending}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}

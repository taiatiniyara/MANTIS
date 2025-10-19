"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

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
}

interface Route {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

interface Officer {
  id: string;
  position: string | null;
}

interface InfringementsSearchProps {
  agencies: Agency[];
  categories: Category[];
  types: Type[];
  teams: Team[];
  routes: Route[];
  locations: Location[];
  officers: Officer[];
  userRole: string;
}

export function InfringementsSearch({
  agencies,
  categories,
  types,
  teams,
  routes,
  locations,
  officers,
  userRole,
}: InfringementsSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const search = searchParams.get("search") || "";
  const agency = searchParams.get("agency") || "";
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const team = searchParams.get("team") || "";
  const route = searchParams.get("route") || "";
  const location = searchParams.get("location") || "";
  const officer = searchParams.get("officer") || "";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  const updateParam = useMemo(
    () => (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAllFilters = () => {
    router.push(window.location.pathname);
  };

  const exportCSV = () => {
    // Build current URL with all filters
    const params = new URLSearchParams(searchParams.toString());
    params.set("export", "csv");
    window.open(`/api/infringements/export?${params.toString()}`, "_blank");
  };

  const exportPDF = () => {
    // Build current URL with all filters
    const params = new URLSearchParams(searchParams.toString());
    params.set("export", "pdf");
    window.open(`/api/infringements/export?${params.toString()}`, "_blank");
  };

  // Count active filters
  const activeFilterCount = [
    search,
    agency,
    category,
    type,
    team,
    route,
    location,
    officer,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  // Filter types by selected category
  const filteredTypes = category
    ? types.filter((t) => t.category_id === category)
    : types;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by vehicle ID..."
              value={search}
              onChange={(e) => updateParam("search", e.target.value)}
              className="pl-10"
            />
          </div>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Expandable Filters */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => updateParam("from", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => updateParam("to", e.target.value)}
                />
              </div>
            </div>

            {/* Main Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Agency Filter (Super Admin only) */}
              {userRole === "super_admin" && (
                <Select
                  value={agency || "all"}
                  onValueChange={(value) => updateParam("agency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Agencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    {agencies.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Category Filter */}
              <Select
                value={category || "all"}
                onValueChange={(value) => updateParam("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={type || "all"}
                onValueChange={(value) => updateParam("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filteredTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.code} - {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Officer Filter */}
              <Select
                value={officer || "all"}
                onValueChange={(value) => updateParam("officer", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Officers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Officers</SelectItem>
                  {officers.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.position || "Officer"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Team Filter */}
              <Select
                value={team || "all"}
                onValueChange={(value) => updateParam("team", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Route Filter */}
              <Select
                value={route || "all"}
                onValueChange={(value) => updateParam("route", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Routes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select
                value={location || "all"}
                onValueChange={(value) => updateParam("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} ({l.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

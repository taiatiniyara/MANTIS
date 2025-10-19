"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, Filter, Save, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface Location {
  id: string;
  name: string;
  type: string;
}

interface Officer {
  id: string;
  position: string | null;
}

export interface InfringementFilters {
  vehicle_id?: string;
  date_from?: string;
  date_to?: string;
  category_id?: string;
  type_id?: string;
  location_id?: string;
  officer_id?: string;
  status?: string;
}

interface InfringementFiltersProps {
  categories: Category[];
  types: Type[];
  locations: Location[];
  officers: Officer[];
  filters: InfringementFilters;
  onFiltersChange: (filters: InfringementFilters) => void;
  onSearch: () => void;
  onClear: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onSavePreset?: () => void;
  activeFilterCount: number;
}

export function InfringementFiltersComponent({
  categories,
  types,
  locations,
  officers,
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  onExportCSV,
  onExportPDF,
  onSavePreset,
  activeFilterCount,
}: InfringementFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  // Filter types by selected category
  const filteredTypes = filters.category_id
    ? types.filter((t) => t.category_id === filters.category_id)
    : types;

  const updateFilter = (key: keyof InfringementFilters, value: string) => {
    if (value === "all" || value === "") {
      const { [key]: removed, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {expanded ? "Hide" : "Show"} Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Always visible: Vehicle ID search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by vehicle ID..."
              value={filters.vehicle_id || ""}
              onChange={(e) => updateFilter("vehicle_id", e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={onSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClear}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Expandable filters */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_from">From Date</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={filters.date_from || ""}
                  onChange={(e) => updateFilter("date_from", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_to">To Date</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={filters.date_to || ""}
                  onChange={(e) => updateFilter("date_to", e.target.value)}
                />
              </div>
            </div>

            {/* Category and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category_id || "all"}
                  onValueChange={(value) => {
                    updateFilter("category_id", value);
                    // Clear type if category changes
                    if (value === "all") {
                      updateFilter("type_id", "");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
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
                <Label htmlFor="type">Infringement Type</Label>
                <Select
                  value={filters.type_id || "all"}
                  onValueChange={(value) => updateFilter("type_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {filteredTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.code} - {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location and Officer */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={filters.location_id || "all"}
                  onValueChange={(value) => updateFilter("location_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="officer">Officer</Label>
                <Select
                  value={filters.officer_id || "all"}
                  onValueChange={(value) => updateFilter("officer_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All officers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Officers</SelectItem>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.position || "Officer"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {onSavePreset && (
                <Button variant="outline" size="sm" onClick={onSavePreset}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preset
                </Button>
              )}
              {onExportCSV && (
                <Button variant="outline" size="sm" onClick={onExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
              {onExportPDF && (
                <Button variant="outline" size="sm" onClick={onExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

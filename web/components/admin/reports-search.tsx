"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface Agency {
  id: string;
  name: string;
}

interface ReportsSearchProps {
  agencies: Agency[];
  userRole: string;
}

export function ReportsSearch({ agencies, userRole }: ReportsSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const agency = searchParams.get("agency") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

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

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="text-sm font-medium">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Agency Filter (Super Admin only) */}
        {userRole === "super_admin" && (
          <div className="space-y-2">
            <Label>Agency</Label>
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
          </div>
        )}

        {/* Date From */}
        <div className="space-y-2">
          <Label>From Date</Label>
          <Input
            type="date"
            value={from}
            onChange={(e) => updateParam("from", e.target.value)}
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label>To Date</Label>
          <Input
            type="date"
            value={to}
            onChange={(e) => updateParam("to", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

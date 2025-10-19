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

interface User {
  id: string;
  position: string | null;
  role: string;
}

interface AuditLogsSearchProps {
  users: User[];
}

export function AuditLogsSearch({ users }: AuditLogsSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const table = searchParams.get("table") || "";
  const action = searchParams.get("action") || "";
  const user = searchParams.get("user") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Table Filter */}
      <div className="space-y-2">
        <Label>Table</Label>
        <Select value={table || "all"} onValueChange={(value) => updateParam("table", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All tables" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            <SelectItem value="agencies">Agencies</SelectItem>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="locations">Locations</SelectItem>
            <SelectItem value="teams">Teams</SelectItem>
            <SelectItem value="routes">Routes</SelectItem>
            <SelectItem value="categories">Categories</SelectItem>
            <SelectItem value="types">Types</SelectItem>
            <SelectItem value="infringements">Infringements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Filter */}
      <div className="space-y-2">
        <Label>Action</Label>
        <Select value={action || "all"} onValueChange={(value) => updateParam("action", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="INSERT">Insert</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Filter */}
      <div className="space-y-2">
        <Label>User</Label>
        <Select value={user || "all"} onValueChange={(value) => updateParam("user", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.position || u.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* From Date */}
      <div className="space-y-2">
        <Label>From Date</Label>
        <Input
          type="date"
          value={from}
          onChange={(e) => updateParam("from", e.target.value)}
        />
      </div>

      {/* To Date */}
      <div className="space-y-2">
        <Label>To Date</Label>
        <Input
          type="date"
          value={to}
          onChange={(e) => updateParam("to", e.target.value)}
        />
      </div>
    </div>
  );
}

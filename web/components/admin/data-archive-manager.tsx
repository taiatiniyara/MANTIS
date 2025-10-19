"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Archive,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

interface DataArchiveManagerProps {
  recentJobs: any[];
  activeCount: number;
  archivedCount: number;
}

export function DataArchiveManager({
  recentJobs,
  activeCount,
  archivedCount,
}: DataArchiveManagerProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [archiveSettings, setArchiveSettings] = useState({
    table: "infringements",
    olderThan: "730",
    reason: "",
  });

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const response = await fetch("/api/data-management/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(archiveSettings),
      });

      if (response.ok) {
        // Refresh the page to show updated counts
        window.location.reload();
      }
    } catch (error) {
      console.error("Archive error:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestore = async (originalId: string) => {
    setIsRestoring(true);
    try {
      const response = await fetch("/api/data-management/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalId }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Restore error:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: "default",
      failed: "destructive",
      running: "secondary",
      pending: "outline",
    };
    return variants[status] || "outline";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archive Manager
          </CardTitle>
          <CardDescription>
            Archive old records to improve database performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Archive Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Archive Settings</h3>

              <div className="space-y-2">
                <Label>Table to Archive</Label>
                <Select
                  value={archiveSettings.table}
                  onValueChange={(value) =>
                    setArchiveSettings({ ...archiveSettings, table: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infringements">Infringements</SelectItem>
                    <SelectItem value="audit_logs">Audit Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Archive records older than (days)</Label>
                <Input
                  type="number"
                  value={archiveSettings.olderThan}
                  onChange={(e) =>
                    setArchiveSettings({
                      ...archiveSettings,
                      olderThan: e.target.value,
                    })
                  }
                  placeholder="730"
                />
              </div>

              <div className="space-y-2">
                <Label>Archive Reason</Label>
                <Input
                  value={archiveSettings.reason}
                  onChange={(e) =>
                    setArchiveSettings({
                      ...archiveSettings,
                      reason: e.target.value,
                    })
                  }
                  placeholder="Retention policy compliance"
                />
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Archive className="h-4 w-4 mr-2" />
                    Start Archive Job
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Archive</DialogTitle>
                    <DialogDescription>
                      This will archive all {archiveSettings.table} older than{" "}
                      {archiveSettings.olderThan} days. Archived records can be
                      restored later.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {}}
                      disabled={isArchiving}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleArchive} disabled={isArchiving}>
                      {isArchiving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Archiving...
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Confirm Archive
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <h3 className="font-medium">Statistics</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Active Records</span>
                  <span className="text-lg font-bold">{activeCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Archived Records</span>
                  <span className="text-lg font-bold">{archivedCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Total Storage</span>
                  <span className="text-lg font-bold">
                    {activeCount + archivedCount}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Archive Ratio</span>
                  <span className="text-lg font-bold">
                    {activeCount + archivedCount > 0
                      ? Math.round(
                          (archivedCount / (activeCount + archivedCount)) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Archive Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Archive Jobs</CardTitle>
              <CardDescription>
                Track the status of your archive operations
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentJobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium capitalize">
                      {job.job_type}
                    </TableCell>
                    <TableCell>{job.table_name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(job.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(job.status)}
                          {job.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.records_processed || 0} / {job.records_total || 0}
                    </TableCell>
                    <TableCell>
                      {new Date(job.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No archive jobs yet</p>
              <p className="text-sm">Start an archive job to see it here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

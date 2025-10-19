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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HardDrive,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface BackupManagerProps {
  backups: any[];
}

export function BackupManager({ backups }: BackupManagerProps) {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupType, setBackupType] = useState("full");

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const response = await fetch("/api/data-management/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupType }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Backup error:", error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDownloadBackup = (backupId: string) => {
    window.open(`/api/data-management/backup/${backupId}/download`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: "default",
      failed: "destructive",
      pending: "outline",
    };
    return variants[status] || "outline";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup Manager
            </CardTitle>
            <CardDescription>
              Create and manage database backups
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Restore
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <HardDrive className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Backup</DialogTitle>
                  <DialogDescription>
                    Choose the backup type and tables to include
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Backup Type</Label>
                    <Select value={backupType} onValueChange={setBackupType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Backup</SelectItem>
                        <SelectItem value="incremental">Incremental</SelectItem>
                        <SelectItem value="table">Specific Tables</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {backupType === "full" &&
                        "Complete backup of all database tables"}
                      {backupType === "incremental" &&
                        "Only changes since last backup"}
                      {backupType === "table" &&
                        "Select specific tables to backup"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {}}
                    disabled={isCreatingBackup}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                  >
                    {isCreatingBackup ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <HardDrive className="h-4 w-4 mr-2" />
                        Create Backup
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {backups.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Backup Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">
                    {backup.backup_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {backup.backup_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {backup.file_size
                      ? formatFileSize(backup.file_size)
                      : "N/A"}
                  </TableCell>
                  <TableCell>{backup.record_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(backup.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(backup.status)}
                        {backup.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(backup.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {backup.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadBackup(backup.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No backups created yet</p>
            <p className="text-sm">
              Create your first backup to ensure data safety
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

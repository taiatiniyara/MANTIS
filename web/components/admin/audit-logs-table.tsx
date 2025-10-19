"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Database } from "lucide-react";
import { useState } from "react";
import { ViewAuditLogDialog } from "./view-audit-log-dialog";

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_data: any;
  new_data: any;
  user_id: string | null;
  user_role: string | null;
  user_email: string | null;
  user_position: string | null;
  agency_name: string | null;
  record_description: string | null;
  timestamp: string;
}

interface AuditLogsTableProps {
  auditLogs: AuditLog[];
  userRole: string;
}

export function AuditLogsTable({ auditLogs, userRole }: AuditLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  function getActionBadge(action: string) {
    switch (action) {
      case "INSERT":
        return <Badge className="bg-green-600">Insert</Badge>;
      case "UPDATE":
        return <Badge className="bg-blue-600">Update</Badge>;
      case "DELETE":
        return <Badge className="bg-red-600">Delete</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  }

  function formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleExport() {
    const headers = [
      "Timestamp",
      "Table",
      "Action",
      "Record",
      "User",
      "Role",
      "Agency",
    ];

    const rows = auditLogs.map((log) => [
      formatTimestamp(log.timestamp),
      log.table_name,
      log.action,
      log.record_description || log.record_id,
      log.user_email || "System",
      log.user_role || "N/A",
      log.agency_name || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleViewLog(log: AuditLog) {
    setSelectedLog(log);
    setViewDialogOpen(true);
  }

  if (auditLogs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Database className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No audit logs</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No audit trail entries found for the selected filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {auditLogs.length} log{auditLogs.length === 1 ? "" : "s"} found
          </p>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.table_name}</Badge>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.record_description || (
                      <code className="text-xs">{log.record_id.slice(0, 8)}...</code>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {log.user_position || log.user_email || "System"}
                      </span>
                      {log.user_role && (
                        <span className="text-xs text-muted-foreground">
                          {log.user_role.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{log.agency_name || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewLog(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedLog && (
        <ViewAuditLogDialog
          auditLog={selectedLog}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}
    </>
  );
}

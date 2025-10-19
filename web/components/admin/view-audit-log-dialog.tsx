"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

interface ViewAuditLogDialogProps {
  auditLog: AuditLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewAuditLogDialog({
  auditLog,
  open,
  onOpenChange,
}: ViewAuditLogDialogProps) {
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function renderDataChanges() {
    if (auditLog.action === "INSERT") {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">New Data:</h4>
          <pre className="rounded-lg bg-muted p-4 text-xs overflow-auto">
            {JSON.stringify(auditLog.new_data, null, 2)}
          </pre>
        </div>
      );
    }

    if (auditLog.action === "DELETE") {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Deleted Data:</h4>
          <pre className="rounded-lg bg-muted p-4 text-xs overflow-auto">
            {JSON.stringify(auditLog.old_data, null, 2)}
          </pre>
        </div>
      );
    }

    if (auditLog.action === "UPDATE") {
      // Find changed fields
      const changes: { field: string; old: any; new: any }[] = [];
      
      if (auditLog.old_data && auditLog.new_data) {
        Object.keys(auditLog.new_data).forEach((key) => {
          if (JSON.stringify(auditLog.old_data[key]) !== JSON.stringify(auditLog.new_data[key])) {
            changes.push({
              field: key,
              old: auditLog.old_data[key],
              new: auditLog.new_data[key],
            });
          }
        });
      }

      return (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Changes ({changes.length} field{changes.length === 1 ? "" : "s"}):</h4>
          {changes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No changes detected</p>
          ) : (
            <div className="space-y-3">
              {changes.map((change, idx) => (
                <div key={idx} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {change.field}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Old:</span>
                      <pre className="mt-1 rounded bg-red-50 p-2 text-red-900">
                        {JSON.stringify(change.old, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-muted-foreground">New:</span>
                      <pre className="mt-1 rounded bg-green-50 p-2 text-green-900">
                        {JSON.stringify(change.new, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>
            Full details of the audit trail entry
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                <p className="text-sm">{formatTimestamp(auditLog.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Action</p>
                <div className="mt-1">{getActionBadge(auditLog.action)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Table</p>
                <Badge variant="outline" className="mt-1">
                  {auditLog.table_name}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Record ID</p>
                <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                  {auditLog.record_id}
                </code>
              </div>
            </div>

            <Separator />

            {/* User Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User</p>
                <p className="text-sm">
                  {auditLog.user_position || auditLog.user_email || "System"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-sm">
                  {auditLog.user_role?.replace("_", " ") || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Agency</p>
                <p className="text-sm">{auditLog.agency_name || "N/A"}</p>
              </div>
            </div>

            <Separator />

            {/* Data Changes */}
            {renderDataChanges()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

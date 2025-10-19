import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataArchiveManager } from "@/components/admin/data-archive-manager";
import { RetentionPolicies } from "@/components/admin/retention-policies";
import { BackupManager } from "@/components/admin/backup-manager";
import { Database, Archive, Clock, HardDrive } from "lucide-react";

export default async function DataManagementPage() {
  const supabase = await createClient();

  // Get archive statistics
  const { count: archivedCount } = await supabase
    .from("archived_infringements")
    .select("*", { count: "exact", head: true });

  const { count: activeCount } = await supabase
    .from("infringements")
    .select("*", { count: "exact", head: true });

  const { data: retentionPolicies } = await supabase
    .from("data_retention_policies")
    .select("*")
    .eq("is_active", true);

  const { data: recentJobs } = await supabase
    .from("archive_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: backups } = await supabase
    .from("backup_metadata")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">
          Archive, backup, and manage your data retention policies
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Records
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Infringements in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Archived Records
            </CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Infringements archived
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Retention Policies
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retentionPolicies?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Recent backups</p>
          </CardContent>
        </Card>
      </div>

      {/* Archive Manager */}
      <DataArchiveManager
        recentJobs={recentJobs || []}
        activeCount={activeCount || 0}
        archivedCount={archivedCount || 0}
      />

      {/* Retention Policies */}
      <RetentionPolicies policies={retentionPolicies || []} />

      {/* Backup Manager */}
      <BackupManager backups={backups || []} />
    </div>
  );
}

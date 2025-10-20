import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogsTable } from "@/components/admin/audit-logs-table";
import { Shield } from "lucide-react";

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Get user data
  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!userData || (userData.role !== "super_admin" && userData.role !== "agency_admin")) {
    return redirect("/protected");
  }

  // Fetch all audit logs (filtering will be done client-side)
  const { data: auditLogs } = await supabase
    .from("audit_logs_with_details")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(500);

  // Get list of users for filter dropdown
  let usersQuery = supabase.from("users").select("id, position, role");

  if (userData.role === "agency_admin") {
    usersQuery = usersQuery.eq("agency_id", userData.agency_id);
  }

  const { data: users } = await usersQuery;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground">
          Track all system changes for compliance and security
        </p>
      </div>

      <AuditLogsTable auditLogs={(auditLogs as any) || []} userRole={userData.role} />
    </div>
  );
}

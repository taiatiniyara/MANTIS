import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AgenciesTable } from "@/components/admin/agencies-table";
import { CreateAgencyDialog } from "@/components/admin/create-agency-dialog";

export default async function AdminAgenciesPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is super admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "super_admin") {
    redirect("/protected");
  }

  // Fetch all agencies (filtering will be done client-side)
  const { data: agencies, error } = await supabase
    .from("agencies")
    .select(`
      *,
      admin_users:users!users_agency_id_fkey(
        id,
        position,
        role
      )
    `)
    .order("name");

  if (error) {
    console.error("Error fetching agencies:", error);
  }

  // Get available users for admin assignment
  const { data: availableUsers } = await supabase
    .from("users")
    .select("id, position, agency_id, role")
    .order("position");

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agencies</h1>
          <p className="text-muted-foreground">
            Manage enforcement agencies across Fiji
          </p>
        </div>
        <CreateAgencyDialog />
      </div>

      <AgenciesTable 
        agencies={agencies || []}
        availableUsers={availableUsers || []}
      />
    </div>
  );
}

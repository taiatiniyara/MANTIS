import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamsTable } from "@/components/admin/teams-table";

export default async function ProtectedTeamsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get current user's role and agency
  const { data: currentUser } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!currentUser) {
    redirect("/protected");
  }

  // Check permissions - only agency admins can access
  const isAgencyAdmin = currentUser.role === "agency_admin";

  if (!isAgencyAdmin) {
    redirect("/protected");
  }

  // Fetch teams from the same agency only
  const { data: teams, error } = await supabase
    .from("teams")
    .select(`
      *,
      agency:agencies (
        id,
        name
      ),
      leader:users!teams_leader_id_fkey (
        id,
        full_name
      ),
      team_members (
        user:users (
          id,
          full_name
        )
      )
    `)
    .eq("agency_id", currentUser.agency_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching teams:", error);
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Teams Management</h1>
        <p className="text-destructive">Error loading teams. Please try again.</p>
      </div>
    );
  }

  // Fetch agencies for the form (only current agency)
  const { data: agencies } = await supabase
    .from("agencies")
    .select("id, name")
    .eq("id", currentUser.agency_id);

  // Fetch officers from the same agency for team assignment
  const { data: officers } = await supabase
    .from("users")
    .select("id, full_name, position, role, agency_id")
    .eq("agency_id", currentUser.agency_id)
    .in("role", ["officer", "agency_admin"])
    .order("full_name");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teams Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage patrol teams within your agency
        </p>
      </div>
      <TeamsTable
        teams={teams || []}
        agencies={agencies || []}
        users={officers || []}
        userRole={currentUser.role}
        userAgencyId={currentUser.agency_id}
      />
    </div>
  );
}

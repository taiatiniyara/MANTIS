import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamsTable } from "@/components/admin/teams-table";
import { CreateTeamDialog } from "@/components/admin/create-team-dialog";
import { TeamsSearch } from "@/components/admin/teams-search";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: { search?: string; agency?: string };
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return redirect("/auth/login");
  }

  // Check permissions
  const isSuperAdmin = profile.role === "super_admin";
  const isAgencyAdmin = profile.role === "agency_admin";

  if (!isSuperAdmin && !isAgencyAdmin) {
    return redirect("/protected");
  }

  // Build query based on role
  let query = supabase
    .from("teams")
    .select(`
      *,
      agency:agencies(id, name),
      team_members(count)
    `)
    .order("created_at", { ascending: false });

  // Agency admins only see their agency's teams
  if (isAgencyAdmin && profile.agency_id) {
    query = query.eq("agency_id", profile.agency_id);
  }

  // Apply search filter
  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`);
  }

  // Apply agency filter (super admin only)
  if (searchParams.agency && isSuperAdmin) {
    query = query.eq("agency_id", searchParams.agency);
  }

  const { data: teams, error } = await query;

  if (error) {
    console.error("Error fetching teams:", error);
  }

  // Fetch agencies for filters and dialogs
  let agenciesQuery = supabase
    .from("agencies")
    .select("id, name")
    .order("name");

  if (isAgencyAdmin && profile.agency_id) {
    agenciesQuery = agenciesQuery.eq("id", profile.agency_id);
  }

  const { data: agencies } = await agenciesQuery;

  // Fetch users for team member assignment
  let usersQuery = supabase
    .from("users")
    .select("id, position, role, agency_id")
    .order("position");

  if (isAgencyAdmin && profile.agency_id) {
    usersQuery = usersQuery.eq("agency_id", profile.agency_id);
  }

  const { data: users } = await usersQuery;

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage teams and team members
          </p>
        </div>
        <CreateTeamDialog
          agencies={agencies || []}
          userRole={profile.role}
          userAgencyId={profile.agency_id}
        />
      </div>

      <TeamsSearch
        agencies={agencies || []}
        userRole={profile.role}
      />

      <TeamsTable
        teams={teams || []}
        agencies={agencies || []}
        users={users || []}
        userRole={profile.role}
        userAgencyId={profile.agency_id}
      />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ManageTeamMembersPage } from "@/components/admin/manage-team-members-page";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamMembersPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  // Check permissions - agency admin or team leader
  const isAgencyAdmin = profile.role === "agency_admin";
  const isTeamLeader = profile.role === "team_leader";

  if (!isAgencyAdmin && !isTeamLeader) {
    redirect("/protected");
  }

  // Fetch team details with agency info
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      agency_id,
      agency:agencies(name)
    `)
    .eq("id", id)
    .single();

  if (teamError || !team) {
    redirect("/protected/teams");
  }

  // Check agency access
  if (team.agency_id !== profile.agency_id) {
    redirect("/protected/teams");
  }

  // Fetch users from the same agency
  const { data: users } = await supabase
    .from("users")
    .select("id, position, role, agency_id, email")
    .eq("agency_id", profile.agency_id)
    .order("position");

  return (
    <ManageTeamMembersPage
      team={team as any}
      users={users || []}
      userRole={profile.role}
    />
  );
}

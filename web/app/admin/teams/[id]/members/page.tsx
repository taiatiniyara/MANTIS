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

  // Check permissions
  const isSuperAdmin = profile.role === "super_admin";
  const isAgencyAdmin = profile.role === "agency_admin";

  if (!isSuperAdmin && !isAgencyAdmin) {
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
    redirect("/admin/teams");
  }

  // Check agency access for agency admins
  if (isAgencyAdmin && team.agency_id !== profile.agency_id) {
    redirect("/admin/teams");
  }

  // Fetch all users based on role
  let usersQuery = supabase
    .from("users")
    .select("id, position, role, agency_id, email")
    .order("position");

  // Agency admins only see users from their agency
  if (isAgencyAdmin && profile.agency_id) {
    usersQuery = usersQuery.eq("agency_id", profile.agency_id);
  }

  const { data: users } = await usersQuery;

  return (
    <ManageTeamMembersPage
      team={team as any}
      users={users || []}
      userRole={profile.role}
    />
  );
}

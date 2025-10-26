import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ManageTeamRoutesPage } from "@/components/admin/manage-team-routes-page";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamRoutesPage({ params }: PageProps) {
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

  return (
    <ManageTeamRoutesPage
      team={team as any}
      userRole={profile.role}
    />
  );
}

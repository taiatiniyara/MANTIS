import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoutesTable } from "@/components/admin/routes-table";

export default async function ProtectedRoutesPage() {
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

  // Fetch routes from the same agency only
  const { data: routes, error } = await supabase
    .from("routes")
    .select(`
      *,
      agency:agencies (
        id,
        name
      ),
      start_location:locations!routes_start_location_id_fkey (
        id,
        name,
        type
      ),
      end_location:locations!routes_end_location_id_fkey (
        id,
        name,
        type
      ),
      team_routes (
        team:teams (
          id,
          name
        )
      )
    `)
    .eq("agency_id", currentUser.agency_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching routes:", error);
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Routes Management</h1>
        <p className="text-destructive">Error loading routes. Please try again.</p>
      </div>
    );
  }

  // Fetch agencies for the form (only current agency)
  const { data: agencies } = await supabase
    .from("agencies")
    .select("id, name")
    .eq("id", currentUser.agency_id);

  // Fetch locations from the same agency
  const { data: locationsData } = await supabase
    .from("locations")
    .select(`
      id,
      name,
      type,
      agency_id
    `)
    .eq("agency_id", currentUser.agency_id)
    .order("name");

  // Transform locations data to match expected type
  const locations = locationsData?.map((loc: any) => ({
    id: loc.id,
    name: loc.name,
    type: loc.type,
    agency_id: loc.agency_id,
  })) || [];

  // Fetch teams from the same agency
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, agency_id")
    .eq("agency_id", currentUser.agency_id)
    .order("name");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Routes Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage patrol routes within your agency
        </p>
      </div>
      <RoutesTable
        routes={routes || []}
        agencies={agencies || []}
        locations={locations}
        teams={teams || []}
        userRole={currentUser.role}
        userAgencyId={currentUser.agency_id}
      />
    </div>
  );
}

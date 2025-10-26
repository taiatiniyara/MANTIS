import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoutesTable } from "@/components/admin/routes-table";
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";
import Link from "next/link";

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

  // Fetch routes from the same agency with coverage areas
  const { data: routes, error } = await supabase
    .from("routes")
    .select(`
      *,
      agency:agencies (
        id,
        name
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
      agency_id,
      latitude,
      longitude,
      address
    `)
    .eq("agency_id", currentUser.agency_id)
    .order("name");

  // Transform locations data to match expected type
  const locations = locationsData?.map((loc: any) => ({
    id: loc.id,
    name: loc.name,
    type: loc.type,
    agency_id: loc.agency_id,
    latitude: loc.latitude,
    longitude: loc.longitude,
    address: loc.address,
  })) || [];

  // Fetch teams from the same agency
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, agency_id")
    .eq("agency_id", currentUser.agency_id)
    .order("name");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Routes Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage patrol routes within your agency
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/protected/routes/map">
            <Button variant="outline">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </Link>
          <Link href="/protected/routes/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          </Link>
        </div>
      </div>
      <RoutesTable
        routes={routes || []}
        agencies={agencies || []}
        teams={teams || []}
        userRole={currentUser.role}
        userAgencyId={currentUser.agency_id}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocationsTable } from "@/components/admin/locations-table";

export default async function ProtectedLocationsPage() {
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

  // Fetch locations from the same agency only
  const { data: locations, error } = await supabase
    .from("locations")
    .select(`
      *,
      agency:agencies (
        id,
        name
      ),
      parent:parent_id (
        id,
        name,
        type
      ),
      children:locations!parent_id (
        id,
        name,
        type
      )
    `)
    .eq("agency_id", currentUser.agency_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching locations:", error);
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Locations Management</h1>
        <p className="text-destructive">Error loading locations. Please try again.</p>
      </div>
    );
  }

  // Fetch agencies for the form (only current agency)
  const { data: agencies } = await supabase
    .from("agencies")
    .select("id, name")
    .eq("id", currentUser.agency_id);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Locations Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage locations and hierarchies within your agency
        </p>
      </div>
      <LocationsTable
        locations={locations || []}
        agencies={agencies || []}
        allLocations={locations || []}
        userRole={currentUser.role}
        userAgencyId={currentUser.agency_id}
      />
    </div>
  );
}

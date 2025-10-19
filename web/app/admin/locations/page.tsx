import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LocationsTable } from "@/components/admin/locations-table";
import { CreateLocationDialog } from "@/components/admin/create-location-dialog";
import { LocationsSearch } from "@/components/admin/locations-search";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string; agency?: string };
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

  // Build query based on role
  let query = supabase
    .from("locations")
    .select(`
      *,
      agency:agencies(id, name),
      parent:locations!parent_id(id, name, type)
    `)
    .order("created_at", { ascending: false });

  // Agency admins only see their agency's locations
  if (profile.role === "agency_admin" && profile.agency_id) {
    query = query.eq("agency_id", profile.agency_id);
  }

  // Apply search filter
  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`);
  }

  // Apply type filter
  if (searchParams.type) {
    query = query.eq("type", searchParams.type);
  }

  // Apply agency filter (super admin only)
  if (searchParams.agency && profile.role === "super_admin") {
    query = query.eq("agency_id", searchParams.agency);
  }

  const { data: locations, error } = await query;

  if (error) {
    console.error("Error fetching locations:", error);
  }

  // Fetch agencies for filters and dialogs
  let agenciesQuery = supabase
    .from("agencies")
    .select("id, name")
    .order("name");

  if (profile.role === "agency_admin" && profile.agency_id) {
    agenciesQuery = agenciesQuery.eq("id", profile.agency_id);
  }

  const { data: agencies } = await agenciesQuery;

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">
            Manage divisions, stations, and other locations
          </p>
        </div>
        <CreateLocationDialog
          agencies={agencies || []}
          locations={locations || []}
          userRole={profile.role}
          userAgencyId={profile.agency_id}
        />
      </div>

      <LocationsSearch
        agencies={agencies || []}
        userRole={profile.role}
      />

      <LocationsTable
        locations={locations || []}
        agencies={agencies || []}
        allLocations={locations || []}
        userRole={profile.role}
        userAgencyId={profile.agency_id}
      />
    </div>
  );
}

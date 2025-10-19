import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoutesTable } from "@/components/admin/routes-table";
import { CreateRouteDialog } from "@/components/admin/create-route-dialog";
import { RoutesSearch } from "@/components/admin/routes-search";

export default async function RoutesPage({
  searchParams,
}: {
  searchParams: { search?: string; agency?: string; location?: string };
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
    .from("routes")
    .select(`
      *,
      agency:agencies(id, name),
      location:locations(id, name, type)
    `)
    .order("created_at", { ascending: false });

  // Agency admins only see their agency's routes
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

  // Apply location filter
  if (searchParams.location) {
    query = query.eq("location_id", searchParams.location);
  }

  const { data: routes, error } = await query;

  if (error) {
    console.error("Error fetching routes:", error);
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

  // Fetch locations for filters and dialogs
  let locationsQuery = supabase
    .from("locations")
    .select("id, name, type, agency_id")
    .order("name");

  if (isAgencyAdmin && profile.agency_id) {
    locationsQuery = locationsQuery.eq("agency_id", profile.agency_id);
  }

  const { data: locations } = await locationsQuery;

  // Fetch teams for route assignment
  let teamsQuery = supabase
    .from("teams")
    .select("id, name, agency_id")
    .order("name");

  if (isAgencyAdmin && profile.agency_id) {
    teamsQuery = teamsQuery.eq("agency_id", profile.agency_id);
  }

  const { data: teams } = await teamsQuery;

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Routes</h1>
          <p className="text-muted-foreground">
            Manage patrol routes and assignments
          </p>
        </div>
        <CreateRouteDialog
          agencies={agencies || []}
          locations={locations || []}
          userRole={profile.role}
          userAgencyId={profile.agency_id}
        />
      </div>

      <RoutesSearch
        agencies={agencies || []}
        locations={locations || []}
        userRole={profile.role}
      />

      <RoutesTable
        routes={routes || []}
        agencies={agencies || []}
        locations={locations || []}
        teams={teams || []}
        userRole={profile.role}
        userAgencyId={profile.agency_id}
      />
    </div>
  );
}

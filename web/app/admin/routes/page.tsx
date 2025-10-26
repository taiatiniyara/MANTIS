import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoutesTable } from "@/components/admin/routes-table";
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";
import Link from "next/link";

export default async function RoutesPage() {
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

  // Build query based on role - fetch routes with coverage areas
  let query = supabase
    .from("routes")
    .select(`
      *,
      agency:agencies(id, name)
    `)
    .order("created_at", { ascending: false });

  // Agency admins only see their agency's routes
  if (isAgencyAdmin && profile.agency_id) {
    query = query.eq("agency_id", profile.agency_id);
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
        <div className="flex items-center gap-2">
          <Link href="/admin/routes/map">
            <Button variant="outline">
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </Link>
          <Link href="/admin/routes/create">
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
        userRole={profile.role}
        userAgencyId={profile.agency_id}
      />
    </div>
  );
}

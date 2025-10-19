import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InfringementsTable } from "@/components/admin/infringements-table";
import { InfringementsSearch } from "@/components/admin/infringements-search";
import { CreateInfringementDialog } from "@/components/admin/create-infringement-dialog";

export default async function InfringementsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    agency?: string;
    type?: string;
    category?: string;
    officer?: string;
    team?: string;
    route?: string;
    location?: string;
    from?: string;
    to?: string;
  };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user details
  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "agency_admin"].includes(userData.role)) {
    redirect("/protected");
  }

  // Fetch filter data
  const [agenciesResult, categoriesResult, typesResult, teamsResult, routesResult, locationsResult, officersResult] =
    await Promise.all([
      supabase.from("agencies").select("id, name").order("name"),
      supabase.from("infringement_categories").select("id, name").order("name"),
      supabase.from("infringement_types").select("id, code, name, category_id").order("code"),
      supabase.from("teams").select("id, name, agency_id").order("name"),
      supabase.from("routes").select("id, name, agency_id").order("name"),
      supabase.from("locations").select("id, name, type, agency_id, parent_id").order("name"),
      supabase
        .from("users")
        .select("id, position, role, agency_id")
        .eq("role", "officer")
        .order("position"),
    ]);

  // Fetch infringements with all relationships
  let query = supabase
    .from("infringements")
    .select(
      `
      *,
      officer:users!officer_id (
        id,
        position,
        role
      ),
      agency:agencies (
        id,
        name
      ),
      team:teams (
        id,
        name
      ),
      route:routes (
        id,
        name
      ),
      type:infringement_types (
        id,
        code,
        name,
        fine_amount,
        demerit_points,
        gl_code,
        category:infringement_categories (
          id,
          name
        )
      ),
      location:locations (
        id,
        name,
        type
      )
    `
    )
    .order("issued_at", { ascending: false });

  // Apply filters
  if (userData.role === "agency_admin" && userData.agency_id) {
    query = query.eq("agency_id", userData.agency_id);
  } else if (searchParams.agency) {
    query = query.eq("agency_id", searchParams.agency);
  }

  if (searchParams.type) {
    query = query.eq("type_id", searchParams.type);
  }

  if (searchParams.category) {
    // Filter by category through type
    const categoryTypes = typesResult.data?.filter(
      (t) => t.category_id === searchParams.category
    );
    if (categoryTypes && categoryTypes.length > 0) {
      query = query.in(
        "type_id",
        categoryTypes.map((t) => t.id)
      );
    }
  }

  if (searchParams.officer) {
    query = query.eq("officer_id", searchParams.officer);
  }

  if (searchParams.team) {
    query = query.eq("team_id", searchParams.team);
  }

  if (searchParams.route) {
    query = query.eq("route_id", searchParams.route);
  }

  if (searchParams.location) {
    query = query.eq("location_id", searchParams.location);
  }

  if (searchParams.search) {
    query = query.ilike("vehicle_id", `%${searchParams.search}%`);
  }

  if (searchParams.from) {
    query = query.gte("issued_at", searchParams.from);
  }

  if (searchParams.to) {
    query = query.lte("issued_at", searchParams.to);
  }

  const { data: infringements, error } = await query;

  if (error) {
    console.error("Error fetching infringements:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Infringements</h1>
          <p className="text-muted-foreground mt-2">
            Record and manage traffic infringements
          </p>
        </div>
        <CreateInfringementDialog
          agencies={agenciesResult.data || []}
          categories={categoriesResult.data || []}
          types={typesResult.data || []}
          teams={teamsResult.data || []}
          routes={routesResult.data || []}
          locations={locationsResult.data || []}
          officers={officersResult.data || []}
          userRole={userData.role}
          userAgencyId={userData.agency_id}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Infringement
          </Button>
        </CreateInfringementDialog>
      </div>

      <InfringementsSearch
        agencies={agenciesResult.data || []}
        categories={categoriesResult.data || []}
        types={typesResult.data || []}
        teams={teamsResult.data || []}
        routes={routesResult.data || []}
        locations={locationsResult.data || []}
        officers={officersResult.data || []}
        userRole={userData.role}
      />

      <InfringementsTable
        infringements={(infringements as any) || []}
        agencies={agenciesResult.data || []}
        categories={categoriesResult.data || []}
        types={typesResult.data || []}
        teams={teamsResult.data || []}
        routes={routesResult.data || []}
        locations={locationsResult.data || []}
        officers={officersResult.data || []}
        userRole={userData.role}
        userAgencyId={userData.agency_id}
      />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InfringementsTable } from "@/components/admin/infringements-table";
import { CreateInfringementDialog } from "@/components/admin/create-infringement-dialog";

export default async function InfringementsPage() {
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
  const [agenciesResult, categoriesResult, typesResult, teamsResult, routesResult, officersResult] =
    await Promise.all([
      supabase.from("agencies").select("id, name").order("name"),
      supabase.from("infringement_categories").select("id, name").order("name"),
      supabase.from("infringement_types").select("id, code, name, category_id, fine_amount, demerit_points, gl_code").order("code"),
      supabase.from("teams").select("id, name, agency_id").order("name"),
      supabase.from("routes").select("id, name, agency_id").order("name"),
      supabase
        .from("users")
        .select("id, position, role, agency_id")
        .eq("role", "officer")
        .order("position"),
    ]);

  // Fetch all infringements (filtering will be done client-side)
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
      )
    `
    )
    .order("issued_at", { ascending: false });

  // Agency admins only see their agency's infringements
  if (userData.role === "agency_admin" && userData.agency_id) {
    query = query.eq("agency_id", userData.agency_id);
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
          users={officersResult.data || []}
          userRole={userData.role}
          userAgencyId={userData.agency_id}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Infringement
          </Button>
        </CreateInfringementDialog>
      </div>

      <InfringementsTable
        infringements={(infringements as any) || []}
        agencies={agenciesResult.data || []}
        categories={categoriesResult.data || []}
        types={typesResult.data || []}
        teams={teamsResult.data || []}
        routes={routesResult.data || []}
        officers={officersResult.data || []}
        userRole={userData.role}
        userAgencyId={userData.agency_id}
      />
    </div>
  );
}

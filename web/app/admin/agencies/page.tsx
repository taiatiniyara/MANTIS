import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AgenciesTable } from "@/components/admin/agencies-table";
import { CreateAgencyDialog } from "@/components/admin/create-agency-dialog";
import { AgenciesSearch } from "@/components/admin/agencies-search";

export default async function AdminAgenciesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is super admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "super_admin") {
    redirect("/protected");
  }

  // Build query with search filter
  let query = supabase
    .from("agencies")
    .select("*")
    .order("name");

  // Apply search filter if provided
  const searchTerm = searchParams.search;
  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  const { data: agencies, error } = await query;

  if (error) {
    console.error("Error fetching agencies:", error);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agencies</h1>
          <p className="text-muted-foreground">
            Manage enforcement agencies across Fiji
          </p>
        </div>
        <CreateAgencyDialog />
      </div>

      <AgenciesSearch />

      <AgenciesTable agencies={agencies || []} />
    </div>
  );
}

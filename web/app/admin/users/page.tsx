import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/admin/users-table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UsersSearch } from "@/components/admin/users-search";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; agency?: string };
}) {
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

  // Check permissions
  const isSuperAdmin = currentUser.role === "super_admin";
  const isAgencyAdmin = currentUser.role === "agency_admin";

  if (!isSuperAdmin && !isAgencyAdmin) {
    redirect("/protected");
  }

  // Build query
  let query = supabase
    .from("users")
    .select(`
      *,
      agencies (
        id,
        name
      ),
      locations (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  // Agency admins can only see users in their agency
  if (isAgencyAdmin && currentUser.agency_id) {
    query = query.eq("agency_id", currentUser.agency_id);
  }

  // Apply search filter
  if (searchParams.search) {
    query = query.or(`position.ilike.%${searchParams.search}%`);
  }

  // Apply role filter
  if (searchParams.role) {
    query = query.eq("role", searchParams.role);
  }

  // Apply agency filter (super admin only)
  if (searchParams.agency && isSuperAdmin) {
    query = query.eq("agency_id", searchParams.agency);
  }

  const { data: users, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
  }

  // Fetch agencies for filters (super admin only)
  let agencies: Array<{ id: string; name: string }> = [];
  if (isSuperAdmin) {
    const { data: agenciesData } = await supabase
      .from("agencies")
      .select("id, name")
      .order("name");
    agencies = agenciesData || [];
  }

  // Fetch locations for assignment
  let locationsQuery = supabase
    .from("locations")
    .select(`
      *,
      parent:locations!parent_id(id, name, type)
    `)
    .order("name");

  if (isAgencyAdmin && currentUser.agency_id) {
    locationsQuery = locationsQuery.eq("agency_id", currentUser.agency_id);
  }

  const { data: locations } = await locationsQuery;

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? "Manage users across all agencies"
              : "Manage users in your agency"}
          </p>
        </div>
        <CreateUserDialog
          isSuperAdmin={isSuperAdmin}
          currentAgencyId={currentUser.agency_id}
          agencies={agencies}
          locations={locations || []}
        />
      </div>

      <UsersSearch
        isSuperAdmin={isSuperAdmin}
        agencies={agencies}
      />

      <UsersTable
        users={users || []}
        isSuperAdmin={isSuperAdmin}
        currentUserId={user.id}
        agencies={agencies}
        locations={locations || []}
      />
    </div>
  );
}

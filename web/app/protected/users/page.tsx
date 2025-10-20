import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "@/components/admin/users-table";

export default async function ProtectedUsersPage() {
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

  // Fetch users from the same agency only
  const { data: users, error } = await supabase
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
    .eq("agency_id", currentUser.agency_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-destructive">Error loading users. Please try again.</p>
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
      parent:parent_id (
        id,
        name,
        type
      )
    `)
    .eq("agency_id", currentUser.agency_id)
    .order("name");

  // Transform locations data to match expected type
  const locations = locationsData?.map((loc: any) => ({
    id: loc.id,
    name: loc.name,
    type: loc.type,
    agency_id: loc.agency_id,
    parent: loc.parent?.[0] || null,
  })) || [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users within your agency
        </p>
      </div>
      <UsersTable
        users={users || []}
        agencies={agencies || []}
        locations={locations}
        isSuperAdmin={false}
        currentUserId={user.id}
      />
    </div>
  );
}

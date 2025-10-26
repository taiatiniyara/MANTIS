import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateRouteForm } from "@/components/admin/create-route-form";

export default async function CreateRoutePage() {
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

  // Fetch agencies for the form (only current agency)
  const { data: agencies } = await supabase
    .from("agencies")
    .select("id, name")
    .eq("id", currentUser.agency_id);

  return (
    <CreateRouteForm
      agencies={agencies || []}
      userRole={currentUser.role}
      userAgencyId={currentUser.agency_id}
    />
  );
}

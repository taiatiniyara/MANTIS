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

  // Fetch agencies for the form
  let agenciesQuery = supabase
    .from("agencies")
    .select("id, name")
    .order("name");

  if (isAgencyAdmin && profile.agency_id) {
    agenciesQuery = agenciesQuery.eq("id", profile.agency_id);
  }

  const { data: agencies } = await agenciesQuery;

  return (
    <CreateRouteForm
      agencies={agencies || []}
      userRole={profile.role}
      userAgencyId={profile.agency_id}
    />
  );
}

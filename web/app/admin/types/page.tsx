import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TypesTable } from "@/components/admin/types-table";
import { CreateTypeDialog } from "@/components/admin/create-type-dialog";

export default async function TypesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "agency_admin"].includes(userData.role)) {
    redirect("/protected");
  }

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from("infringement_categories")
    .select("id, name")
    .order("name");

  // Fetch all infringement types (filtering will be done client-side)
  const { data: types, error } = await supabase
    .from("infringement_types")
    .select(
      `
      *,
      category:infringement_categories (
        id,
        name
      )
    `
    )
    .order("code");

  if (error) {
    console.error("Error fetching types:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Infringement Types
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage infringement types, fines, and GL codes
          </p>
        </div>
        <CreateTypeDialog categories={categories || []}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Type
          </Button>
        </CreateTypeDialog>
      </div>

      <TypesTable types={(types as any) || []} categories={categories || []} />
    </div>
  );
}

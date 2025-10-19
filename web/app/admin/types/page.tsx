import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TypesTable } from "@/components/admin/types-table";
import { TypesSearch } from "@/components/admin/types-search";
import { CreateTypeDialog } from "@/components/admin/create-type-dialog";

export default async function TypesPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string };
}) {
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

  // Fetch infringement types
  let query = supabase
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

  if (searchParams.search) {
    query = query.or(
      `name.ilike.%${searchParams.search}%,code.ilike.%${searchParams.search}%`
    );
  }

  if (searchParams.category) {
    query = query.eq("category_id", searchParams.category);
  }

  const { data: types, error } = await query;

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

      <TypesSearch categories={categories || []} />

      <TypesTable types={(types as any) || []} categories={categories || []} />
    </div>
  );
}

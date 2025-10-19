import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoriesTable } from "@/components/admin/categories-table";
import { CategoriesSearch } from "@/components/admin/categories-search";
import { CreateCategoryDialog } from "@/components/admin/create-category-dialog";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { search?: string };
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

  // Fetch categories
  let query = supabase
    .from("infringement_categories")
    .select("*")
    .order("name");

  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`);
  }

  const { data: categories, error } = await query;

  if (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Infringement Categories
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage infringement categories for your organization
          </p>
        </div>
        <CreateCategoryDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </CreateCategoryDialog>
      </div>

      <CategoriesSearch />

      <CategoriesTable categories={categories || []} />
    </div>
  );
}

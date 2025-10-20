import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoriesTable } from "@/components/admin/categories-table";
import { CreateCategoryDialog } from "@/components/admin/create-category-dialog";

export default async function CategoriesPage() {
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

  // Fetch all categories (filtering will be done client-side)
  const { data: categories, error } = await supabase
    .from("infringement_categories")
    .select("*")
    .order("name");

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

      <CategoriesTable categories={categories || []} />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { type OffenceCategory } from "@/lib/supabase/schema";
import SupabaseDataLoader from "@/components/supabaseLoader";
import { H2 } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree, Plus, FileText } from "lucide-react";

export const Route = createFileRoute("/super-admin/offence-categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["offence_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offence_categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as OffenceCategory[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <H2>Offence Categories</H2>
          <p className="text-muted-foreground mt-2">
            Organise offences into categories
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/super-admin/offences">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Offences
            </Button>
          </a>
          <a href="/super-admin/offence-categories/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </a>
        </div>
      </div>

      <SupabaseDataLoader data={categories} isLoading={isLoading} error={error}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-primary" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              {category.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {categories?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderTree className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create a category before adding offences
              </p>
              <a href="/super-admin/offence-categories/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </SupabaseDataLoader>
    </div>
  );
}

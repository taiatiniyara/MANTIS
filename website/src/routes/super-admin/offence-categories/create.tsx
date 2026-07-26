import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { H2 } from "@/components/ui/heading";
import { InputWithLabel } from "@/components/ui/inputWithLabel";
import FormSubmission from "@/components/form";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { tableNames, type NewOffenceCategory } from "@/lib/supabase/schema";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/super-admin/offence-categories/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <div className="mb-6 sm:mb-8">
        <H2 className="text-xl sm:text-2xl">Create Offence Category</H2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Group offences under a category (e.g. Speeding, Parking, Licensing)
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <FormSubmission
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              const name = (formData.get("name") as string)?.trim();
              const description = (formData.get("description") as string)?.trim();

              if (!name) {
                toast.error("Category name is required");
                return;
              }

              const categoryData: NewOffenceCategory = { name };
              if (description) categoryData.description = description;

              const { error } = await supabase
                .from(tableNames.offenceCategories)
                .insert(categoryData)
                .select()
                .single();

              if (error) {
                toast.error(`Failed to create category: ${error.message}`);
              } else {
                toast.success("Category created successfully!");
                navigate({ to: "/super-admin/offence-categories" });
              }
            }}
            btnText="Create Category"
            className="space-y-4 sm:space-y-6"
          >
            <InputWithLabel
              label="Category Name"
              name="name"
              type="text"
              placeholder="e.g., Speeding"
              required
            />

            <InputWithLabel
              label="Description (Optional)"
              name="description"
              type="text"
              placeholder="Short description of this category"
            />
          </FormSubmission>
        </CardContent>
      </Card>
    </div>
  );
}

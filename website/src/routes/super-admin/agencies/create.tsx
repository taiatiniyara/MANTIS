import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { H2 } from "@/components/ui/heading";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/inputWithLabel";
import FormSubmission from "@/components/form";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { tableNames, type NewAgency } from "@/lib/supabase/schema";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/super-admin/agencies/create")({
  component: RouteComponent,
});

const AGENCY_TYPES = [
  { value: "National", label: "National" },
  { value: "Municipal", label: "Municipal" },
  { value: "Police", label: "Police" },
];

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <div className="mb-6 sm:mb-8">
        <H2 className="text-xl sm:text-2xl">Create New Agency</H2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Register an enforcement agency (e.g. LTA, a Municipal Council, or Fiji
          Police)
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <FormSubmission
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              const name = (formData.get("name") as string)?.trim();
              const code = (formData.get("code") as string)?.trim().toUpperCase();
              const type = formData.get("type") as NewAgency["type"];

              if (!name || !code || !type) {
                toast.error("Name, code and type are all required");
                return;
              }

              const agencyData: NewAgency = { name, code, type };

              const { error } = await supabase
                .from(tableNames.agencies)
                .insert(agencyData)
                .select()
                .single();

              if (error) {
                toast.error(`Failed to create agency: ${error.message}`);
              } else {
                toast.success("Agency created successfully!");
                navigate({ to: "/super-admin/agencies" });
              }
            }}
            btnText="Create Agency"
            className="space-y-4 sm:space-y-6"
          >
            <InputWithLabel
              label="Agency Name"
              name="name"
              type="text"
              placeholder="e.g., Suva City Council"
              required
            />

            <InputWithLabel
              label="Agency Code"
              name="code"
              type="text"
              placeholder="e.g., SCC, LTA, FJPOL"
              required
            />

            <SelectWithLabel
              label="Agency Type"
              name="type"
              options={AGENCY_TYPES}
            />

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The agency code must be unique and is used
                across the platform to identify the agency. It will be stored in
                uppercase.
              </p>
            </div>
          </FormSubmission>
        </CardContent>
      </Card>
    </div>
  );
}

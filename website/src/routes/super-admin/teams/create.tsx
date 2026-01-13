import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { H2 } from "@/components/ui/heading";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/inputWithLabel";
import FormSubmission from "@/components/form";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import {
  tableNames,
  type Agency,
  type Location,
  type NewTeam,
} from "@/lib/supabase/schema";
import LoadingComponent from "@/components/puffLoader";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/super-admin/teams/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const agencies = useSupabaseQuery<Agency>({
    queryKey: ["agencies"],
    tableName: "agencies",
  });

  const locations = useSupabaseQuery<Location>({
    queryKey: ["locations"],
    tableName: "locations",
  });

  if (agencies.isLoading || locations.isLoading) return <LoadingComponent />;

  if (agencies.error)
    return <div>Error loading agencies: {agencies.error.message}</div>;

  if (locations.error)
    return <div>Error loading locations: {locations.error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <H2>Create New Team</H2>
        <p className="text-muted-foreground mt-2">
          Add a new team to an agency
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <FormSubmission
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              const name = formData.get("name") as string;
              const agency_id = formData.get("agency_id") as string;
              const location_id = formData.get("location_id") as string;

              if (!name || !agency_id) {
                toast.error("Team name and agency are required");
                return;
              }

              const teamData: NewTeam = {
                name: name,
                agency_id: agency_id,
              };

              if (location_id) {
                teamData.location_id = location_id;
              }

              const { error } = await supabase
                .from(tableNames.teams)
                .insert(teamData)
                .select()
                .single();

              if (error) {
                toast.error(`Failed to create team: ${error.message}`);
              } else {
                toast.success("Team created successfully!");
                navigate({ to: "/super-admin/teams" });
              }
            }}
            btnText="Create Team"
            className="space-y-6"
          >
            <InputWithLabel
              label="Team Name"
              name="name"
              type="text"
              placeholder="e.g., Suva Parking Enforcement"
              required
            />

            <SelectWithLabel
              label="Agency"
              name="agency_id"
              options={agencies.data!.map((agency) => ({
                value: agency.id,
                label: `${agency.name} (${agency.code})`,
              }))}
            />

            <SelectWithLabel
              label="Location (Optional)"
              name="location_id"
              options={[
                { value: "", label: "No specific location" },
                ...locations.data!.map((location) => ({
                  value: location.id,
                  label: `${location.name} (${location.type})`,
                })),
              ]}
            />

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The team will be created under the
                selected agency. You can optionally assign it to a specific
                location for better organization.
              </p>
            </div>
          </FormSubmission>
        </CardContent>
      </Card>
    </div>
  );
}


import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { H2 } from "@/components/ui/heading";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/inputWithLabel";
import { Label } from "@/components/ui/label";
import FormSubmission from "@/components/form";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import {
  tableNames,
  type Agency,
  type NewOffence,
  type OffenceCategory,
} from "@/lib/supabase/schema";
import LoadingComponent from "@/components/puffLoader";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/super-admin/offences/create")({
  component: RouteComponent,
});

const AGENCY_TYPES = [
  { value: "National", label: "National" },
  { value: "Municipal", label: "Municipal" },
  { value: "Police", label: "Police" },
];

const SEVERITIES = [
  { value: "minor", label: "Minor" },
  { value: "serious", label: "Serious" },
  { value: "critical", label: "Critical" },
];

function RouteComponent() {
  const navigate = useNavigate();

  const agencies = useSupabaseQuery<Agency>({
    queryKey: ["agencies"],
    tableName: "agencies",
  });

  const categories = useQuery({
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

  if (agencies.isLoading || categories.isLoading) return <LoadingComponent />;

  if (agencies.error)
    return <div>Error loading agencies: {agencies.error.message}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <H2 className="text-xl sm:text-2xl">Create New Offence</H2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Define an offence with its fixed penalty and requirements
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <FormSubmission
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              const code = (formData.get("code") as string)?.trim().toUpperCase();
              const name = (formData.get("name") as string)?.trim();
              const description = (formData.get("description") as string)?.trim();
              const category_id = formData.get("category_id") as string;
              const agency_type = formData.get("agency_type") as string;
              const agency_id = formData.get("agency_id") as string;
              const severity = (formData.get("severity") as string) || "minor";
              const fixedPenaltyRaw = formData.get("fixed_penalty") as string;
              const fixed_penalty = parseInt(fixedPenaltyRaw, 10);

              if (!code || !name || !agency_type) {
                toast.error("Code, name and agency type are required");
                return;
              }
              if (Number.isNaN(fixed_penalty) || fixed_penalty < 0) {
                toast.error("Fixed penalty must be a valid amount (FJD)");
                return;
              }

              const offenceData: NewOffence = {
                code,
                name,
                agency_type,
                fixed_penalty,
                severity,
                requires_evidence: formData.get("requires_evidence") === "on",
                requires_location: formData.get("requires_location") === "on",
                active: formData.get("active") === "on",
              };

              if (description) offenceData.description = description;
              if (category_id) offenceData.category_id = category_id;
              if (agency_id) offenceData.agency_id = agency_id;

              const { error } = await supabase
                .from(tableNames.offences)
                .insert(offenceData)
                .select()
                .single();

              if (error) {
                toast.error(`Failed to create offence: ${error.message}`);
              } else {
                toast.success("Offence created successfully!");
                navigate({ to: "/super-admin/offences" });
              }
            }}
            btnText="Create Offence"
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <InputWithLabel
                label="Offence Code"
                name="code"
                type="text"
                placeholder="e.g., LTA-001"
                required
              />
              <InputWithLabel
                label="Fixed Penalty (FJD)"
                name="fixed_penalty"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 50"
                required
              />
              <div className="md:col-span-2">
                <InputWithLabel
                  label="Offence Name"
                  name="name"
                  type="text"
                  placeholder="e.g., Exceeding speed limit by 10-20 km/h"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <InputWithLabel
                  label="Description (Optional)"
                  name="description"
                  type="text"
                  placeholder="Legislation / bylaw reference or detail"
                />
              </div>

              <SelectWithLabel
                label="Category (Optional)"
                name="category_id"
                options={(categories.data ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
              <SelectWithLabel
                label="Agency Type"
                name="agency_type"
                options={AGENCY_TYPES}
              />
              <SelectWithLabel
                label="Severity"
                name="severity"
                options={SEVERITIES}
              />
              <SelectWithLabel
                label="Specific Agency (Optional)"
                name="agency_id"
                options={(agencies.data ?? []).map((agency) => ({
                  value: agency.id,
                  label: `${agency.name} (${agency.code})`,
                }))}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-sm font-semibold">Requirements</Label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="requires_evidence"
                  className="h-4 w-4"
                />
                Requires photographic evidence
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="requires_location"
                  defaultChecked
                  className="h-4 w-4"
                />
                Requires GPS location
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked
                  className="h-4 w-4"
                />
                Active (available for new infringements)
              </label>
            </div>
          </FormSubmission>
        </CardContent>
      </Card>
    </div>
  );
}

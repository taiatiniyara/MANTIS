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
  type NewUser,
  type Role,
  type Team,
} from "@/lib/supabase/schema";
import LoadingComponent from "@/components/puffLoader";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/super-admin/users/create")({
  component: RouteComponent,
});

const ROLES: { value: Role; label: string }[] = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Agency Admin", label: "Agency Admin" },
  { value: "Team Leader", label: "Team Leader" },
  { value: "Officer", label: "Officer" },
  { value: "Government Official", label: "Government Official" },
  { value: "Citizen", label: "Citizen" },
];

function RouteComponent() {
  const navigate = useNavigate();

  const agencies = useSupabaseQuery<Agency>({
    queryKey: ["agencies"],
    tableName: "agencies",
  });

  const teams = useSupabaseQuery<Team>({
    queryKey: ["teams"],
    tableName: "teams",
  });

  if (agencies.isLoading || teams.isLoading) return <LoadingComponent />;

  if (agencies.error)
    return <div>Error loading agencies: {agencies.error.message}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <div className="mb-6 sm:mb-8">
        <H2 className="text-xl sm:text-2xl">Add New User</H2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Provision a user account and assign their role, agency and team
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <FormSubmission
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              const email = (formData.get("email") as string)?.trim();
              const password = formData.get("password") as string;
              const display_name = (formData.get("display_name") as string)?.trim();
              const role = formData.get("role") as Role;
              const agency_id = formData.get("agency_id") as string;
              const team_id = formData.get("team_id") as string;

              if (!email || !password || !role || !agency_id) {
                toast.error("Email, password, role and agency are required");
                return;
              }
              if (password.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
              }

              const signUp = await supabase.auth.signUp({ email, password });
              if (signUp.error) {
                toast.error(signUp.error.message);
                return;
              }

              const authUser = signUp.data.user;
              if (!authUser) {
                toast.error("Could not create the auth account");
                return;
              }

              const newUser: NewUser = {
                id: authUser.id,
                agency_id,
                role,
                display_name: display_name || email,
                team_id: team_id || undefined,
              };

              const { error } = await supabase
                .from(tableNames.users)
                .insert(newUser);

              if (error) {
                toast.error(`Failed to save user record: ${error.message}`);
                return;
              }

              toast.success(
                "User created. They must confirm their email before signing in.",
              );
              navigate({ to: "/super-admin/users" });
            }}
            btnText="Create User"
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <InputWithLabel
                  label="Display Name"
                  name="display_name"
                  type="text"
                  placeholder="e.g., Sgt. Joeli Naqiri"
                />
              </div>
              <InputWithLabel
                label="Email"
                name="email"
                type="email"
                placeholder="user@agency.gov.fj"
                required
              />
              <InputWithLabel
                label="Temporary Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                required
              />
              <SelectWithLabel label="Role" name="role" options={ROLES} />
              <SelectWithLabel
                label="Agency"
                name="agency_id"
                options={(agencies.data ?? []).map((agency) => ({
                  value: agency.id,
                  label: `${agency.name} (${agency.code})`,
                }))}
              />
              <div className="md:col-span-2">
                <SelectWithLabel
                  label="Team (Optional)"
                  name="team_id"
                  options={(teams.data ?? []).map((team) => ({
                    value: team.id,
                    label: team.name,
                  }))}
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The user is created via email sign-up and
                must confirm their email before they can sign in. Full admin
                provisioning (e.g. auto-confirmed accounts) requires a
                service-role key via a secure server function.
              </p>
            </div>
          </FormSubmission>
        </CardContent>
      </Card>
    </div>
  );
}

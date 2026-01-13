import FormSubmission from "@/components/form";
import Logo from "@/components/logo";
import LoadingComponent from "@/components/puffLoader";
import { H2 } from "@/components/ui/heading";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/inputWithLabel";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/lib/supabase/client";
import {
  tableNames,
  type Agency,
  type NewUser,
  type Team,
} from "@/lib/supabase/schema";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const agencies = useSupabaseQuery<Agency>({
    tableName: "agencies",
    queryKey: ["agencies"],
  });

  const teams = useSupabaseQuery<Team>({
    tableName: "teams",
    queryKey: ["teams"],
  });

  if (agencies.isLoading || teams.isLoading)
    return (
      <div className="flex justify-center items-center w-full h-screen space-y-4 flex-col">
        <LoadingComponent />
      </div>
    );

  if (agencies.error || teams.error)
    return (
      <div className="w-full bg-red-100 border border-red-500 text-red-600 p-4 m-4 text-center">
        Error: {agencies.error?.message || teams.error?.message}
      </div>
    );

  return (
    <div className="flex justify-center items-center w-full min-h-screen py-8 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6 flex flex-col">
        <Logo />
        <FormSubmission
          onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;
          const firstName = formData.get("firstName") as string;
          const lastName = formData.get("lastName") as string;
          const agency_id = formData.get("agency") as string;
          const team_id = formData.get("team") as string;

          const r = await supabase.auth.signUp({
            email,
            password,
          });

          if (r.error) {
            toast.error(r.error.message);
            return;
          }

          const u = r.data.user;

          const newUser: NewUser = {
            id: u!.id,
            agency_id: agency_id,
            role: "Officer",
            display_name: `${firstName} ${lastName}`,
            team_id: team_id || undefined,
          };

          const us = await supabase.from(tableNames.users).insert(newUser);
          if (us.error) {
            toast.error(us.error.message);
            return;
          }

          toast.success("Registered successfully! Please check your email.");
        }}
        className="space-y-4 sm:space-y-6 flex flex-col border p-6 sm:p-8 rounded-lg shadow-md w-full"
      >
        <H2 className="text-center text-xl sm:text-2xl">Register</H2>
        <p className="text-center font-medium text-sm">
          Or{" "}
          <a
            href="/auth/login"
            className="text-primary hover:underline font-bold"
          >
            Login
          </a>
        </p>
        <hr />

        {/* Form fields would go here */}

        <SelectWithLabel
          label="Agency"
          name="agency"
          options={agencies.data!.map((agency) => ({
            value: agency.id,
            label: agency.name,
          }))}
        />

        <SelectWithLabel
          label="Team"
          name="team"
          options={teams.data!.map((team) => ({
            value: team.id,
            label: team.name,
          }))}
        />

        <InputWithLabel
          label="First Name"
          name="firstName"
          type="text"
          placeholder="Enter your first name"
        />

        <InputWithLabel
          label="Last Name"
          name="lastName"
          type="text"
          placeholder="Enter your last name"
        />

        <InputWithLabel
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
        />

        <InputWithLabel
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
        />
        </FormSubmission>
      </div>
    </div>
  );
}

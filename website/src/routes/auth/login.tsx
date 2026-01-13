import FormSubmission from "@/components/form";
import Logo from "@/components/logo";
import { InputWithLabel } from "@/components/ui/inputWithLabel";
import { H2 } from "@/components/ui/heading";
import { supabase } from "@/lib/supabase/client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { tableNames } from "@/lib/supabase/schema";
import { roleToLink } from "@/lib/utils";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
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
          const q = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (q.error) {
            toast.error(q.error.message);
          } else {
            toast.success("Logged in successfully!");
            const user = await supabase.from(tableNames.users).select("*").eq("id", q.data.user.id).single();
            if (user.error) {
              toast.error("Failed to fetch user data.");
            } else {
              const userData = user.data;
              window.location.href = `/${roleToLink(userData.role)}`;
            }
          }
        }}
        btnText="Login"
        className="space-y-4 w-full flex flex-col border p-6 sm:p-8 rounded-lg shadow-md"
      >
        <H2 className="text-center text-xl sm:text-2xl">Login</H2>
        <p className="text-center font-medium text-sm">
          Or{" "}
          <a
            href="/auth/register"
            className="text-primary hover:underline font-bold"
          >
            Create an account
          </a>
        </p>
        <hr />

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

        <Link
          to="/auth/forgot-password"
          className="text-sm text-primary hover:underline font-bold"
        >
          Forgot password?
        </Link>
        </FormSubmission>
      </div>
    </div>
  );
}

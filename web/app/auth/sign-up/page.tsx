import { SignUpForm } from "@/components/sign-up-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function Page() {
  return (
    <AuthLayout
      title="Join MANTIS"
      description="Create your staff account - Administrator approval required"
    >
      <SignUpForm />
    </AuthLayout>
  );
}

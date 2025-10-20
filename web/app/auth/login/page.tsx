import { LoginForm } from "@/components/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function Page() {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to access your MANTIS dashboard"
    >
      <LoginForm />
    </AuthLayout>
  );
}

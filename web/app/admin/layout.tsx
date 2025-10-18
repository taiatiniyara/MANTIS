import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is super admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "super_admin") {
    redirect("/protected");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl font-bold">
                MANTIS Admin
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/admin/agencies"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Agencies
                </Link>
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/reports"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Reports
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

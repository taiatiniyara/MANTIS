import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Route, 
  FileText,
  Shield
} from "lucide-react";

export default async function ProtectedLayout({
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

  // Get user role and agency
  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id, position, agency:agencies(name)")
    .eq("id", user.id)
    .single();

  if (!userData) {
    redirect("/auth/login");
  }

  // Redirect super admin to admin dashboard
  if (userData.role === "super_admin") {
    redirect("/admin");
  }

  const isAgencyAdmin = userData.role === "agency_admin";
  const agencyName = (userData.agency as any)?.name || "Unknown Agency";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/protected" className="text-xl font-bold">
                MANTIS
              </Link>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{agencyName}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{userData.position || "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-background">
          <nav className="flex flex-col gap-2 p-4">
            <Link
              href="/protected"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href="/protected/infringements"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="h-4 w-4" />
              Infringements
            </Link>

            {isAgencyAdmin && (
              <>
                <div className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Management
                </div>

                <Link
                  href="/protected/users"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>

                <Link
                  href="/protected/teams"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Users className="h-4 w-4" />
                  Teams
                </Link>

                <Link
                  href="/protected/routes"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Route className="h-4 w-4" />
                  Routes
                </Link>

                <Link
                  href="/protected/locations"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <MapPin className="h-4 w-4" />
                  Locations
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

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
  Shield,
  TrendingUp
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
  const isOfficer = userData.role === "officer";
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
                <p className="text-sm font-medium">
                  {isOfficer ? "Officer" : ""} {userData.position || "User"}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <nav className="flex flex-col gap-1 p-4">
            {/* Dashboard - Primary Blue */}
            <Link
              href="/protected"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 group"
            >
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-700 group-hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition-colors">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span>Dashboard</span>
            </Link>

            {/* Infringements - Orange (different label for officers) */}
            <Link
              href="/protected/infringements"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-300 group"
            >
              <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              {isOfficer ? "My Infringements" : "Infringements"}
            </Link>

            {/* Officer-specific navigation - Green */}
            {isOfficer && (
              <>
                <div className="mt-6 mb-2 px-3 text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <div className="h-px flex-1 bg-green-200 dark:bg-green-800"></div>
                  Performance
                  <div className="h-px flex-1 bg-green-200 dark:bg-green-800"></div>
                </div>

                <Link
                  href="/protected/my-performance"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-300 group"
                >
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  My Performance
                </Link>
              </>
            )}

            {/* Agency Admin navigation - Purple */}
            {isAgencyAdmin && (
              <>
                {/* Management Section - Purple */}
                <div className="mt-6 mb-2 px-3 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <div className="h-px flex-1 bg-purple-200 dark:bg-purple-800"></div>
                  Management
                  <div className="h-px flex-1 bg-purple-200 dark:bg-purple-800"></div>
                </div>

                <Link
                  href="/protected/users"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
                >
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Users
                </Link>

                <Link
                  href="/protected/teams"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
                >
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Teams
                </Link>

                <Link
                  href="/protected/routes"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
                >
                  <Route className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Routes
                </Link>

                <Link
                  href="/protected/locations"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
                >
                  <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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

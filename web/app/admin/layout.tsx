import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MapPin, 
  UsersRound, 
  Route as RouteIcon, 
  FolderTree, 
  Tag, 
  FileText, 
  FileBarChart,
  ScrollText,
  Shield,
  DollarSign,
  TrendingUp,
  BarChart3,
  FileBox,
  Plug,
  Bell
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data,
  } = await supabase.auth.getUser();

  console.log("AdminLayout user:", data.user);

  if (!data.user) {
    redirect("/auth/login");
  }

  // Check if user is super admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!userData || userData.role !== "super_admin") {
    redirect("/protected");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="border-b bg-background">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                MANTIS Admin
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Super Administrator</p>
                <p className="text-xs text-muted-foreground">{data.user?.email || "No email"}</p>
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
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 group"
            >
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-700 group-hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition-colors">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span>Dashboard</span>
            </Link>

            {/* System Management - Purple */}
            <div className="mt-6 mb-2 px-3 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-purple-200 dark:bg-purple-800"></div>
              System Management
              <div className="h-px flex-1 bg-purple-200 dark:bg-purple-800"></div>
            </div>

            <Link
              href="/admin/agencies"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
            >
              <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Agencies
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
            >
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Users
            </Link>

            <Link
              href="/admin/teams"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
            >
              <UsersRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Teams
            </Link>

            <Link
              href="/admin/routes"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
            >
              <RouteIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Routes
            </Link>

            <Link
              href="/admin/locations"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300 group"
            >
              <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Locations
            </Link>

            {/* Infringement Data - Orange/Amber */}
            <div className="mt-6 mb-2 px-3 text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-orange-200 dark:bg-orange-800"></div>
              Infringement Data
              <div className="h-px flex-1 bg-orange-200 dark:bg-orange-800"></div>
            </div>

            <Link
              href="/admin/infringements"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-300 group"
            >
              <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Infringements
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-300 group"
            >
              <FolderTree className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Categories
            </Link>

            <Link
              href="/admin/types"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-300 group"
            >
              <Tag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Types
            </Link>

            {/* Analytics & Reports - Green */}
            <div className="mt-6 mb-2 px-3 text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-green-200 dark:bg-green-800"></div>
              Analytics & Reports
              <div className="h-px flex-1 bg-green-200 dark:bg-green-800"></div>
            </div>

            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-300 group"
            >
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Analytics
            </Link>

            <Link
              href="/admin/advanced-analytics"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-300 group"
            >
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
              Advanced Analytics
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-300 group"
            >
              <FileBarChart className="h-4 w-4 text-green-600 dark:text-green-400" />
              Reports
            </Link>

            {/* Additional Features - Slate/Gray */}
            <div className="mt-6 mb-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
              Additional Features
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            </div>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-300 group"
            >
              <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              Payments
            </Link>

            <Link
              href="/admin/documents"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-300 group"
            >
              <FileBox className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              Documents
            </Link>

            <Link
              href="/admin/integrations"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-300 group"
            >
              <Plug className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              Integrations
            </Link>

            <Link
              href="/admin/notifications"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-300 group"
            >
              <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              Notifications
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-300 group"
            >
              <ScrollText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              Audit Logs
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      </div>
    </div>
  );
}

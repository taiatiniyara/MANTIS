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
        <div className="container mx-auto px-4 py-4">
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
        <aside className="w-64 border-r bg-background">
          <nav className="flex flex-col gap-2 p-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System Management
            </div>

            <Link
              href="/admin/agencies"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Building2 className="h-4 w-4" />
              Agencies
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="h-4 w-4" />
              Users
            </Link>

            <Link
              href="/admin/teams"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <UsersRound className="h-4 w-4" />
              Teams
            </Link>

            <Link
              href="/admin/routes"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <RouteIcon className="h-4 w-4" />
              Routes
            </Link>

            <Link
              href="/admin/locations"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <MapPin className="h-4 w-4" />
              Locations
            </Link>

            <div className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Infringement Data
            </div>

            <Link
              href="/admin/infringements"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="h-4 w-4" />
              Infringements
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FolderTree className="h-4 w-4" />
              Categories
            </Link>

            <Link
              href="/admin/types"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Tag className="h-4 w-4" />
              Types
            </Link>

            <div className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Analytics & Reports
            </div>

            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </Link>

            <Link
              href="/admin/advanced-analytics"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Advanced Analytics
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FileBarChart className="h-4 w-4" />
              Reports
            </Link>

            <div className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Additional Features
            </div>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <DollarSign className="h-4 w-4" />
              Payments
            </Link>

            <Link
              href="/admin/documents"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FileBox className="h-4 w-4" />
              Documents
            </Link>

            <Link
              href="/admin/integrations"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Plug className="h-4 w-4" />
              Integrations
            </Link>

            <Link
              href="/admin/notifications"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ScrollText className="h-4 w-4" />
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

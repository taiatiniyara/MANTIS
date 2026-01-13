import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Building2,
  FileText,
  LogOut,
  Shield,
} from "lucide-react";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/super-admin",
    icon: LayoutDashboard,
    roles: ["Super Admin"],
  },
  {
    label: "Locations",
    path: "/super-admin/locations",
    icon: MapPin,
    roles: ["Super Admin"],
  },
  {
    label: "Agencies",
    path: "/super-admin/agencies",
    icon: Building2,
    roles: ["Super Admin"],
  },
  {
    label: "Users",
    path: "/super-admin/users",
    icon: Users,
    roles: ["Super Admin"],
  },
  {
    label: "Dashboard",
    path: "/agency-admin",
    icon: LayoutDashboard,
    roles: ["Agency Admin"],
  },
  {
    label: "Teams",
    path: "/agency-admin/teams",
    icon: Users,
    roles: ["Agency Admin"],
  },
  {
    label: "Reports",
    path: "/agency-admin/reports",
    icon: FileText,
    roles: ["Agency Admin"],
  },
  {
    label: "Dashboard",
    path: "/team-leader",
    icon: LayoutDashboard,
    roles: ["Team Leader"],
  },
  {
    label: "My Team",
    path: "/team-leader/team",
    icon: Users,
    roles: ["Team Leader"],
  },
  {
    label: "Reports",
    path: "/team-leader/reports",
    icon: FileText,
    roles: ["Team Leader"],
  },
  {
    label: "Dashboard",
    path: "/officer",
    icon: LayoutDashboard,
    roles: ["Officer"],
  },
  {
    label: "My Reports",
    path: "/officer/reports",
    icon: FileText,
    roles: ["Officer"],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { userMetadata, signOut } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const userRole = userMetadata?.role || "Guest";

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Icon Section */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center justify-center">
            <img
              src="/icon.svg"
              alt="MANTIS Icon"
              className="h-12 w-12"
            />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-4 py-2 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Shield className="h-3 w-3" />
              <span className="font-semibold">Role</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{userRole}</div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}

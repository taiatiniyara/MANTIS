import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Building2,
  FileText,
  LogOut,
  Shield,
  Menu,
  X,
  User,
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
    label: "Locations",
    path: "/agency-admin/locations",
    icon: MapPin,
    roles: ["Agency Admin"],
  },
  {
    label: "Infringements",
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
    label: "Infringements",
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
    label: "Infringements",
    path: "/officer/reports",
    icon: FileText,
    roles: ["Officer"],
  },
  {
    label: "Profile",
    path: "/officer/profile",
    icon: User,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userMetadata?.role as UserRole)
  );

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 h-16 flex items-center px-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <a href="/" className="ml-4">
          <img src="/icon.svg" alt="MANTIS" className="h-8 w-8" />
        </a>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out",
        "md:translate-x-0 md:relative md:z-auto",
        "fixed inset-y-0 left-0 z-50",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo/Icon Section */}
        <div className="p-6 border-b border-neutral-200 mt-16 md:mt-0">
          <a href="/" className="flex items-center justify-center">
            <img
              src="/icon.svg"
              alt="MANTIS Icon"
              className="h-12 w-12"
            />
          </a>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-neutral-200">
          <div className="mb-3 px-4 py-2 rounded-lg bg-neutral-50">
            <div className="flex items-center gap-2 text-xs text-neutral-600 mb-1">
              <Shield className="h-3 w-3" />
              <span className="font-semibold">Role</span>
            </div>
            <div className="text-sm font-medium text-neutral-900">{userMetadata?.role || "Guest"}</div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto mt-16 md:mt-0">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}

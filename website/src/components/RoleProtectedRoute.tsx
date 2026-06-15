import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/supabase/schema";
import { roleToLink } from "@/lib/utils";
import { type ReactNode } from "react";

interface RoleProtectedRouteProps {
  allowedRoles: Role[];
  children: ReactNode;
}

// Roles that have a dashboard route at /<role-slug>. Used to redirect a
// logged-in user who lands on a section they're not allowed into, back to
// their own dashboard (falling back to the landing page for roles without one).
const DASHBOARD_ROLES: Role[] = [
  "DEV Engineer",
  "App Admin",
  "Super Admin",
  "Tenant Admin",
  "Team Leader",
  "Officer",
];

/**
 * Guards a route subtree by role.
 *
 * Note: this is a UX guard only — it stops unauthorized users from *seeing* a
 * section. The real enforcement is database RLS (see website/supabase/rls.sql);
 * even if this were bypassed, the data layer denies access.
 */
export function RoleProtectedRoute({
  allowedRoles,
  children,
}: RoleProtectedRouteProps) {
  const { user, userMetadata, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading…</div>
      </div>
    );
  }

  // Not signed in.
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  // Signed in but no profile row in `users` (can't resolve a role).
  if (!userMetadata) {
    return <Navigate to="/auth/login" />;
  }

  // Signed in with the wrong role → send them to their own dashboard.
  if (!allowedRoles.includes(userMetadata.role)) {
    const target = DASHBOARD_ROLES.includes(userMetadata.role)
      ? `/${roleToLink(userMetadata.role)}`
      : "/";
    return <Navigate to={target} />;
  }

  return <>{children}</>;
}

import { Navigate, useLocation } from "@tanstack/react-router"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import type { PropsWithChildren } from "react"

type ProtectedRouteProps = PropsWithChildren<{
  requiredRoles?: UserRole[]
  fallbackPath?: string
}>

export const ProtectedRoute = ({
  children,
  requiredRoles,
  fallbackPath = "/login",
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} search={{ redirect: location.pathname }} />
  }

  // Check if user profile is loaded
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            Unable to load user profile. Please contact support.
          </p>
        </div>
      </div>
    )
  }

  // Check if user is active
  if (!profile.active) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Your account has been deactivated. Please contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(profile.role)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              Access Denied
            </p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              You don't have permission to access this page.
            </p>
            <p className="mt-1 text-xs text-red-500 dark:text-red-500">
              Required role: {requiredRoles.join(" or ")}
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

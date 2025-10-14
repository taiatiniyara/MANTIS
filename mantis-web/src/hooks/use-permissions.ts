import { useAuth, type UserRole } from "@/contexts/auth-context"

/**
 * Hook to check if the current user has the required role(s)
 * @param requiredRoles - Single role or array of roles
 * @returns boolean indicating if user has required role
 */
export const useRequireRole = (requiredRoles: UserRole | UserRole[]): boolean => {
  const { hasRole } = useAuth()
  return hasRole(requiredRoles)
}

/**
 * Hook to get role-based permissions
 */
export const usePermissions = () => {
  const { profile, isOfficer, isAgencyAdmin, isCentralAdmin, isCitizen } = useAuth()

  return {
    // Read permissions
    canViewInfringements: profile !== null,
    canViewPayments: profile !== null,
    canViewDisputes: profile !== null,
    canViewReports: !isCitizen,
    canViewDashboard: !isCitizen,

    // Write permissions
    canCreateInfringement: isOfficer || isAgencyAdmin || isCentralAdmin,
    canEditInfringement: isOfficer || isAgencyAdmin || isCentralAdmin,
    canVoidInfringement: isAgencyAdmin || isCentralAdmin,
    
    canProcessPayment: isOfficer || isAgencyAdmin || isCentralAdmin,
    
    canResolveDispute: isAgencyAdmin || isCentralAdmin,
    
    // Admin permissions
    canManageUsers: isCentralAdmin,
    canManageAgencies: isCentralAdmin,
    canManageOffences: isCentralAdmin,
    canAccessAuditLogs: isAgencyAdmin || isCentralAdmin,
    
    // Agency-specific permissions
    canManageAgencyUsers: isAgencyAdmin,
    
    // Role checks
    isOfficer,
    isAgencyAdmin,
    isCentralAdmin,
    isCitizen,
    
    // User info
    agencyId: profile?.agencyId,
    agencyName: profile?.agencyName,
  }
}

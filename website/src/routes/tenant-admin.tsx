import DashboardLayout from "@/components/layouts/DashboardLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

export const Route = createFileRoute("/tenant-admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RoleProtectedRoute allowedRoles={["Tenant Admin"]}>
      <DashboardLayout>
        <div className="p-4">
          <Outlet />
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}

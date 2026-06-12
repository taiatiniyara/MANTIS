import DashboardLayout from "@/components/layouts/DashboardLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

export const Route = createFileRoute("/agency-admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RoleProtectedRoute allowedRoles={["Agency Admin"]}>
      <DashboardLayout>
        <div className="p-4">
          <Outlet />
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}

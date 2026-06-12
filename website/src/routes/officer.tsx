import DashboardLayout from "@/components/layouts/DashboardLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

export const Route = createFileRoute("/officer")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RoleProtectedRoute allowedRoles={["Officer"]}>
      <DashboardLayout>
        <div className="p-4">
          <Outlet />
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

export const Route = createFileRoute("/super-admin")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <RoleProtectedRoute allowedRoles={["DEV Engineer", "App Admin", "Super Admin"]}>
      <DashboardLayout>
        <div className="p-4">
          <Outlet />
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}

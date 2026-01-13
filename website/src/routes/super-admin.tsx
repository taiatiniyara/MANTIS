import { createFileRoute, Outlet } from "@tanstack/react-router";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export const Route = createFileRoute("/super-admin")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <Outlet />
      </div>
    </DashboardLayout>
  );
}

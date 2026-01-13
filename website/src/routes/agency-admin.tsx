import DashboardLayout from "@/components/layouts/DashboardLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/agency-admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <Outlet />
      </div>
    </DashboardLayout>
  );
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

export const Route = createFileRoute("/dev")({
  component: RouteComponent,
});

// Layout for the /dev/* developer tools. Restricted to the Dev role; the real
// enforcement for any data these pages touch is still RLS.
function RouteComponent() {
  return (
    <RoleProtectedRoute allowedRoles={["Dev"]}>
      <Outlet />
    </RoleProtectedRoute>
  );
}

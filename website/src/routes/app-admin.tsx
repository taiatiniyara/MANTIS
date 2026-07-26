import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app-admin")({
  component: RouteComponent,
});

// App Admin shares the global management screens at /super-admin (the guard
// there allows App Admin). This is just the post-login landing target.
function RouteComponent() {
  return <Navigate to="/super-admin" />;
}

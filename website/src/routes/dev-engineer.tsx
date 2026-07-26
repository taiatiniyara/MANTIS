import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dev-engineer")({
  component: RouteComponent,
});

// DEV Engineer (top tier) shares the global management screens at /super-admin
// for now. Dedicated developer tooling will live under its own area later.
function RouteComponent() {
  return <Navigate to="/super-admin" />;
}

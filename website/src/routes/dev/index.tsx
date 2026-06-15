import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dev/")({
  component: RouteComponent,
});

// /dev → the design reference (the Dev role's landing page).
function RouteComponent() {
  return <Navigate to="/dev/styles" />;
}

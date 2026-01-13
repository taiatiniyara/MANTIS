import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AuthProvider } from "@/contexts/AuthContext";

const RootLayout = () => (
  <AuthProvider>
    <div>
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  </AuthProvider>
);

export const Route = createRootRoute({ component: RootLayout });

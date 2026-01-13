import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const RootLayout = () => (
  <AuthProvider>
    <div>
      <Outlet />
      <TanStackRouterDevtools />
      <Toaster
        position="bottom-center"
        richColors
      />
    </div>
  </AuthProvider>
);

export const Route = createRootRoute({ component: RootLayout });

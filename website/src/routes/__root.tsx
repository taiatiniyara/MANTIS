import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const RootLayout = () => (
  <AuthProvider>
    <div>
      <Outlet />
      <Toaster
        position="bottom-center"
        richColors
      />
    </div>
  </AuthProvider>
);

export const Route = createRootRoute({ component: RootLayout });

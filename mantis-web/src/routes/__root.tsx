import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";

const RootLayout = () => (
  <>
    <AppShell>
      <Outlet />
    </AppShell>
    <TanStackRouterDevtools />
    <Toaster />
  </>
);

export const Route = createRootRoute({ component: RootLayout });

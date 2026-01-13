import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <div>
    <nav className="bg-white shadow p-2">
      <a href="/">
        <img
          alt="MANTIS Logo"
          src="/logo.svg"
          className="w-42"
        />
      </a>
    </nav>
    <Outlet />
    <TanStackRouterDevtools />
  </div>
);

export const Route = createRootRoute({ component: RootLayout });

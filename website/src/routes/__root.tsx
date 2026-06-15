import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";

const RootLayout = () => (
  <ThemeProvider>
    <AuthProvider>
      <div>
        <Outlet />
        <Toaster
          position="bottom-center"
          richColors
          toastOptions={{
            className: 'text-sm sm:text-base',
            style: {
              margin: '0 16px',
              maxWidth: 'calc(100vw - 32px)',
            },
          }}
        />
      </div>
    </AuthProvider>
  </ThemeProvider>
);

export const Route = createRootRoute({ component: RootLayout });

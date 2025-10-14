import { useState } from "react"
import type { PropsWithChildren } from "react"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { QueryClientProvider } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { createQueryClient } from "@/lib/queryClient"
import { AuthProvider } from "@/contexts/auth-context"

const themeAttributes = {
  attribute: "class" as const,
  disableTransitionOnChange: true,
  defaultTheme: "system" as const,
  enableSystem: true,
  storageKey: "mantis-theme",
}

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState<QueryClient>(() => createQueryClient())

  return (
    <NextThemeProvider {...themeAttributes}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          {import.meta.env.DEV ? (
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          ) : null}
        </AuthProvider>
      </QueryClientProvider>
    </NextThemeProvider>
  )
}

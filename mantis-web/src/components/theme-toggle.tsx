import { useTheme } from "next-themes"
import { useMemo } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const isDark = useMemo(() => {
    if (theme === "system") {
      return resolvedTheme === "dark"
    }

    return theme === "dark"
  }, [theme, resolvedTheme])

  const nextTheme = isDark ? "light" : "dark"

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={`Activate ${nextTheme} mode`}
      onClick={() => setTheme(nextTheme)}
      className={cn("transition-colors", className)}
    >
      <Sun className={cn("size-5 text-orange-500", isDark ? "hidden" : "block")} />
      <Moon className={cn("size-5 text-slate-600", isDark ? "block" : "hidden")} />
    </Button>
  )
}

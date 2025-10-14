import { useState } from "react"
import type { PropsWithChildren, ReactNode } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { CircleDot, CircleUser, Home, Layers3, LogOut, Menu, ShieldCheck, Wallet, X } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"

type NavItem = {
  label: string
  to: string
  icon: ReactNode
  badge?: string
}

const primaryLinks: NavItem[] = [
  {
    label: "Dashboard",
    to: "/",
    icon: <Home className="size-4" />,
  },
  {
    label: "Infringements",
    to: "/infringements",
    icon: <ShieldCheck className="size-4" />,
  },
  {
    label: "Payments",
    to: "/payments",
    icon: <Wallet className="size-4" />,
  },
  {
    label: "Disputes",
    to: "/disputes",
    icon: <CircleDot className="size-4" />,
  },
]

const secondaryLinks: NavItem[] = [
  {
    label: "Reports",
    to: "/reports",
    icon: <Layers3 className="size-4" />,
  },
]

const navigationSections = [
  {
    title: "Operations",
    items: primaryLinks,
  },
  {
    title: "Insights",
    items: secondaryLinks,
  },
]

const Navigation = ({
  currentPath,
  onNavigate,
}: {
  currentPath: string
  onNavigate?: () => void
}) => {
  return (
    <>
      {navigationSections.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <span className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {section.title}
          </span>
          <div className="flex flex-col gap-1">
            {section.items.map((item) => {
              const isActive =
                currentPath === item.to || (item.to !== "/" && currentPath.startsWith(item.to))

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-orange-500/10 text-orange-600"
                      : "text-slate-600 hover:bg-orange-500/5 hover:text-orange-600"
                  )}
                >
                  <span className="text-orange-500">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded-full bg-orange-500/10 px-2 text-xs font-semibold text-orange-600">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}

export const AppShell = ({ children }: PropsWithChildren) => {
  const { location } = useRouterState()
  const currentPath = location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // Hide nav/sidebar on login page or when not authenticated
  const showNavigation = user && currentPath !== "/login"

  return (
    <div className="flex min-h-screen bg-muted text-foreground">
      {showNavigation && (
        <aside className="hidden w-64 flex-col border-r border-border bg-background/80 backdrop-blur md:flex">
          <div className="flex h-16 items-center gap-2 px-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500 text-white">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold uppercase tracking-wide text-orange-600">MANTIS</span>
              <span className="text-xs text-slate-500">Fiji Multi-Agency</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-6 px-4 py-6">
            <Navigation currentPath={currentPath} />
          </nav>
          <div className="flex flex-col gap-2 border-t border-border px-4 py-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <CircleUser className="size-4 text-slate-500" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{profile?.displayName || "User"}</span>
                <span className="text-xs text-slate-500 capitalize">{profile?.role?.replace("_", " ")}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-slate-600 hover:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </aside>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        {showNavigation && (
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex items-center gap-2">
              <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation">
                    <Menu className="size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent
                  showCloseButton={false}
                  className="fixed inset-y-0 left-0 z-50 flex h-full w-72 translate-x-0 translate-y-0 flex-col gap-6 rounded-none border-r border-border bg-background p-6 shadow-2xl sm:w-80"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500 text-white">
                        <ShieldCheck className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                          MANTIS
                        </span>
                        <span className="text-xs text-slate-500">Fiji Multi-Agency</span>
                      </div>
                    </div>
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-500"
                        aria-label="Close navigation"
                      >
                        <X className="size-5" />
                      </Button>
                    </DialogClose>
                  </div>

                  <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
                    <Navigation currentPath={currentPath} onNavigate={() => setMobileOpen(false)} />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border pt-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <CircleUser className="size-4 text-slate-500" />
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm font-medium">{profile?.displayName || "User"}</span>
                        <span className="text-xs text-slate-500 capitalize">{profile?.role?.replace("_", " ")}</span>
                      </div>
                    </div>
                    <ThemeToggle className="self-start" />
                    <Button variant="outline" size="sm">
                      Support
                    </Button>
                    <Button size="sm" className="gap-2">
                      Record infringement
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start gap-2 text-slate-600 hover:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <span className="text-base font-semibold text-slate-700 md:hidden">MANTIS</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" className="hidden md:inline-flex">
                Support
              </Button>
              <Button size="sm" className="gap-2">
                Record infringement
              </Button>
            </div>
          </div>
          </header>
        )}

        <main className={showNavigation ? "flex-1 px-4 py-8 md:px-8 lg:px-12" : "flex-1"}>{children}</main>
      </div>
    </div>
  )
}

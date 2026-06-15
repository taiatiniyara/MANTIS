import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export const Route = createFileRoute("/styling")({
  component: RouteComponent,
});

// ---------------------------------------------------------------------------
// Mobile theme snapshot — mirrors mobile/constants/theme.ts.
// The website (Vite) can't import React Native code, so these values are
// transcribed. KEEP IN SYNC if the mobile theme changes.
// ---------------------------------------------------------------------------
const MOBILE_COLORS = {
  light: {
    background: "#FFFFFF",
    foreground: "#25211F",
    card: "#FFFFFF",
    primary: "#6366F1",
    primaryForeground: "#F8F7FF",
    secondary: "#F7F6F5",
    secondaryForeground: "#352F2D",
    muted: "#F7F7F6",
    mutedForeground: "#898582",
    accent: "#F7F7F6",
    accentForeground: "#37312F",
    destructive: "#DC2626",
    border: "#EBEBEA",
    input: "#EBEBEA",
    ring: "#B5B3AF",
    chart1: "#A5B4FC",
    chart2: "#818CF8",
    chart3: "#6366F1",
    chart4: "#4F46E5",
    chart5: "#4338CA",
    tint: "#6366F1",
    icon: "#898582",
  },
  dark: {
    background: "#25211F",
    foreground: "#FAFAF9",
    card: "#37312F",
    primary: "#5B5FC7",
    primaryForeground: "#F8F7FF",
    secondary: "#423B38",
    secondaryForeground: "#FAFAF9",
    muted: "#413A37",
    mutedForeground: "#B5B3AF",
    accent: "#413A37",
    accentForeground: "#FAFAF9",
    destructive: "#EF4444",
    border: "rgba(255,255,255,0.1)",
    input: "rgba(255,255,255,0.15)",
    ring: "#898582",
    chart1: "#A5B4FC",
    chart2: "#818CF8",
    chart3: "#6366F1",
    chart4: "#4F46E5",
    chart5: "#4338CA",
    tint: "#818CF8",
    icon: "#B5B3AF",
  },
} as const;

const MOBILE_SPACING: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

const MOBILE_RADIUS: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 7.2,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
};

const MOBILE_TYPE: Record<string, { fontSize: number; lineHeight: number }> = {
  xs: { fontSize: 14, lineHeight: 20 },
  sm: { fontSize: 16, lineHeight: 22 },
  base: { fontSize: 18, lineHeight: 26 },
  lg: { fontSize: 20, lineHeight: 28 },
  xl: { fontSize: 24, lineHeight: 32 },
  "2xl": { fontSize: 28, lineHeight: 36 },
  "3xl": { fontSize: 34, lineHeight: 40 },
  "4xl": { fontSize: 40, lineHeight: 44 },
};

// Web design-token CSS variable names (from src/index.css)
const WEB_COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

function Swatch({
  label,
  color,
  value,
}: {
  label: string;
  color: string;
  value?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-14 w-full rounded-md border border-border shadow-xs"
        style={{ backgroundColor: color }}
      />
      <div className="leading-tight">
        <div className="text-xs font-medium text-foreground">{label}</div>
        {value && (
          <div className="text-[10px] font-mono text-muted-foreground truncate">
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {children}
      </h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function RouteComponent() {
  // Read the live computed values of the web CSS variables (light theme).
  const [webValues, setWebValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    WEB_COLOR_TOKENS.forEach((t) => {
      next[t] = styles.getPropertyValue(`--${t}`).trim();
    });
    setWebValues(next);
  }, []);

  const mobileLight = MOBILE_COLORS.light;
  const mobileDark = MOBILE_COLORS.dark;

  const divergences = useMemo(
    () => [
      {
        token: "primary",
        web: "navy — oklch(0.31 0.055 256)",
        mobile: "#6366F1 (indigo)",
      },
      {
        token: "radius (md)",
        web: "var(--radius) 0.375rem ≈ 6px",
        mobile: "7.2px (0.45rem)",
      },
      {
        token: "base font size",
        web: "Tailwind text-base 16px",
        mobile: "base 18px",
      },
    ],
    [],
  );

  return (
    <RoleProtectedRoute allowedRoles={["DEV Engineer", "App Admin"]}>
      <DashboardLayout>
        <div className="min-h-full bg-background text-foreground">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Header */}
            <header>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Styling
                </h1>
                <Badge variant="secondary">App Admin</Badge>
              </div>
              <p className="text-muted-foreground mt-2 max-w-3xl">
                App styling reference — design tokens and components from both
                MANTIS apps, side by side. Managed by App Admin (also visible to
                DEV Engineer). Mobile values are mirrored from{" "}
                <code>mobile/constants/theme.ts</code>.
              </p>
            </header>

        {/* Divergence callout */}
        <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <SectionTitle subtitle="Where the two apps' design languages currently differ — the mobile app has not yet adopted the navy restyle.">
            ⚠ Known divergences
          </SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1 pr-4 font-medium">Token</th>
                  <th className="py-1 pr-4 font-medium">Admin (web)</th>
                  <th className="py-1 font-medium">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {divergences.map((d) => (
                  <tr key={d.token} className="border-t border-border/60">
                    <td className="py-1.5 pr-4 font-mono text-xs">{d.token}</td>
                    <td className="py-1.5 pr-4">{d.web}</td>
                    <td className="py-1.5">{d.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Web (Admin) colors */}
        <section>
          <SectionTitle subtitle="Live CSS-variable tokens from src/index.css (light theme).">
            Admin (web) — Colors
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {WEB_COLOR_TOKENS.map((t) => (
              <Swatch
                key={t}
                label={`--${t}`}
                color={`var(--${t})`}
                value={webValues[t] || "…"}
              />
            ))}
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Dark theme preview
            </p>
            <div className="dark rounded-lg border border-border bg-background p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {WEB_COLOR_TOKENS.map((t) => (
                  <Swatch key={t} label={`--${t}`} color={`var(--${t})`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mobile colors */}
        <section>
          <SectionTitle subtitle="Snapshot from mobile/constants/theme.ts (React Native hex tokens).">
            Mobile — Colors
          </SectionTitle>
          <p className="text-sm font-medium text-muted-foreground mb-3">Light</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(mobileLight).map(([k, v]) => (
              <Swatch key={k} label={k} color={v} value={v} />
            ))}
          </div>
          <p className="text-sm font-medium text-muted-foreground mt-6 mb-3">
            Dark
          </p>
          <div className="rounded-lg p-4" style={{ backgroundColor: mobileDark.background }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {Object.entries(mobileDark).map(([k, v]) => (
                <Swatch key={k} label={k} color={v} value={v} />
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <SectionTitle subtitle="Mobile Typography scale vs the web base size.">
            Typography
          </SectionTitle>
          <div className="space-y-2">
            {Object.entries(MOBILE_TYPE).map(([k, t]) => (
              <div key={k} className="flex items-baseline gap-4 border-b border-border/50 pb-2">
                <span className="w-12 text-xs font-mono text-muted-foreground shrink-0">
                  {k}
                </span>
                <span
                  className="text-foreground truncate"
                  style={{ fontSize: t.fontSize, lineHeight: `${t.lineHeight}px` }}
                >
                  The quick brown fox
                </span>
                <span className="ml-auto text-xs font-mono text-muted-foreground shrink-0">
                  {t.fontSize}/{t.lineHeight}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing & radius */}
        <section className="grid sm:grid-cols-2 gap-8">
          <div>
            <SectionTitle subtitle="Mobile Spacing scale (px).">Spacing</SectionTitle>
            <div className="space-y-2">
              {Object.entries(MOBILE_SPACING).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-mono text-muted-foreground">{k}</span>
                  <div className="h-4 bg-primary rounded-sm" style={{ width: v }} />
                  <span className="text-xs font-mono text-muted-foreground">{v}px</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle subtitle="Mobile BorderRadius scale (px).">Radius</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(MOBILE_RADIUS).map(([k, v]) => (
                <div key={k} className="flex flex-col items-center gap-1.5">
                  <div
                    className="h-14 w-14 bg-secondary border border-border"
                    style={{ borderRadius: Math.min(v, 28) }}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {k} · {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live component gallery (web) */}
        <section>
          <SectionTitle subtitle="The actual admin UI components rendering with the current navy theme.">
            Admin (web) — Components
          </SectionTitle>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Buttons</p>
              <div className="flex flex-wrap gap-2">
                {(["default", "secondary", "outline", "ghost", "destructive", "link"] as const).map(
                  (v) => (
                    <Button key={v} variant={v}>
                      {v}
                    </Button>
                  ),
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {(["sm", "default", "lg"] as const).map((s) => (
                  <Button key={s} size={s}>
                    size {s}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Badges</p>
              <div className="flex flex-wrap gap-2">
                {(["default", "secondary", "outline", "destructive", "ghost"] as const).map(
                  (v) => (
                    <Badge key={v} variant={v}>
                      {v}
                    </Badge>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Input</p>
              <div className="max-w-sm">
                <Input placeholder="Placeholder text…" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Card</p>
              <Card className="max-w-sm">
                <CardHeader>
                  <CardTitle>Card title</CardTitle>
                  <CardDescription>
                    Supporting description text for the card.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card body content sits here.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
          </div>
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
}

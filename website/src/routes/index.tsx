import HomeNav from "@/components/homenav";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { roleToLink } from "@/lib/utils";
import {
  Building2,
  MapPinned,
  WifiOff,
  ShieldCheck,
  FolderLock,
  Smartphone,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const features = [
  {
    icon: Building2,
    title: "Multi-Agency Support",
    description:
      "Unified platform for LTA, Police, and Municipal Councils with clean data separation.",
  },
  {
    icon: MapPinned,
    title: "GIS-Based Jurisdiction",
    description:
      "PostGIS-powered location hierarchy with automatic jurisdiction resolution.",
  },
  {
    icon: WifiOff,
    title: "Offline-First",
    description:
      "Capture infringements, photos, and GPS data without connectivity. Auto-sync when online.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Compliant",
    description:
      "Row-level security, role-based access control, and secure evidence management.",
  },
  {
    icon: FolderLock,
    title: "Evidence Management",
    description:
      "Secure upload and storage of photos, videos, and documents with Supabase Storage.",
  },
  {
    icon: Smartphone,
    title: "Progressive Web App",
    description:
      "Installable, mobile-friendly, fast, and reliable. Works seamlessly on any device.",
  },
];

function Index() {
  const { userMetadata } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-background">
      <HomeNav />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <span className="inline-block mb-5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Government Enforcement Platform
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 sm:mb-6 leading-tight tracking-tight">
          Welcome to <span className="text-primary">MANTIS</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-2 leading-relaxed">
          A unified, GIS-enabled enforcement platform for the Fiji Islands.
          Empowering LTA, Municipal Councils, and Fiji Police to manage traffic
          infringements efficiently.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          {userMetadata ? (
            <Button size="lg" asChild>
              <a href={`/${roleToLink(userMetadata.role)}`}>Go to Dashboard</a>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <a href="/auth/register">Get Started</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/auth/login">Sign In</a>
              </Button>
            </>
          )}
          <Button size="lg" variant="ghost" asChild>
            <a href="/docs">View Documentation</a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Key Features
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Built for the realities of field enforcement across multiple
            agencies and jurisdictions.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="transition-colors hover:border-primary/40"
              >
                <CardHeader>
                  <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-primary text-primary-foreground/80 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-primary-foreground">MANTIS</p>
              <p className="text-sm">
                Multi-Agency National Traffic Infringement System
              </p>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} MANTIS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

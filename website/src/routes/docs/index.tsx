import type React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Map, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DocLink = {
  title: string;
  description: string;
  to: string;
  badge?: string;
};

type DocSection = {
  title: string;
  description: string;
  audience: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  links: DocLink[];
};

const sections: DocSection[] = [
  {
    title: "Getting started",
    description: "Sign in, verify your profile, and learn the basics in under ten minutes.",
    audience: ["Everyone"],
    icon: Sparkles,
    links: [
      {
        title: "Create your account",
        description: "Accept your invite, set a password, and secure your login.",
        to: "/docs/getting-started#account",
        badge: "5 min",
      },
      {
        title: "Home layout tour",
        description: "Know where to find work, notifications, and your profile.",
        to: "/docs/getting-started#workspace",
      },
    ],
  },
  {
    title: "Roles & access",
    description: "Understand what each role can do so you route tasks to the right people.",
    audience: ["Leads", "Admins"],
    icon: ShieldCheck,
    links: [
      {
        title: "Role matrix",
        description: "Who can create, review, approve, and export.",
        to: "/docs/roles-and-permissions",
      },
      {
        title: "Invite teammates",
        description: "Add people safely and keep access tidy as teams change.",
        to: "/docs/roles-and-permissions#invites",
      },
    ],
  },
  {
    title: "Core workflows",
    description: "Capture cases, add evidence, assign teams, and keep work moving.",
    audience: ["Officers", "Leads"],
    icon: FileText,
    links: [
      {
        title: "Create a case",
        description: "Log details, attach photos, and set ownership from day one.",
        to: "/docs/cases#create",
      },
      {
        title: "Collaborate",
        description: "Comment, mention teammates, and keep history auditable.",
        to: "/docs/cases#collaboration",
      },
    ],
  },
  {
    title: "Search & maps",
    description: "Filter by status, owner, time, or location to find work quickly.",
    audience: ["Everyone"],
    icon: Map,
    links: [
      {
        title: "Smart filters",
        description: "Save views you'll reuse and pin them to your home.",
        to: "/docs/search-and-filters",
      },
      {
        title: "Location tips",
        description: "Use map layers to validate addresses and evidence.",
        to: "/docs/search-and-filters#maps",
      },
    ],
  },
  {
    title: "Mobile & offline",
    description: "Work from the field with confidence and sync when signal returns.",
    audience: ["Officers"],
    icon: Smartphone,
    links: [
      {
        title: "Install the app",
        description: "Set up mobile safely and enable biometrics.",
        to: "/docs/mobile#install",
      },
      {
        title: "Offline mode",
        description: "Capture evidence without data loss and monitor sync status.",
        to: "/docs/mobile#offline",
      },
    ],
  },
];

export const Route = createFileRoute("/docs/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-linear-to-br from-primary/10 via-background to-background min-h-screen">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:py-16">
        <header className="grid gap-6 sm:grid-cols-[1.2fr_1fr] sm:items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
              MANTIS product guide
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Learn how to get work done faster, together.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Step-by-step help for officers, leaders, and admins. Start with the basics,
              then dive into the workflows you use every day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/docs/getting-started">
                  Start with the basics
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/docs/roles-and-permissions">
                  Understand roles
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-foreground/5 px-3 py-1 text-foreground">For web and mobile</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Updated regularly</span>
              <span className="rounded-full bg-foreground/5 px-3 py-1">Support: support@mantis.app</span>
            </div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              Quick start bundle
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-foreground">
                New to the platform? Follow these three guides first:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                  <a href="/docs/getting-started#account" className="hover:text-primary">
                    Set up your account and sign in securely.
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                  <a href="/docs/roles-and-permissions" className="hover:text-primary">
                    Confirm your role and what you can do.
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                  <a href="/docs/cases#create" className="hover:text-primary">
                    Create and assign your first case.
                  </a>
                </li>
              </ul>
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                Tips include privacy and field safety callouts.
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Choose your track</h2>
            <p className="text-sm text-muted-foreground">
              Start where you are. Each track includes screenshots, checklists, and FAQs.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="h-full border border-border/80 bg-card/90">
                  <CardHeader className="flex flex-row items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium text-muted-foreground">
                        {section.audience.map((aud) => (
                          <span key={aud} className="rounded-full bg-foreground/5 px-2 py-1">
                            {aud}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {section.links.map((link) => (
                      <Link
                        key={link.title}
                        to={link.to}
                        className="group flex items-start justify-between gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/60"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            {link.title}
                            <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 transition group-hover:opacity-100" aria-hidden />
                          </div>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        </div>
                        {link.badge ? (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                            {link.badge}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

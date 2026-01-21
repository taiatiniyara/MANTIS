import type React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/docs/mobile")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <Link to="/docs" className="font-medium text-primary hover:underline">
          Back to docs
        </Link>
      </div>

      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Field guide</p>
        <h1 className="text-3xl font-semibold">Mobile and offline</h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Capture work in the field, even without signal. Sync safely when you are back online.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-foreground/5 px-3 py-1">Roles: Officers</span>
          <span className="rounded-full bg-foreground/5 px-3 py-1">Supports offline capture</span>
        </div>
      </header>

      <section id="install" className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" aria-hidden />
              Install and sign in
            </CardTitle>
            <CardDescription>Use your organization's distribution (MDM or app store).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <StepItem text="Install the app and open it." />
            <StepItem text="Sign in with the same email and password you use on the web." />
            <StepItem text="Enable biometrics for quicker unlocks." />
          </CardContent>
        </Card>
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
              Quick checks
            </CardTitle>
            <CardDescription>Confirm setup before heading out.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <StepItem text="Create a test case with a photo and confirm it syncs." />
            <StepItem text="Check notifications are enabled (Settings > Notifications)." />
            <StepItem text="Download offline maps if your region supports them." />
          </CardContent>
        </Card>
      </section>

      <section id="offline" className="mt-10 rounded-xl border border-border/80 bg-card/90 p-5 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Offline workflow</h2>
          <p className="text-sm text-muted-foreground">Keep capturing; the app syncs when your connection returns.</p>
        </div>
        <div className="mt-4 space-y-2 text-sm text-foreground">
          <StepItem text="Create cases, add notes, and take photos. They are stored locally until connected." />
          <StepItem text="You will see a sync badge. Leave the app open for faster upload when back online." />
          <StepItem text="If something is stuck, toggle airplane mode off/on to force a retry." />
        </div>
        <Callout>
          Avoid uninstalling the app while offline - you could lose unsynced evidence. Keep the device charged and unlocked during long uploads.
        </Callout>
      </section>

      <section className="mt-12 rounded-xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Trouble syncing?</h2>
            <p className="text-sm text-muted-foreground">Check connection, keep the app open, then contact support if items remain pending.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/docs">Back to docs</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function StepItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-primary">•</span>
      <span>{text}</span>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

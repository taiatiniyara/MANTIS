import type React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/docs/getting-started")({
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Setup</p>
        <h1 className="text-3xl font-semibold">Getting started with MANTIS</h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Set up your account, secure your login, and learn where to work. Follow these steps to be ready in a few minutes.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-foreground/5 px-3 py-1">Roles: Everyone</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Time: ~10 minutes</span>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="border border-border/80 bg-card/90">
          <CardHeader>
            <CardTitle>What you need</CardTitle>
            <CardDescription>Get these ready before you begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground">
            <ChecklistItem text="An invite email or login issued by your admin" />
            <ChecklistItem text="A modern browser (Chrome, Edge, Safari)" />
            <ChecklistItem text="Optional: mobile device for field work" />
          </CardContent>
        </Card>
        <Card className="border border-border/80 bg-card/90">
          <CardHeader>
            <CardTitle>Key outcomes</CardTitle>
            <CardDescription>By the end you will have:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground">
            <ChecklistItem text="Signed in securely and confirmed your profile" />
            <ChecklistItem text="Set notification preferences" />
            <ChecklistItem text="Located where to find your work and team" />
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 space-y-6">
        <Step
          id="account"
          title="1) Accept your invite and sign in"
          description="Open your invite email, choose a strong password, and complete the first login."
        >
          <ol className="space-y-2 text-sm text-foreground">
            <li>Open the invite and click the secure sign-in link.</li>
            <li>Create a password with at least 12 characters and a mix of words, numbers, or symbols.</li>
            <li>On first login, review the terms and confirm your name and agency.</li>
          </ol>
          <Callout icon={<Lock className="h-4 w-4" aria-hidden />}>
            If your organization enforces multi-factor authentication, complete the prompt now. Use an authenticator app instead of SMS when possible.
          </Callout>
        </Step>

        <Step
          id="profile"
          title="2) Verify your profile and team"
          description="Make sure your role and contact info are correct so assignments and alerts reach you."
        >
          <ol className="space-y-2 text-sm text-foreground">
            <li>Open your profile menu (top right) and confirm your name, title, and phone.</li>
            <li>Check your role badge. If it looks wrong, ask an admin to adjust it.</li>
            <li>Set your notification email and enable push if you use mobile.</li>
          </ol>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-foreground/5 px-2 py-1">Admins can edit roles</span>
            <span className="rounded-full bg-foreground/5 px-2 py-1">Keep contact info current</span>
          </div>
        </Step>

        <Step
          id="workspace"
          title="3) Learn the workspace"
          description="Know where to find your tasks, alerts, and tools."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border border-border/80">
              <CardHeader>
                <CardTitle>Home</CardTitle>
                <CardDescription>Your personal queue and saved views.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                Filter by status or due date, then pin views you use daily.
              </CardContent>
            </Card>
            <Card className="border border-border/80">
              <CardHeader>
                <CardTitle>Activity & notifications</CardTitle>
                <CardDescription>Mentions, assignments, and approvals.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                Use the bell icon to catch up quickly. Mark items as read once handled.
              </CardContent>
            </Card>
            <Card className="border border-border/80">
              <CardHeader>
                <CardTitle>Maps</CardTitle>
                <CardDescription>Validate locations and evidence.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                Toggle layers to view boundaries or recent activity nearby.
              </CardContent>
            </Card>
            <Card className="border border-border/80">
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>See who is on shift and how to reach them.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-foreground">
                Leaders can reassign work; officers can view owners and collaborators.
              </CardContent>
            </Card>
          </div>
        </Step>

        <Step
          id="first-task"
          title="4) Create your first case"
          description="Practice the flow end-to-end so you know what to expect."
        >
          <ol className="space-y-2 text-sm text-foreground">
            <li>Click New case from the home page.</li>
            <li>Add a clear title, location, and a short description of what happened.</li>
            <li>Attach evidence (photos, files). Drag-and-drop works in the browser.</li>
            <li>Assign an owner and due date. Add followers for visibility.</li>
            <li>Save and confirm you see the new case in your queue.</li>
          </ol>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <a href="/docs/cases#create">See detailed case steps</a>
            </Button>
          </div>
        </Step>

        <Step
          id="mobile"
          title="5) Set up mobile (optional)"
          description="Install the app for field capture and offline support."
        >
          <ol className="space-y-2 text-sm text-foreground">
            <li>Install the mobile app from your agency's source (MDM or app store).</li>
            <li>Sign in with the same account and enable biometrics for quick unlocks.</li>
            <li>Try capturing a test photo and syncing it to confirm uploads work.</li>
          </ol>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Smartphone className="h-4 w-4" aria-hidden />
            Offline mode lets you keep working; sync will resume when you're back online.
          </div>
          <div className="mt-3">
            <Button asChild size="sm" variant="outline">
              <Link to="/docs/mobile">Mobile tips and offline safety</Link>
            </Button>
          </div>
        </Step>
      </section>

      <section className="mt-12 rounded-xl border border-border/80 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Need more help?</h2>
            <p className="text-sm text-muted-foreground">Reach support or browse troubleshooting for common login issues.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/docs/roles-and-permissions">Check my access</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/docs">Back to docs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-foreground">
      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
      <span>{text}</span>
    </div>
  );
}

function Step({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-xl border border-border/70 bg-card/90 p-5 shadow-xs">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Callout({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

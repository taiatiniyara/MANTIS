import type React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ClipboardList, FilePlus2, MessageSquare, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/docs/cases")({
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Workflows</p>
        <h1 className="text-3xl font-semibold">Create and manage cases</h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Capture the details, add evidence, and keep everyone aligned as work moves forward.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-foreground/5 px-3 py-1">Roles: Officers, Leaders</span>
          <span className="rounded-full bg-foreground/5 px-3 py-1">Supports web & mobile</span>
        </div>
      </header>

      <section id="create" className="mt-10 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Create a case</h2>
          <p className="text-sm text-muted-foreground">Use clear titles, precise locations, and ownership to speed up resolution.</p>
        </div>
        <Card className="border border-border/80 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FilePlus2 className="h-5 w-5 text-primary" aria-hidden />
              Steps
              </CardTitle>
            <CardDescription>Most cases take under two minutes to capture.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-foreground">
              <li>From the home page, select <strong>New case</strong>.</li>
              <li>Add a short, descriptive title and choose the correct category or template.</li>
              <li>Set the location (address or map pin) and add the date/time of the incident.</li>
              <li>Assign an owner and followers. If unsure, assign yourself and mention a leader.</li>
              <li>Click <strong>Create</strong> to save. You can continue editing afterward.</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section id="evidence" className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-primary" aria-hidden />
              Attach evidence
            </CardTitle>
            <CardDescription>Keep files small and clearly named.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <StepItem text="Drag and drop photos, PDFs, or video clips." />
            <StepItem text="Add a caption so reviewers know why the file matters." />
            <StepItem text="Use the mobile app to capture photos with location metadata." />
          </CardContent>
        </Card>
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
              Collaborate
            </CardTitle>
            <CardDescription>Keep conversation inside the case.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <StepItem text="Mention teammates with @ to request updates or reviews." />
            <StepItem text="Use comments for decisions; files for evidence." />
            <StepItem text="Watch the activity feed for status changes and assignments." />
          </CardContent>
        </Card>
      </section>

      <section id="status" className="mt-10">
        <Card className="border border-border/80 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" aria-hidden />
              Status and ownership
            </CardTitle>
            <CardDescription>Keep cases moving by keeping status and owners fresh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground">
            <ul className="space-y-2">
              <StepItem text="Use statuses like Open, In Progress, Waiting, Closed. Avoid leaving cases in draft." />
              <StepItem text="Leaders can reassign if someone is out; followers stay on for visibility." />
              <StepItem text="Add due dates for time-sensitive cases; they appear in views and reminders." />
            </ul>
            <Callout>
              Keep descriptions concise and factual. Sensitive data should live in attachments, not comments.
            </Callout>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Next up</h2>
          <p className="text-sm text-muted-foreground">Search, filters, and saved views make it easy to find your cases fast.</p>
        </div>
        <Button asChild>
          <Link to="/docs/search-and-filters">See search and filters</Link>
        </Button>
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
    <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground">
      <AlertCircle className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}
